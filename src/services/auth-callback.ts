import type { SupabaseClient } from "@supabase/supabase-js";
import { authErrorMessage } from "./auth-service.ts";

/** Only the SDK's recovery event can enable password-update UI; URL flags cannot. */
export async function completeAuthRedirect(
  client: SupabaseClient,
  url: URL,
  scrubUrl: () => void,
) {
  if (url.pathname !== "/auth/callback")
    return { recovery: false, callbackComplete: false };
  try {
    const hash = new URLSearchParams(url.hash.slice(1));
    const code = url.searchParams.get("code");
    if (url.searchParams.has("error") || hash.has("error") || !code)
      throw new Error(
        "This link is invalid or expired. Request a new link and open it in the same browser.",
      );
    let recovery = false;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") recovery = true;
    });
    try {
      const flowId = url.searchParams.get("sb_flow_id");
      const { error } = await client.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined,
      );
      if (error) throw new Error(authErrorMessage(error));
      return { recovery, callbackComplete: true };
    } finally {
      subscription.unsubscribe();
    }
  } finally {
    scrubUrl();
  }
}
