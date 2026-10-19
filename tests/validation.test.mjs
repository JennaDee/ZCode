import test from "node:test";
import assert from "node:assert/strict";
import { validateAuthForm } from "../src/components/auth/validation.ts";
import {
  passwordRules,
  passwordFeedback,
} from "../src/components/auth/password-policy.ts";
const form = (values) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};
const valid = {
  name: "Sample",
  email: "sample@example.com",
  password: "Abcdef12",
  confirm: "Abcdef12",
};
test("registration reports required fields in focus order", () =>
  assert.deepEqual(
    Object.keys(validateAuthForm("register", form({ name: "  " }))),
    ["name", "email", "password", "confirm"],
  ));
test("8-character policy applies to signup and password update", () => {
  for (const mode of ["register", "update"]) {
    assert.deepEqual(validateAuthForm(mode, form(valid)), {});
    for (const password of ["Abcde12", "abcdef12", "ABCDEF12", "Abcdefgh"])
      assert.ok(
        validateAuthForm(mode, form({ ...valid, password, confirm: password }))
          .password,
      );
  }
});
test("confirmation must match exactly and long passwords are accepted", () => {
  assert.equal(
    validateAuthForm(
      "register",
      form({ ...valid, confirm: valid.password + " " }),
    ).confirm,
    "Passwords must match.",
  );
  const password = "Ab1" + " words ".repeat(100);
  assert.deepEqual(
    validateAuthForm(
      "register",
      form({ ...valid, password, confirm: password }),
    ),
    {},
  );
});
test("login does not enforce new-password policy", () =>
  assert.deepEqual(
    validateAuthForm("login", form({ email: valid.email, password: "short" })),
    {},
  ));
test("email format and whitespace are handled consistently", () => {
  for (const email of [
    "sample",
    "sample@",
    "@example.com",
    "a b@example.com",
    "a@example",
  ])
    assert.equal(
      validateAuthForm("reset", form({ email })).email,
      "Enter a valid email address.",
    );
  assert.deepEqual(
    validateAuthForm("reset", form({ email: " sample@example.com " })),
    {},
  );
});
test("update does not require email and reset does not require a password", () => {
  assert.deepEqual(
    validateAuthForm(
      "update",
      form({ password: valid.password, confirm: valid.password }),
    ),
    {},
  );
  assert.deepEqual(validateAuthForm("reset", form({ email: valid.email })), {});
});
test("feedback reflects unmet requirements without claiming security guarantees", () => {
  assert.equal(passwordRules.filter((rule) => rule.test("abc")).length, 1);
  assert.match(passwordFeedback("abc"), /Needs improvement/);
  assert.match(passwordFeedback(valid.password), /Requirements met/);
});
