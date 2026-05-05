import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type BadgeTone =
  | "brand"
  | "neutral"
  | "warning"
  | "critical"
  | "success";

const toneStyles: Record<BadgeTone, string> = {
  brand: "border-brand/10 bg-brand-soft text-brand",
  neutral: "border-line bg-surface-muted text-muted",
  warning: "border-warning/10 bg-warning-soft text-warning",
  critical: "border-critical/10 bg-critical-soft text-critical",
  success: "border-success/10 bg-success-soft text-success",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
