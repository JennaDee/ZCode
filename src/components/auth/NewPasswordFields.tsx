import { useState } from "react";
import { FormInput } from "../ui/FormInput";
import { MIN_PASSWORD_LENGTH } from "./password-policy";
import { PasswordRequirements } from "./PasswordRequirements";
import type { FieldErrors } from "./validation";

export function NewPasswordFields({
  errors,
  updating = false,
}: {
  errors: FieldErrors;
  updating?: boolean;
}) {
  const [password, setPassword] = useState("");
  return (
    <>
      <FormInput
        id="password"
        name="password"
        type="password"
        label={updating ? "New password" : "Password"}
        autoComplete="new-password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        minLength={MIN_PASSWORD_LENGTH}
        required
        error={errors.password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        aria-describedby="password-requirements"
      />
      <PasswordRequirements password={password} />
      <FormInput
        id="confirm"
        name="confirm"
        type="password"
        label={updating ? "Confirm new password" : "Confirm password"}
        visibilityLabel="confirmed password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        required
        error={errors.confirm}
      />
    </>
  );
}
