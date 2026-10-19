// Matches the project policy confirmed by its owner. Supabase remains authoritative.
export const MIN_PASSWORD_LENGTH = 8;
export const passwordRules = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "At least one number",
    test: (value: string) => /[0-9]/.test(value),
  },
];
export function meetsPasswordPolicy(value: string) {
  return passwordRules.every((rule) => rule.test(value));
}
export function passwordFeedback(value: string) {
  if (!value) return "Enter a password";
  if (!meetsPasswordPolicy(value)) return "Needs improvement";
  return value.length >= 14
    ? "Longer password · requirements met"
    : "Requirements met · use a longer passphrase for more strength";
}
