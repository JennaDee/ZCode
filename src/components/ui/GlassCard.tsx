import type { ComponentProps } from "react";

export function GlassCard({
  className = "",
  ...props
}: ComponentProps<"section">) {
  return <section className={`glass ${className}`} {...props} />;
}
