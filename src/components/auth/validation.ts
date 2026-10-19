export type AuthMode = "login" | "register" | "reset";
export type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirm", string>
>;
export const MIN_PASSWORD_LENGTH = 12;

/** Prototype validation only. This does not authenticate or authorize anyone. */
export function validateAuthForm(mode: AuthMode, data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const password = String(data.get("password") ?? "");
  const confirm = String(data.get("confirm") ?? "");
  if (mode === "register" && !name) errors.name = "Enter your display name.";
  if (!email) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (mode !== "reset") {
    if (!password) errors.password = "Enter your password.";
    else if (mode === "register" && password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (mode === "register") {
    if (!confirm) errors.confirm = "Confirm your password.";
    else if (password !== confirm) errors.confirm = "Passwords must match.";
  }
  return errors;
}
