import { LandingPage } from "./LandingPage";
import type { AuthMode } from "../components/auth/validation";

export function AuthPage({ mode }: { mode: AuthMode }) {
  return <LandingPage mode={mode} />;
}
