import { FormInput } from "../ui/FormInput";
import { AuthForm } from "./AuthForm";

export function ForgotPasswordForm() {
  return (
    <AuthForm mode="reset" submitLabel="Submit">
      {(errors) => (
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={errors.email}
        />
      )}
    </AuthForm>
  );
}
