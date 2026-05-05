import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { AppIcon, type AppIconName } from "@/components/ui/icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "success"
  | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: AppIconName;
  iconRight?: AppIconName;
  size?: "sm" | "md";
};

export function Button({
  children,
  className,
  variant = "secondary",
  icon,
  iconRight,
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-55",
        BUTTON_VARIANTS[variant],
        size === "md" ? "px-4 py-2 text-[13px]" : "px-3 py-2 text-xs",
        className,
      )}
      {...props}
    >
      {icon ? <AppIcon name={icon} className="h-4 w-4" /> : null}
      <span>{children}</span>
      {iconRight ? <AppIcon name={iconRight} className="h-4 w-4" /> : null}
    </button>
  );
}

export function buttonLinkClassName(
  variant: ButtonVariant = "secondary",
  size: "sm" | "md" = "md",
) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30",
    BUTTON_VARIANTS[variant],
    size === "md" ? "px-4 py-2 text-[13px]" : "px-3 py-2 text-xs",
  );
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-brand bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand/92 hover:shadow-md hover:shadow-brand/25",
  secondary:
    "border-line bg-white text-foreground shadow-sm hover:bg-surface-contrast hover:border-line-strong",
  ghost: "border-transparent bg-transparent text-muted hover:bg-surface-contrast hover:text-foreground",
  success:
    "border-success/20 bg-success-soft text-success hover:border-success/30 hover:bg-success-soft/80",
  danger:
    "border-critical/20 bg-critical-soft text-critical hover:border-critical/30 hover:bg-critical-soft/80",
};
