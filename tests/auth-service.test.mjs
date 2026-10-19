import test from "node:test";
import assert from "node:assert/strict";
import {
  createAuthService,
  authErrorMessage,
  AuthSetupError,
} from "../src/services/auth-service.ts";
import { readAuthConfig } from "../src/lib/auth-config.ts";
function setup(overrides = {}) {
  const calls = [];
  const auth = {
    getUser: async () => ({
      data: { user: { id: "recovery-user" } },
      error: null,
    }),
    signUp: async (args) => {
      calls.push(["signUp", args]);
      return { data: { session: null, user: {} }, error: null };
    },
    signInWithPassword: async (args) => {
      calls.push(["login", args]);
      return {
        data: { session: {}, user: { email_confirmed_at: "2026-01-01" } },
        error: null,
      };
    },
    resetPasswordForEmail: async (...args) => {
      calls.push(["reset", ...args]);
      return { error: null };
    },
    updateUser: async (args) => {
      calls.push(["update", args]);
      return { error: null };
    },
    signOut: async (args) => {
      calls.push(["logout", args]);
      return { error: null };
    },
    ...overrides,
  };
  return {
    calls,
    service: createAuthService({ auth }, "https://zcode.example", async () => {
      calls.push(["settings"]);
    }),
  };
}
test("registration sends metadata and a fixed callback, without creating app access", async () => {
  const { service, calls } = setup();
  const result = await service.register(
    "Sample",
    "sample@example.com",
    "Abcdef12",
  );
  assert.deepEqual(calls[0], ["settings"]);
  assert.deepEqual(calls[1], [
    "signUp",
    {
      email: "sample@example.com",
      password: "Abcdef12",
      options: {
        data: { display_name: "Sample" },
        emailRedirectTo: "https://zcode.example/auth/callback",
      },
    },
  ]);
  assert.equal(result.title, "Check your email");
});
test("existing-account responses share the same neutral confirmation", async () => {
  const normal = await setup().service.register(
    "Sample",
    "sample@example.com",
    "Abcdef12",
  );
  for (const response of [
    { data: { session: null, user: { identities: [] } }, error: null },
    { data: {}, error: { code: "user_already_exists" } },
  ]) {
    const result = await setup({
      signUp: async () => response,
    }).service.register("Sample", "sample@example.com", "Abcdef12");
    assert.deepEqual(result, normal);
  }
});
test("confirmation misconfiguration stops registration before signUp", async () => {
  let called = false;
  const service = createAuthService(
    {
      auth: {
        signUp: async () => {
          called = true;
        },
      },
    },
    "https://zcode.example",
    async () => {
      throw new AuthSetupError("Confirm email required");
    },
  );
  await assert.rejects(
    service.register("Sample", "sample@example.com", "Abcdef12"),
    /Confirm email/,
  );
  assert.equal(called, false);
});
test("unexpected auto-confirmed signup session is signed out and not shown as email success", async () => {
  const { service, calls } = setup({
    signUp: async () => ({ data: { session: {} }, error: null }),
  });
  await assert.rejects(
    service.register("Sample", "sample@example.com", "Abcdef12"),
    /Email confirmation/,
  );
  assert.ok(calls.some(([name]) => name === "logout"));
});
test("sign-in rejects an unconfirmed user and preserves backend credential errors", async () => {
  const { service, calls } = setup({
    signInWithPassword: async () => ({
      data: { session: {}, user: {} },
      error: null,
    }),
  });
  await assert.rejects(
    service.login("sample@example.com", "Abcdef12"),
    /confirm your email/,
  );
  assert.ok(calls.some(([name]) => name === "logout"));
  const error = { code: "invalid_credentials" };
  await assert.rejects(
    setup({
      signInWithPassword: async () => ({ data: {}, error }),
    }).service.login("sample@example.com", "wrong"),
    (e) => e === error,
  );
});
test("reset and password update use real SDK methods and only return success after acceptance", async () => {
  const { service, calls } = setup();
  await service.requestReset("sample@example.com");
  await service.updatePassword("NewPass12", "recovery-user");
  assert.deepEqual(calls[0], [
    "reset",
    "sample@example.com",
    { redirectTo: "https://zcode.example/auth/callback" },
  ]);
  assert.deepEqual(calls[1], ["update", { password: "NewPass12" }]);
  await assert.rejects(
    setup({
      updateUser: async () => ({ error: { code: "weak_password" } }),
    }).service.updatePassword("bad", "recovery-user"),
  );
});
test("friendly errors never echo raw backend details", () => {
  assert.doesNotMatch(
    authErrorMessage({ message: "private@example.com secret" }),
    /private|secret/,
  );
  assert.match(
    authErrorMessage({ code: "weak_password" }),
    /Supabase rejected/,
  );
  assert.match(
    authErrorMessage({ code: "over_email_send_rate_limit" }),
    /wait/,
  );
});
test("configuration rejects missing, privileged, and non-HTTPS remote credentials", () => {
  assert.throws(() => readAuthConfig(), /not configured/);
  assert.throws(
    () => readAuthConfig("https://project.supabase.co", "sb_secret_do-not-use"),
    /publishable/,
  );
  assert.throws(
    () => readAuthConfig("https://project.supabase.co", "ey.legacy.jwt"),
    /publishable/,
  );
  assert.throws(
    () => readAuthConfig("http://project.supabase.co", "sb_publishable_test"),
    /HTTPS/,
  );
  assert.deepEqual(
    readAuthConfig("https://project.supabase.co", "sb_publishable_test"),
    { url: "https://project.supabase.co", key: "sb_publishable_test" },
  );
});

test("resend uses signup verification and a fixed local callback, propagating rate limits", async () => {
  let request;
  const { service } = setup({
    resend: async (args) => {
      request = args;
      return { error: null };
    },
  });
  const result = await service.resendConfirmation("sample@example.com");
  assert.deepEqual(request, {
    type: "signup",
    email: "sample@example.com",
    options: { emailRedirectTo: "https://zcode.example/auth/callback" },
  });
  assert.equal(result.title, "Check your email");
  const error = { code: "over_email_send_rate_limit", status: 429 };
  await assert.rejects(
    setup({ resend: async () => ({ error }) }).service.resendConfirmation(
      "sample@example.com",
    ),
    (e) => e === error,
  );
});

test("password update rejects expired or changed identities before mutation", async () => {
  for (const result of [
    { data: { user: null }, error: { code: "session_not_found" } },
    { data: { user: { id: "another-user" } }, error: null },
  ]) {
    const { service, calls } = setup({ getUser: async () => result });
    await assert.rejects(service.updatePassword("NewPass12", "recovery-user"));
    assert.ok(!calls.some(([name]) => name === "update"));
  }
});
test("failed reset requests never return an email confirmation", async () => {
  for (const code of ["over_email_send_rate_limit", "unexpected_failure"]) {
    await assert.rejects(
      setup({
        resetPasswordForEmail: async () => ({ error: { code } }),
      }).service.requestReset("sample@example.com"),
    );
  }
});
