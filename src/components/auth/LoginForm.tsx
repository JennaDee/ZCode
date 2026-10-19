import { Link } from "react-router";
import { FormInput } from "../ui/FormInput";
import { PreviewForm } from "./PreviewForm";

export function LoginForm() {
  return (
    <PreviewForm mode="login" submitLabel="Log In">
      {(errors) => (
        <>
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
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            error={errors.password}
            labelAction={<Link to="/forgot-password">Forgot Password</Link>}
          />
        </>
      )}
    </PreviewForm>
  );
}
