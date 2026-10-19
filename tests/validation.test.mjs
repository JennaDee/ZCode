import test from "node:test";
import assert from "node:assert/strict";
import { validateAuthForm } from "../src/components/auth/validation.ts";

const form = (values) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
};

test("registration reports all required fields in focus order", () => {
  assert.deepEqual(
    Object.keys(validateAuthForm("register", form({ name: "  " }))),
    ["name", "email", "password", "confirm"],
  );
});

test("registration rejects 11 characters and accepts the 12-character boundary", () => {
  const values = {
    name: "Sample Learner",
    email: "sample@example.com",
    password: "a".repeat(11),
    confirm: "a".repeat(11),
  };
  assert.equal(
    validateAuthForm("register", form(values)).password,
    "Use at least 12 characters.",
  );
  assert.deepEqual(
    validateAuthForm(
      "register",
      form({ ...values, password: "a".repeat(12), confirm: "a".repeat(12) }),
    ),
    {},
  );
});

test("confirmation must match exactly, including whitespace", () => {
  const errors = validateAuthForm(
    "register",
    form({
      name: "Sample",
      email: "sample@example.com",
      password: "sample passphrase",
      confirm: "sample passphrase ",
    }),
  );
  assert.equal(errors.confirm, "Passwords must match.");
});

test("login validates required input without enforcing new-account password policy", () => {
  assert.deepEqual(
    validateAuthForm(
      "login",
      form({ email: "sample@example.com", password: "short" }),
    ),
    {},
  );
  assert.equal(
    validateAuthForm("login", form({ email: "sample@example.com" })).password,
    "Enter your password.",
  );
});

test("email validation rejects malformed input and trims surrounding whitespace", () => {
  for (const email of [
    "sample",
    "sample@",
    "@example.com",
    "a b@example.com",
    "a@example",
  ]) {
    assert.equal(
      validateAuthForm("reset", form({ email })).email,
      "Enter a valid email address.",
    );
  }
  assert.deepEqual(
    validateAuthForm("reset", form({ email: " sample@example.com " })),
    {},
  );
});

test("password recovery requires only email and never mutates submitted data", () => {
  const data = form({ email: "sample@example.com" });
  assert.deepEqual(validateAuthForm("reset", data), {});
  assert.deepEqual([...data], [["email", "sample@example.com"]]);
});
