import { Link, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { UpdatePasswordForm } from "./UpdatePasswordForm";
import { SessionPanel } from "./SessionPanel";
import { LoadingIndicator } from "../ui/LoadingIndicator";
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
  const auth = useAuth();
  const copy = content[mode === "update" ? "reset" : mode];
  const signedIn = !!auth.user && !auth.recovery;
  const recovering = !!auth.user && auth.recovery;
  const Form = {
    login: LoginForm,
    register: SignupForm,
    reset: ForgotPasswordForm,
    update: UpdatePasswordForm,
  }[mode];
  if (!auth.loading && signedIn && mode === "login")
    return <Navigate to="/dashboard" replace />;
  return (
    <GlassCard className="auth-card" aria-labelledby="auth-title">
      <div className="auth-brand">
        <ZCodeLogo />
      </div>
      <h2 id="auth-title">
        {recovering
          ? "Choose a new password"
          : signedIn
            ? "Welcome back, coder!"
            : copy.title}
      </h2>
      <p className="auth-subtitle">
        {recovering
          ? "Save a strong, unique password for your account."
          : signedIn
            ? "You’re securely signed in."
            : copy.subtitle}
      </p>
      {auth.loading ? (
        <div className="form-notice">
          <LoadingIndicator label="Checking your session" /> Checking your
          session…
        </div>
      ) : (
        <>
          {auth.error && (
            <p role="alert" className="form-notice error-message">
              {auth.error}
            </p>
          )}
          {recovering ? (
            <UpdatePasswordForm />
          ) : signedIn ? (
            <SessionPanel />
          ) : (
            <Form />
          )}
        </>
      )}
      {!signedIn && !recovering && (
        <p className="auth-switch">
          {copy.prompt} <Link to={copy.to}>{copy.link}</Link>
        </p>
      )}
    </GlassCard>
  );
}
