import { AuthForm } from "./AuthForm";
import { NewPasswordFields } from "./NewPasswordFields";
export function UpdatePasswordForm() {
  return (
    <AuthForm mode="update" submitLabel="Save New Password">
      {(errors) => <NewPasswordFields errors={errors} updating />}
    </AuthForm>
  );
}
