import { Link } from "react-router";
import type { ComponentProps } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

export function Button({
  children,
  secondary = false,
  loading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { secondary?: boolean; loading?: boolean }) {
  return (
    <button
      type={type}
      className={`button ${secondary ? "button-secondary" : "button-primary"} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoadingIndicator />}
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  secondary = false,
  className = "",
  ...props
}: ComponentProps<typeof Link> & { secondary?: boolean }) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : "button-primary"} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
