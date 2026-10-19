import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { LoadingIndicator } from "../ui/LoadingIndicator";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.loading)
    return (
      <main id="main-content" tabIndex={-1} className="not-found shell">
        <LoadingIndicator label="Checking your session" />
      </main>
    );
  if (!auth.user) return <Navigate to="/login" replace />;
  if (auth.recovery) return <Navigate to="/reset-password" replace />;
  return children;
}
