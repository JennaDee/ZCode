import test from "node:test";
import assert from "node:assert/strict";
import { completeAuthRedirect } from "../src/services/auth-callback.ts";
function mock(event = "SIGNED_IN", error = null) {
  let listener;
  const calls = [];
  const client = {
    auth: {
      onAuthStateChange: (fn) => {
        listener = fn;
        return {
          data: {
            subscription: { unsubscribe: () => calls.push("unsubscribe") },
          },
        };
      },
      exchangeCodeForSession: async (code) => {
        calls.push(code);
        if (!error) listener(event);
        return { error };
      },
    },
  };
  return { client, calls };
}
test("verified SDK recovery event enables reset and scrubs the callback URL", async () => {
  const { client, calls } = mock("PASSWORD_RECOVERY");
  const result = await completeAuthRedirect(
    client,
    new URL("https://zcode.example/auth/callback?code=one-use"),
    () => calls.push("scrub"),
  );
  assert.deepEqual(result, { recovery: true, callbackComplete: true });
  assert.deepEqual(calls, ["one-use", "unsubscribe", "scrub"]);
});
test("query flags do not grant recovery mode", async () => {
  const { client } = mock();
  assert.deepEqual(
    await completeAuthRedirect(
      client,
      new URL("https://zcode.example/auth/callback?code=one-use&type=recovery"),
      () => {},
    ),
    { recovery: false, callbackComplete: true },
  );
});
test("invalid, missing and expired codes never show verification success", async () => {
  for (const path of [
    "/auth/callback",
    "/auth/callback?error=access_denied&error_description=untrusted",
  ]) {
    const { client, calls } = mock();
    await assert.rejects(
      completeAuthRedirect(
        client,
        new URL("https://zcode.example" + path),
        () => calls.push("scrub"),
      ),
      /invalid or expired/,
    );
    assert.deepEqual(calls, ["scrub"]);
  }
  const { client, calls } = mock("SIGNED_IN", { code: "flow_state_expired" });
  await assert.rejects(
    completeAuthRedirect(
      client,
      new URL("https://zcode.example/auth/callback?code=expired"),
      () => calls.push("scrub"),
    ),
    /expired/,
  );
  assert.deepEqual(calls, ["expired", "unsubscribe", "scrub"]);
});
test("ordinary routes do not exchange codes or scrub the page", async () => {
  const { client, calls } = mock();
  assert.deepEqual(
    await completeAuthRedirect(
      client,
      new URL("https://zcode.example/register"),
      () => calls.push("scrub"),
    ),
    { recovery: false, callbackComplete: false },
  );
  assert.deepEqual(calls, []);
});

test("callback forwards the SDK flow identifier for concurrent PKCE requests", async () => {
  let received;
  const { client } = mock();
  client.auth.exchangeCodeForSession = async (...args) => {
    received = args;
    return { error: null };
  };
  await completeAuthRedirect(
    client,
    new URL(
      "https://zcode.example/auth/callback?code=one-use&sb_flow_id=flow-id",
    ),
    () => {},
  );
  assert.deepEqual(received, ["one-use", { flowId: "flow-id" }]);
});

test("callback ignores supplied external redirect destinations and does not reflect error text", async () => {
  const { client } = mock();
  const result = await completeAuthRedirect(client, new URL("https://zcode.example/auth/callback?code=one-use&next=https://untrusted.example&redirect_to=//untrusted.example"), () => {});
  assert.deepEqual(result, {recovery:false, callbackComplete:true});
  await assert.rejects(completeAuthRedirect(client, new URL("https://zcode.example/auth/callback?error=access_denied&error_description=private-token"), () => {}), error => !error.message.includes("private-token"));
});
