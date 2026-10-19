import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { authService } from "../../services/auth";
import { authErrorMessage } from "../../services/auth-service";
import { Button } from "../ui/Button";
import { FormInput } from "../ui/FormInput";

export function ResendConfirmation({
  initialEmail = "",
  initiallyCooling = false,
}: {
  initialEmail?: string;
  initiallyCooling?: boolean;
}) {
  const [until, setUntil] = useState(() =>
    initiallyCooling ? Date.now() + 60_000 : 0,
  );
  const [seconds, setSeconds] = useState(initiallyCooling ? 60 : 0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const inFlight = useRef(false);
  useEffect(() => {
    const tick = () =>
      setSeconds(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authService || inFlight.current || Date.now() < until) return;
    const email = String(
      new FormData(event.currentTarget).get("confirmation-email") ?? "",
    ).trim();
    inFlight.current = true;
    setPending(true);
    setMessage("");
    setUntil(Date.now() + 60_000);
    try {
      const result = await authService.resendConfirmation(email);
      setMessage(result.message);
    } catch (error) {
      const limited =
        typeof error === "object" &&
        error &&
        ((error as { status?: number }).status === 429 ||
          String((error as { code?: string }).code).includes("rate_limit"));
      if (limited) setUntil(Date.now() + 300_000);
      setMessage(authErrorMessage(error));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return (
    <details
      className="confirmation-resend"
      open={initialEmail ? true : undefined}
    >
      <summary>Need a confirmation email?</summary>
      <form onSubmit={submit} aria-busy={pending}>
        <FormInput
          name="confirmation-email"
          label="Confirmation email address"
          type="email"
          autoComplete="email"
          defaultValue={initialEmail}
          required
          disabled={pending}
        />
        <Button
          secondary
          type="submit"
          loading={pending}
          disabled={!authService || seconds > 0}
        >
          {seconds > 0 ? `Resend in ${seconds}s` : "Resend confirmation email"}
        </Button>
        {message && (
          <p className="form-notice" role="status">
            {message}
          </p>
        )}
      </form>
    </details>
  );
}
