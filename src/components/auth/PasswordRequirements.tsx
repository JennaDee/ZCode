import { Check, Circle } from "lucide-react";
import { passwordFeedback, passwordRules } from "./password-policy";

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <div id="password-requirements" className="password-requirements">
      <p className="field-hint">
        Password strength: {passwordFeedback(password)}
      </p>
      <ul>
        {passwordRules.map((rule) => (
          <li
            key={rule.id}
            className={rule.test(password) ? "requirement-met" : ""}
          >
            {rule.test(password) ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Circle size={12} aria-hidden="true" />
            )}
            <span className="sr-only">
              {rule.test(password) ? "Met: " : "Not met: "}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
      <p className="field-hint">
        Longer, unique passwords are safer. Supabase also checks your password
        on the server.
      </p>
    </div>
  );
}
