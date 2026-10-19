import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <Sparkles aria-hidden="true" size={14} />
      {children}
    </div>
  );
}
