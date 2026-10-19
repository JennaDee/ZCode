import { Link } from "react-router";
import { Info } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ZCodeLogo } from "../branding/ZCodeLogo";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import type { AuthMode } from "./validation";

const content = {
  login: {
    title: "Welcome back, coder!",
    subtitle: "Continue your coding journey.",
    prompt: "New to ZCode?",
    link: "Sign Up",
    to: "/register",
  },
  register: {
    title: "Your coding journey starts here.",
    subtitle:
      "Create an account and take your first step toward learning to code.",
    prompt: "Already have an account?",
    link: "Log In",
    to: "/login",
  },
  reset: {
    title: "Reset your password",
    subtitle:
      "Enter your email address to receive password reset instructions.",
    prompt: "Remember your password?",
    link: "Back to Login",
    to: "/login",
  },
};
export function AuthCard({ mode }: { mode: AuthMode }) {
  const copy = content[mode];
  const Form = {
    login: LoginForm,
    register: SignupForm,
    reset: ForgotPasswordForm,
  }[mode];
  return (
    <GlassCard className="auth-card" aria-labelledby="auth-title">
      <div className="auth-brand">
        <ZCodeLogo />
      </div>
      <h2 id="auth-title">{copy.title}</h2>
      <p className="auth-subtitle">{copy.subtitle}</p>
      <div className="preview-notice">
        <Info aria-hidden="true" size={17} />
        <p>
          {mode === "reset"
            ? "Password recovery will be connected in a future milestone. This preview does not send email."
            : "Interface preview. Accounts and authentication aren’t connected yet. Please use sample details."}
        </p>
      </div>
      <Form />
      <p className="auth-switch">
        {copy.prompt} <Link to={copy.to}>{copy.link}</Link>
      </p>
    </GlassCard>
  );
}
