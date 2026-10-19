import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { authConfigError, supabase } from "../lib/supabase";
import { completeAuthRedirect } from "../services/auth-callback";
import { authErrorMessage } from "../services/auth-service";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  recovery: boolean;
  callbackComplete: boolean;
};
const initial: AuthState = {
  user: null,
  loading: true,
  error: authConfigError,
  recovery: false,
  callbackComplete: false,
};
const Context = createContext<
  (AuthState & { finishRecovery: () => void }) | null
>(null);
let startup:
  Promise<{ recovery: boolean; callbackComplete: boolean }> | undefined;
function initialize() {
  // React StrictMode can mount twice: exchange a single-use PKCE code only once.
  return (startup ??= (async () => {
    if (!supabase)
      throw new Error(authConfigError ?? "Authentication is not configured.");
    return completeAuthRedirect(supabase, new URL(window.location.href), () => {
      window.history.replaceState(window.history.state, "", "/auth/callback");
    });
  })());
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initial);
  useEffect(() => {
    if (!supabase) {
      setState({ ...initial, loading: false });
      return;
    }
    const client = supabase;
    let active = true;
    let sequence = 0;
    let ready = false;
    let lastToken: string | undefined;
    let lastUserId: string | undefined;
    let scheduled: ReturnType<typeof setTimeout> | undefined;
    async function refresh() {
      const current = ++sequence;
      try {
        const {
          data: { session },
          error,
        } = await client.auth.getSession();
        if (error) throw error;
        let user: User | null = null;
        if (session) {
          const result = await client.auth.getUser();
          if (result.error) throw result.error;
          user = result.data.user?.email_confirmed_at ? result.data.user : null;
        }
        if (active && current === sequence) {
          lastToken = session?.access_token;
          lastUserId = user?.id;
          setState((prev) => ({
            ...prev,
            user,
            loading: false,
            error: null,
            recovery: user ? prev.recovery : false,
          }));
        }
      } catch (error) {
        if (active && current === sequence)
          setState((prev) => ({
            ...prev,
            user: null,
            loading: false,
            error: authErrorMessage(error),
            recovery: false,
          }));
      }
    }
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        sequence++;
        lastToken = undefined;
        lastUserId = undefined;
        clearTimeout(scheduled);
        if (active)
          setState((prev) => ({
            ...prev,
            user: null,
            recovery: false,
            callbackComplete: false,
            loading: false,
            error: null,
          }));
      } else if (
        ready &&
        (event === "USER_UPDATED" || session?.access_token !== lastToken)
      ) {
        sequence++;
        if (active && (!lastUserId || session?.user.id !== lastUserId))
          setState((prev) => ({
            ...prev,
            user: null,
            loading: true,
            recovery: false,
            callbackComplete: false,
          }));
        clearTimeout(scheduled);
        // Leave the SDK's auth lock before calling another auth method.
        scheduled = setTimeout(() => {
          if (active) void refresh();
        }, 0);
      }
    });
    void initialize()
      .then(async (result) => {
        if (!active) return;
        setState((prev) => ({ ...prev, ...result }));
        ready = true;
        await refresh();
      })
      .catch((error) => {
        ready = true;
        if (active)
          setState({
            ...initial,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to initialize authentication.",
          });
      });
    return () => {
      active = false;
      sequence++;
      clearTimeout(scheduled);
      subscription.unsubscribe();
    };
  }, []);
  return (
    <Context.Provider
      value={{
        ...state,
        finishRecovery: () =>
          setState((prev) => ({ ...prev, recovery: false })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider is required.");
  return value;
}
