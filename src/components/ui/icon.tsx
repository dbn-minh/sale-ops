import type { ReactNode, SVGProps } from "react";

export type AppIconName =
  | "dashboard"
  | "findings"
  | "deals"
  | "digest"
  | "settings"
  | "search"
  | "bell"
  | "help"
  | "download"
  | "scan"
  | "filter"
  | "chevron-left"
  | "chevron-right"
  | "spark"
  | "warning"
  | "clock"
  | "calendar"
  | "building"
  | "user"
  | "mail"
  | "phone"
  | "activity"
  | "check"
  | "close"
  | "refresh"
  | "shield"
  | "cloud"
  | "link";

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: AppIconName;
};

export function AppIcon({ name, className, ...props }: AppIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
}

const ICONS: Record<AppIconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.6" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    </>
  ),
  findings: (
    <>
      <path d="M12 3.5l6.5 2.3v5c0 4-2.5 7.6-6.5 9.2-4-1.6-6.5-5.2-6.5-9.2v-5L12 3.5z" />
      <path d="M9.5 12.1l1.7 1.7 3.4-3.7" />
    </>
  ),
  deals: (
    <>
      <path d="M4 7.5h16" />
      <path d="M7 7.5v-1a2 2 0 012-2h6a2 2 0 012 2v1" />
      <rect x="3.5" y="7.5" width="17" height="11" rx="2" />
      <path d="M10 12h4" />
    </>
  ),
  digest: (
    <>
      <path d="M7 3.5h7l4 4v13H7a2 2 0 01-2-2v-13a2 2 0 012-2z" />
      <path d="M14 3.5v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.7" />
      <path d="M19 12a7 7 0 00-.1-1l2.1-1.6-2-3.4-2.5 1a7.7 7.7 0 00-1.8-1l-.4-2.7H10l-.4 2.7c-.6.2-1.2.5-1.8 1l-2.5-1-2 3.4L5.4 11a7 7 0 000 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.8 1.8 1l.4 2.7h4.2l.4-2.7c.6-.2 1.2-.5 1.8-1l2.5 1 2-3.4-2.1-1.6c.1-.3.2-.7.2-1z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M7 9a5 5 0 0110 0v4l1.5 2.5H5.5L7 13.1V9z" />
      <path d="M10 18a2 2 0 004 0" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.4a2.6 2.6 0 014.8 1.3c0 1.8-2.1 2.2-2.6 3.4" />
      <circle cx="12" cy="16.8" r=".8" fill="currentColor" stroke="none" />
    </>
  ),
  download: (
    <>
      <path d="M12 4.5v9" />
      <path d="M8.6 10.4L12 13.8l3.4-3.4" />
      <path d="M5 18.5h14" />
    </>
  ),
  scan: (
    <>
      <path d="M12 4.5v3" />
      <path d="M12 16.5v3" />
      <path d="M4.5 12h3" />
      <path d="M16.5 12h3" />
      <path d="M6 6l2.2 2.2" />
      <path d="M15.8 15.8L18 18" />
      <path d="M18 6l-2.2 2.2" />
      <path d="M8.2 15.8L6 18" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  filter: (
    <>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </>
  ),
  "chevron-left": <path d="M14.5 6.5L9 12l5.5 5.5" />,
  "chevron-right": <path d="M9.5 6.5L15 12l-5.5 5.5" />,
  spark: (
    <>
      <path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5L12 4z" />
      <path d="M18.5 4.5l.7 2 .2.6.6.2 2 .7-2 .7-.6.2-.2.6-.7 2-.7-2-.2-.6-.6-.2-2-.7 2-.7.6-.2.2-.6.7-2z" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.5l8 14H4l8-14z" />
      <path d="M12 9v4.5" />
      <circle cx="12" cy="16.3" r=".8" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M4 9.5h16" />
    </>
  ),
  building: (
    <>
      <path d="M4 20.5h16" />
      <path d="M6 20.5V6.5l6-3 6 3v14" />
      <path d="M9 9.5h.01" />
      <path d="M12 9.5h.01" />
      <path d="M15 9.5h.01" />
      <path d="M9 13h.01" />
      <path d="M12 13h.01" />
      <path d="M15 13h.01" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 19c1.4-3 3.8-4.5 6.5-4.5s5.1 1.5 6.5 4.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4.5 7l7.5 5.5L19.5 7" />
    </>
  ),
  phone: (
    <>
      <path d="M8 4.5l2 4-1.5 1.5a14.2 14.2 0 005.5 5.5L15.5 14l4 2v1.5c0 1.1-.9 2-2 2-7.2 0-13-5.8-13-13 0-1.1.9-2 2-2H8z" />
    </>
  ),
  activity: (
    <>
      <path d="M4 12h3l2.2-4.5 3.6 9 2.2-4.5H20" />
    </>
  ),
  check: <path d="M5.5 12.5l4 4L18.5 7.5" />,
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 10-2.3 5.7" />
      <path d="M20 4.5v6h-6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5l6.5 2.3v5c0 4-2.5 7.6-6.5 9.2-4-1.6-6.5-5.2-6.5-9.2v-5L12 3.5z" />
    </>
  ),
  cloud: (
    <>
      <path d="M8.5 18.5H18a3.5 3.5 0 000-7 5.2 5.2 0 00-9.9-1.8A3.8 3.8 0 008.5 18.5z" />
    </>
  ),
  link: (
    <>
      <path d="M10 14l4-4" />
      <path d="M8 16H6.5a3 3 0 010-6H9" />
      <path d="M15 8h2.5a3 3 0 010 6H15" />
    </>
  ),
};
