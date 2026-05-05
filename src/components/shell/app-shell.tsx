import type { ReactNode } from "react";
import Link from "next/link";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { AppIcon } from "@/components/ui/icon";
import { SIMULATION_MODE_LABEL } from "@/lib/ui-copy";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800 bg-shell md:flex">
        <div className="border-b border-slate-800 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm shadow-brand/30">
              <AppIcon name="spark" className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-white">
                Sales Ops Bot
              </h1>
              <p className="text-[11px] text-indigo-300">Precision Intelligence</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>

        <div className="mt-auto border-t border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/5 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">
              EO
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-white">Exec User</p>
              <p className="truncate text-[11px] text-shell-muted">VP Sales Ops</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:ml-64">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-[15px] font-semibold text-foreground md:hidden">
                Sales Ops Bot
              </Link>
              <div className="hidden items-center gap-6 md:flex">
                <span className="text-[17px] font-bold tracking-tight text-foreground">
                  Hygiene Bot
                </span>
              </div>
              <div className="relative hidden lg:block">
                <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search deals, companies..."
                  className="w-72 rounded-lg border border-line bg-surface-muted py-2 pl-9 pr-4 text-[13px] text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-surface-muted hover:text-foreground">
                <AppIcon name="bell" className="h-4 w-4" />
              </button>
              <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-surface-muted hover:text-foreground">
                <AppIcon name="help" className="h-4 w-4" />
              </button>
              <div className="hidden h-5 w-px bg-line sm:block" />
              <Badge tone="brand">
                {SIMULATION_MODE_LABEL}
              </Badge>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-[11px] font-semibold text-foreground">
                EU
              </div>
            </div>
          </div>

          <div className="border-t border-line md:hidden">
            <SidebarNav mobile />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
