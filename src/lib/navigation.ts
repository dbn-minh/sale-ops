import type { AppIconName } from "@/components/ui/icon";

export type NavigationItem = {
  title: string;
  href: string;
  summary: string;
  icon: AppIconName;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/",
    summary: "See pipeline value at risk, critical / high findings, and the recommended next action.",
    icon: "dashboard",
  },
  {
    title: "Findings",
    href: "/findings",
    summary: "Filter issues for manager review, update status, and create follow-up task.",
    icon: "findings",
  },
  {
    title: "Deals",
    href: "/deals",
    summary: "Inspect deals needing attention, recent activity, and bot-created tasks.",
    icon: "deals",
  },
  {
    title: "Weekly Digest",
    href: "/weekly-digest",
    summary: "Present a Monday morning manager report with risks, coaching, and action items.",
    icon: "digest",
  },
  {
    title: "Settings",
    href: "/settings",
    summary: "Explain the simulation, rerun the scan, and reset the local demo state.",
    icon: "settings",
  },
];
