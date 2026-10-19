import { AuthCard } from "../components/auth/AuthCard";
import type { AuthMode } from "../components/auth/validation";
import { IntroCarousel } from "../components/landing/IntroCarousel";

export function LandingPage({ mode = "login" }: { mode?: AuthMode }) {
  return (
    <main id="main-content" tabIndex={-1} className="landing-layout shell">
      <IntroCarousel />
      <div className="auth-region">
        <AuthCard key={mode} mode={mode} />
      </div>
    </main>
  );
}
