import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { ResendConfirmation } from "./ResendConfirmation";
import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { validateAuthForm } from "./validation";
import type { AuthMode, FieldErrors } from "./validation";
import { authConfigError } from "../../lib/supabase";
import { authService } from "../../services/auth";
import { authErrorMessage } from "../../services/auth-service";
import type { AuthResult } from "../../services/auth-service";
import { useAuth } from "../../context/AuthContext";

export function AuthForm({
  mode,
  submitLabel,
  children,
}: {
  mode: AuthMode;
  submitLabel: string;
  children: (errors: FieldErrors) => ReactNode;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  async function returnToLogin() {
    if (!supabase || inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setRequestError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      auth.finishRecovery();
      navigate("/login", { replace: true });
    } catch (error) {
      setRequestError(authErrorMessage(error));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const inFlight = useRef(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || !authService || auth.loading) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = validateAuthForm(mode, data);
    setErrors(next);
    setRequestError(null);
    const first = Object.keys(next)[0];
    if (first) {
      const field = form.elements.namedItem(first);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    inFlight.current = true;
    setPending(true);
    try {
      const email = String(data.get("email") ?? "").trim();
      const password = String(data.get("password") ?? "");
      let response: AuthResult;
      if (mode === "register")
        response = await authService.register(
          String(data.get("name") ?? "").trim(),
          email,
          password,
        );
      else if (mode === "login")
        response = await authService.login(email, password);
      else if (mode === "reset")
        response = await authService.requestReset(email);
      else {
        if (!auth.user || !auth.recovery)
          throw new Error("A verified recovery session is required.");
        response = await authService.updatePassword(password, auth.user.id);
        // Keep the result visible until Continue or sign-out clears recovery mode.
      }
      setConfirmationEmail(email);
      form.reset();
      setResult(response);
      requestAnimationFrame(() => noticeRef.current?.focus());
    } catch (error) {
      setRequestError(authErrorMessage(error));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  if (result)
    return (
      <div className="form-notice" ref={noticeRef} tabIndex={-1} role="status">
        <Info size={19} aria-hidden="true" />
        <div>
          <h3>{result.title}</h3>
          <p>{result.message}</p>
          {mode === "register" && (
            <ResendConfirmation
              initialEmail={confirmationEmail}
              initiallyCooling
            />
          )}
          {requestError && (
            <p role="alert" className="error-message">
              {requestError}
            </p>
          )}
          {mode === "update" && (
            <Button
              secondary
              className="auth-submit"
              onClick={returnToLogin}
              loading={pending}
            >
              Return to Log In
            </Button>
          )}
        </div>
      </div>
    );
  return (
    <>
      <form
        onSubmit={submit}
        noValidate
        aria-labelledby="auth-title"
        aria-busy={pending}
      >
        <fieldset disabled={pending || !!authConfigError || auth.loading}>
          {children(errors)}
        </fieldset>
        {(requestError || authConfigError) && (
          <p className="form-notice error-message" role="alert">
            {requestError ?? authConfigError}
          </p>
        )}
        <Button
          className="auth-submit"
          type="submit"
          loading={pending}
          disabled={!!authConfigError || auth.loading}
        >
          {pending ? "Please wait…" : submitLabel}
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
      </form>
      {mode === "login" && <ResendConfirmation />}
    </>
  );
}
