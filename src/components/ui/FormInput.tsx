import { useId, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormInputProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  labelAction?: ReactNode;
  visibilityLabel?: string;
};

/** Native input semantics, associated hints/errors, and an optional password toggle. */
export function FormInput({
  id,
  label,
  error,
  hint,
  labelAction,
  visibilityLabel = "password",
  type = "text",
  "aria-describedby": describedBy,
  ...props
}: FormInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const description =
    [hint && `${inputId}-guidance`, error && `${inputId}-error`, describedBy]
      .filter(Boolean)
      .join(" ") || undefined;
  const input = (
    <input
      {...props}
      id={inputId}
      type={isPassword && visible ? "text" : type}
      aria-invalid={error ? true : undefined}
      aria-describedby={description}
    />
  );
  return (
    <div className="field">
      <div className="label-row">
        <label htmlFor={inputId}>{label}</label>
        {labelAction}
      </div>
      {isPassword ? (
        <div className="password-field">
          {input}
          <button
            type="button"
            aria-label={`${visible ? "Hide" : "Show"} ${visibilityLabel}`}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      ) : (
        input
      )}
      {hint && (
        <p className="field-hint" id={`${inputId}-guidance`}>
          {hint}
        </p>
      )}
      {error && (
        <span className="field-error" id={`${inputId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
