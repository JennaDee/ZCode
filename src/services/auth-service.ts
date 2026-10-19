import type { SupabaseClient } from "@supabase/supabase-js";

export class AuthSetupError extends Error {}
export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthSetupError) return error.message;
  const code =
    typeof error === "object" && error
      ? (error as { code?: string }).code
      : undefined;
  switch (code) {
    case "invalid_credentials":
    case "email_not_confirmed":
      return "Unable to sign in. Check your email and password, and confirm your email before trying again.";
    case "weak_password":
      return "Supabase rejected this password. Use a longer, less common password that meets every requirement. The project may enforce additional password protections.";
    case "same_password":
      return "Choose a different password from the one currently in use.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many requests. Please wait a few minutes before trying again.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Email registration is currently unavailable. Please try again later.";
    case "session_not_found":
    case "refresh_token_not_found":
    case "refresh_token_already_used":
      return "Your session is no longer valid. Request a fresh password reset link or sign in again.";
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier":
      return "This link is expired, already used, or opened in a different browser. Request a new link and open it in the browser where you started.";
    default:
      return "We couldn’t complete that request. Check your connection and try again. If it continues, please contact support.";
  }
}
export type AuthResult = { title: string; message: string };
const registrationResult: AuthResult = {
  title: "Check your email",
  message:
    "If this address is eligible for registration, check its inbox and spam folder for a confirmation link. Open it in this browser to verify your email. If you already have an account, log in or reset your password.",
};
export function createAuthService(
  client: SupabaseClient,
  origin: string,
  checkRegistrationSettings: () => Promise<void>,
) {
  return {
    async register(
      name: string,
      email: string,
      password: string,
    ): Promise<AuthResult> {
      await checkRegistrationSettings();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      // Do not expose account existence through either explicit or obfuscated responses.
      if (
        error?.code === "user_already_exists" ||
        error?.code === "email_exists"
      )
        return registrationResult;
      if (error) throw error;
      if (data.session) {
        await client.auth.signOut({ scope: "local" });
        throw new AuthSetupError(
          "Email confirmation is not configured as expected. Please enable Confirm email in Supabase before registering.",
        );
      }
      return registrationResult;
    },
    async login(email: string, password: string): Promise<AuthResult> {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.session || !data.user?.email_confirmed_at) {
        await client.auth.signOut({ scope: "local" });
        throw new AuthSetupError(
          "Please confirm your email before signing in.",
        );
      }
      return {
        title: "Signed in",
        message:
          "You’re signed in to ZCode. Your learning workspace will arrive in a later milestone.",
      };
    },
    async resendConfirmation(email: string): Promise<AuthResult> {
      const { error } = await client.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) throw error;
      return registrationResult;
    },
    async requestReset(email: string): Promise<AuthResult> {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback`,
      });
      if (error) throw error;
      return {
        title: "Check your email",
        message:
          "If an account is associated with this address, you’ll receive password reset instructions. Open the link in this browser. Check your spam folder too.",
      };
    },
    async updatePassword(
      password: string,
      recoveryUserId: string,
    ): Promise<AuthResult> {
      // Recovery intent is checked by the provider/UI; verify the current identity
      // with Auth immediately before the mutation as the session may have changed.
      const { data, error: identityError } = await client.auth.getUser();
      if (identityError) throw identityError;
      if (!recoveryUserId || !data.user || data.user.id !== recoveryUserId)
        throw new AuthSetupError(
          "Your recovery session is no longer valid. Request a new reset link.",
        );
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      return {
        title: "Password updated",
        message:
          "Your new password has been saved. Return to Log In to sign in with your new password.",
      };
    },
  };
}
