import { authConfig, authConfigError, supabase } from "../lib/supabase";
import { AuthSetupError, createAuthService } from "./auth-service";

async function checkRegistrationSettings() {
  if (!authConfig)
    throw new AuthSetupError(
      authConfigError ?? "Authentication is not configured.",
    );
  const response = await fetch(`${authConfig.url}/auth/v1/settings`, {
    headers: { apikey: authConfig.key },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new AuthSetupError(
      "Unable to check registration settings. Please try again shortly.",
    );
  const settings = await response.json();
  if (settings.mailer_autoconfirm !== false)
    throw new AuthSetupError(
      "Registration requires email confirmation. Enable Confirm email in Supabase before registering.",
    );
  if (settings.disable_signup || !settings.external?.email)
    throw new AuthSetupError("Email registration is currently unavailable.");
}
export const authService = supabase
  ? createAuthService(
      supabase,
      window.location.origin,
      checkRegistrationSettings,
    )
  : null;
