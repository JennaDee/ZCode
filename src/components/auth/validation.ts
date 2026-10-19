import { MIN_PASSWORD_LENGTH, meetsPasswordPolicy } from "./password-policy.ts";
export type AuthMode = "login" | "register" | "reset" | "update";
export type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirm", string>
>;

/** Client-side feedback only; Supabase also validates every request. */
export function validateAuthForm(mode: AuthMode, data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const password = String(data.get("password") ?? "");
  const confirm = String(data.get("confirm") ?? "");
  if (mode === "register" && !name) errors.name = "Enter your display name.";
  if (mode !== "update" && !email) errors.email = "Enter your email address.";
  else if (mode !== "update" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (mode !== "reset") {
    if (!password) errors.password = "Enter your password.";
    else if (
      (mode === "register" || mode === "update") &&
      password.length < MIN_PASSWORD_LENGTH
    )
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    else if (
      (mode === "register" || mode === "update") &&
      !meetsPasswordPolicy(password)
    )
      errors.password =
        "Include an uppercase letter, a lowercase letter, and a number.";
  }
  if (mode === "register" || mode === "update") {
    if (!confirm) errors.confirm = "Confirm your password.";
    else if (password !== confirm) errors.confirm = "Passwords must match.";
  }
  return errors;
}
