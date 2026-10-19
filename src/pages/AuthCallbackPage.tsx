import { Navigate } from "react-router";
import { ResendConfirmation } from "../components/auth/ResendConfirmation";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/ui/GlassCard";
import { ButtonLink } from "../components/ui/Button";
import { LoadingIndicator } from "../components/ui/LoadingIndicator";
import { ZCodeLogo } from "../components/branding/ZCodeLogo";
import { IntroCarousel } from "../components/landing/IntroCarousel";
import { AuthCard } from "../components/auth/AuthCard";

export function AuthCallbackPage() {
  const auth = useAuth();
  if (!auth.loading && !auth.error && auth.user && auth.recovery)
    return <Navigate to="/reset-password" replace />;
  if (
    !auth.loading &&
    !auth.error &&
    auth.callbackComplete &&
    auth.user &&
    !auth.recovery
  )
    return <Navigate to="/dashboard" replace state={{ verified: true }} />;
  return (
    <main id="main-content" tabIndex={-1} className="landing-layout shell">
      <IntroCarousel />
      <div className="auth-region">
        {!auth.loading && !auth.error && auth.callbackComplete && auth.user ? (
          <AuthCard mode={auth.recovery ? "update" : "login"} />
        ) : (
          <GlassCard className="auth-card" aria-labelledby="auth-title">
            <div className="auth-brand">
              <ZCodeLogo />
            </div>
            <h2 id="auth-title">
              {auth.loading ? "Checking your link…" : "Let’s try that again"}
            </h2>
            {auth.loading ? (
              <div className="form-notice">
                <LoadingIndicator label="Verifying authentication link" />
              </div>
            ) : (
              <>
                <p className="form-notice" role="alert">
                  {auth.error ??
                    "This link cannot be verified. It may be expired, already used, or opened in another browser. Request a new link."}
                </p>
                <ResendConfirmation />
                <ButtonLink to="/login" className="auth-submit">
                  Back to Log In
                </ButtonLink>
                <ButtonLink
                  secondary
                  to="/forgot-password"
                  className="auth-submit"
                >
                  Request a reset link
                </ButtonLink>
              </>
            )}
          </GlassCard>
        )}
      </div>
    </main>
  );
}
