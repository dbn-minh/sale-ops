import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-foreground md:text-[34px]">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-muted">
          {description}
        </p>
        {badge ? <div className="mt-4">{badge}</div> : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
