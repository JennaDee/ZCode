import { Button } from "../components/ui/Button";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { readProfile } from "../services/profiles";
import type { Profile } from "../services/profiles";
import { useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/ui/GlassCard";
import { ZCodeLogo } from "../components/branding/ZCodeLogo";
import { SessionPanel } from "../components/auth/SessionPanel";

export function DashboardPage() {
  const { user } = useAuth();
  const { state } = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setProfile(null);
    setProfileError(false);
    if (supabase && user)
      void readProfile(supabase, user.id, controller.signal)
        .then((value) => {
          if (!controller.signal.aborted) {
            setProfile(value);
            setProfileError(!value);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setProfileError(true);
        });
    return () => controller.abort();
  }, [user?.id, attempt]);
  const name =
    profile?.id === user?.id
      ? profile?.display_name
      : user?.user_metadata?.display_name;
  return (
    <main id="main-content" tabIndex={-1} className="dashboard-layout shell">
      <GlassCard className="auth-card">
        <div className="auth-brand">
          <ZCodeLogo />
        </div>
        {state?.verified && (
          <p className="form-notice" role="status">
            Your email is verified. Welcome to ZCode.
          </p>
        )}
        <h1>
          Welcome
          {typeof name === "string" && name.trim()
            ? `, ${name.trim()}`
            : ", coder"}
          !
        </h1>
        <p className="auth-subtitle">
          Your learning dashboard is coming in a future milestone.
        </p>
        {profileError && (
          <div className="form-notice" role="status">
            <p>Your profile could not be loaded. You’re still signed in.</p>
            <Button secondary onClick={() => setAttempt((value) => value + 1)}>
              Retry profile
            </Button>
          </div>
        )}
        <SessionPanel />
      </GlassCard>
    </main>
  );
}
