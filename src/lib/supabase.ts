import { createClient } from "@supabase/supabase-js";
import { readAuthConfig } from "./auth-config";

function configure() {
  try {
    const config = readAuthConfig(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    );
    return {
      client: createClient(config.url, config.key, {
        auth: {
          flowType: "pkce",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }),
      error: null,
      config,
    };
  } catch (error) {
    return {
      client: null,
      error:
        error instanceof Error
          ? error.message
          : "Authentication configuration is invalid.",
      config: null,
    };
  }
}
// A single client owns session storage and refresh for the entire application.
export const {
  client: supabase,
  error: authConfigError,
  config: authConfig,
} = configure();
