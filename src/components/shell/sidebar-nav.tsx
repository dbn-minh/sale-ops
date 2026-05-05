"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { navigationItems } from "@/lib/navigation";

type SidebarNavProps = {
  mobile?: boolean;
};

export function SidebarNav({ mobile = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className={cx(
        "gap-1",
        mobile ? "flex overflow-x-auto px-4 py-3" : "grid",
      )}
    >
      {navigationItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cx(
              "group transition-colors",
              mobile
                ? isActive
                  ? "inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-soft px-3 py-2 text-[13px] font-semibold text-brand"
                  : "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium text-muted hover:bg-surface-muted hover:text-foreground"
                : isActive
                  ? "flex items-center gap-3 border-l-2 border-brand bg-white/6 px-4 py-3 text-white"
                  : "flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-shell-muted hover:bg-white/5 hover:text-shell-foreground",
            )}
          >
            <AppIcon
              name={item.icon}
              className={cx(
                "h-[18px] w-[18px]",
                mobile
                  ? isActive
                    ? "text-brand"
                    : "text-muted"
                  : isActive
                    ? "text-white"
                    : "text-shell-muted",
              )}
            />
            <span className={cx(mobile ? "" : "text-[13px]", "font-medium")}>
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
