import type { ReactNode } from "react";

type SummaryListCardItem = {
  label: string;
  value: string;
  ratio: number;
  tone: "brand" | "critical" | "neutral" | "success" | "warning";
  subtext?: string;
};

type SummaryListCardProps = {
  title: string;
  description: string;
  items: SummaryListCardItem[];
  footer?: ReactNode;
};

const toneClasses = {
  brand: "bg-brand",
  critical: "bg-critical",
  neutral: "bg-foreground/40",
  success: "bg-success",
  warning: "bg-warning",
} as const;

export function SummaryListCard({
  title,
  description,
  items,
  footer,
}: SummaryListCardProps) {
  return (
    <section className="app-panel p-5">
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        <p className="mt-1 text-[13px] leading-6 text-muted">{description}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-surface-muted p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                {item.subtext ? (
                  <p className="mt-1 text-xs text-muted">{item.subtext}</p>
                ) : null}
              </div>
              <p className="text-[13px] font-semibold text-foreground">{item.value}</p>
            </div>

            <div className="mt-3 h-2 rounded-full bg-white">
              <div
                className={`h-full rounded-full ${toneClasses[item.tone]}`}
                style={{
                  width:
                    item.ratio <= 0
                      ? "0%"
                      : `${Math.max(item.ratio * 100, 8)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {footer ? <div className="mt-5">{footer}</div> : null}
    </section>
  );
}
