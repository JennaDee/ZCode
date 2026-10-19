import { FormInput } from "../ui/FormInput";
import { AuthForm } from "./AuthForm";
import { NewPasswordFields } from "./NewPasswordFields";

export function SignupForm() {
  return (
    <AuthForm mode="register" submitLabel="Create Account">
      {(errors) => (
        <>
          <FormInput
            id="name"
            name="name"
            label="Display name"
            autoComplete="nickname"
            placeholder="Jenna Dee"
            required
            error={errors.name}
          />
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            placeholder="jenna@example.com"
            required
            error={errors.email}
          />
          <NewPasswordFields errors={errors} />
        </>
      )}
    </AuthForm>
  );
}
