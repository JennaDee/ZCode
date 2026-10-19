import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { validateAuthForm } from "./validation";
import type { AuthMode, FieldErrors } from "./validation";

/** Shared UI submission boundary. Never stores credentials or creates a session. */
export function PreviewForm({
  mode,
  submitLabel,
  children,
}: {
  mode: AuthMode;
  submitLabel: string;
  children: (errors: FieldErrors) => ReactNode;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const next = validateAuthForm(mode, new FormData(form));
    setErrors(next);
    setNotice(false);
    const firstError = Object.keys(next)[0];
    if (firstError) {
      const field = form.elements.namedItem(firstError);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    form.reset();
    setResetKey((key) => key + 1);
    setNotice(true);
  }
  return (
    <form
      onSubmit={submit}
      noValidate
      onChange={() => setNotice(false)}
      aria-labelledby="auth-title"
    >
      <div key={resetKey}>{children(errors)}</div>
      <Button className="auth-submit" type="submit">
        {submitLabel}
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
      <div role="status">
        {notice && (
          <div className="form-notice">
            <Info size={19} aria-hidden="true" />
            <p>
              Thanks for trying ZCode! Account authentication is not connected
              yet.{" "}
              {mode === "reset"
                ? "No reset email was sent."
                : mode === "register"
                  ? "No account was created."
                  : "You have not been signed in."}{" "}
              Authentication will be available in a future milestone.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
