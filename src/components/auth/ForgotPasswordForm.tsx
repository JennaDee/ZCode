import { FormInput } from "../ui/FormInput";
import { PreviewForm } from "./PreviewForm";

export function ForgotPasswordForm() {
  return (
    <PreviewForm mode="reset" submitLabel="Submit">
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
    </PreviewForm>
  );
}
