import { Badge, type BadgeTone } from "@/components/ui/badge";

type KpiCardProps = {
  label: string;
  value: string;
  description: string;
  status: string;
  tone?: BadgeTone;
};

export function KpiCard({
  label,
  value,
  description,
  status,
  tone = "neutral",
}: KpiCardProps) {
  return (
    <article className="app-panel p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="app-overline max-w-[13rem]">{label}</p>
        <Badge tone={tone}>{status}</Badge>
      </div>

      <p className="mt-4 text-[28px] font-bold tracking-[-0.03em] text-foreground">
        {value}
      </p>
      <p className="mt-3 text-[13px] leading-6 text-muted">{description}</p>
    </article>
  );
}
