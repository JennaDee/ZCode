import { useAuth } from "../context/AuthContext";
import { AuthCard } from "../components/auth/AuthCard";
import { GlassCard } from "../components/ui/GlassCard";
import { ZCodeLogo } from "../components/branding/ZCodeLogo";
import { ButtonLink } from "../components/ui/Button";
import { LoadingIndicator } from "../components/ui/LoadingIndicator";
import { IntroCarousel } from "../components/landing/IntroCarousel";

export function ResetPasswordPage() {
  const auth = useAuth();
  return (
    <main id="main-content" tabIndex={-1} className="landing-layout shell">
      <IntroCarousel />
      <div className="auth-region">
        {!auth.loading && auth.user && auth.recovery ? (
          <AuthCard mode="update" />
        ) : (
          <GlassCard className="auth-card" aria-labelledby="auth-title">
            <div className="auth-brand">
              <ZCodeLogo />
            </div>
            <h1 id="auth-title">Reset your password</h1>
            {auth.loading ? (
              <LoadingIndicator label="Checking your recovery session" />
            ) : (
              <>
                <p className="form-notice" role="alert">
                  {auth.error ??
                    "Open a fresh password reset link in the browser where you requested it. This page requires a verified recovery session."}
                </p>
                <ButtonLink to="/forgot-password" className="auth-submit">
                  Request a reset link
                </ButtonLink>
                <ButtonLink to="/login" secondary className="auth-submit">
                  Back to Log In
                </ButtonLink>
              </>
            )}
          </GlassCard>
        )}
      </div>
    </main>
  );
}
