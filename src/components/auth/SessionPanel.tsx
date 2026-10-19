import { useState } from "react";
import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { authErrorMessage } from "../../services/auth-service";

export function SessionPanel() {
  const { user } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function signOut() {
    if (pending || !supabase) return;
    setPending(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <p className="form-notice">
        Signed in as {user?.email}. Your learning workspace is coming in a later
        milestone.
      </p>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <Button
        secondary
        className="auth-submit"
        onClick={signOut}
        loading={pending}
      >
        Log Out
      </Button>
    </div>
  );
}
