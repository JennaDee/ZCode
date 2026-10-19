import { FormInput } from "../ui/FormInput";
import { PreviewForm } from "./PreviewForm";
import { MIN_PASSWORD_LENGTH } from "./validation";

export function SignupForm() {
  return (
    <PreviewForm mode="register" submitLabel="Create Account">
      {(errors) => (
        <>
          <FormInput
            id="name"
            name="name"
            label="Display name"
            autoComplete="nickname"
            placeholder="Alex Rivera"
            required
            error={errors.name}
          />
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
          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            minLength={MIN_PASSWORD_LENGTH}
            required
            error={errors.password}
            hint={`Use at least ${MIN_PASSWORD_LENGTH} characters. A longer passphrase of unrelated words is easier to remember. Avoid names and common phrases.`}
          />
          <FormInput
            id="confirm"
            name="confirm"
            type="password"
            label="Confirm password"
            visibilityLabel="confirmed password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            error={errors.confirm}
          />
        </>
      )}
    </PreviewForm>
  );
}
