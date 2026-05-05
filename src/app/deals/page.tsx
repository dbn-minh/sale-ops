import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonLinkClassName } from "@/components/ui/button";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { AppIcon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { crmSimulationDealsWorkspace } from "@/lib/data/demo-data";
import { KPI_COPY } from "@/lib/ui-copy";

const severityToneMap = {
  critical: "critical",
  high: "warning",
  medium: "brand",
  low: "neutral",
} as const;

const stageToneMap = {
  Prospecting: "neutral",
  Discovery: "brand",
  "Demo Scheduled": "brand",
  Proposal: "warning",
  Negotiation: "brand",
  "Contract Review": "critical",
  "Closed Won": "success",
  "Closed Lost": "neutral",
} as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function DealsPage() {
  const totalPipelineValue = crmSimulationDealsWorkspace.list_rows.reduce(
    (total, deal) => total + deal.amount,
    0,
  );
  const dealsAtRisk = crmSimulationDealsWorkspace.list_rows.filter(
    (deal) => deal.open_findings_count > 0,
  ).length;
  const openFindings = crmSimulationDealsWorkspace.list_rows.reduce(
    (total, deal) => total + deal.open_findings_count,
    0,
  );
  const stalledDeals = crmSimulationDealsWorkspace.list_rows.filter((deal) =>
    deal.risk_indicators.some((indicator) => indicator.label === "Stale Deal"),
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Deals"
        title="Deals Pipeline"
        description="Inspect deal health, monitor recent activity, and ensure adequate follow-up coverage across all open opportunities."
        actions={
          <>
            <Button variant="secondary" icon="download">
              Export
            </Button>
            <Button variant="primary" icon="scan">
              Run scan
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          label="Total pipeline value"
          value={currencyFormatter.format(totalPipelineValue)}
          helper="Total value of open deals currently shown in the pipeline workspace."
        />
        <SummaryMetric
          label={KPI_COPY.uniqueDealsAtRisk.label}
          value={String(dealsAtRisk)}
          helper={KPI_COPY.uniqueDealsAtRisk.description}
          accent="critical"
        />
        <SummaryMetric
          label={KPI_COPY.dealLinkedFindings.label}
          value={String(openFindings)}
          helper={KPI_COPY.dealLinkedFindings.description}
        />
        <SummaryMetric
          label="Stalled deals"
          value={String(stalledDeals)}
          helper="Open deals currently carrying a stale-deal risk signal."
          accent="warning"
        />
      </section>

      <DataTableWrapper
        title="All Deals"
        description="Inspect deals needing attention, recent activity, and follow-up coverage before revenue slips."
        headerActions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted">
              {crmSimulationDealsWorkspace.list_rows.length}
            </div>
            <div className="relative hidden md:block">
              <AppIcon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Filter deals..."
                className="w-56 rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </div>
            <Button variant="secondary" icon="filter">
              Filter
            </Button>
          </div>
        }
        footer={`Showing 1 to ${Math.min(10, crmSimulationDealsWorkspace.list_rows.length)} of ${crmSimulationDealsWorkspace.list_rows.length} entries.`}
        mobileCards={crmSimulationDealsWorkspace.list_rows.slice(0, 10).map((deal) => (
          <DealMobileCard key={deal.deal_id} deal={deal} />
        ))}
        stickyHeader
        stickyHeaderOffsetClassName="top-16"
        columns={[
          "Deal",
          "Company",
          "Owner",
          "Stage",
          "Amount",
          "Close date",
          "Last activity",
          "Risk indicators",
          KPI_COPY.dealLinkedFindings.label,
          "",
        ]}
      >
        {crmSimulationDealsWorkspace.list_rows.slice(0, 10).map((deal) => (
          <tr key={deal.deal_id} className="border-t border-line align-top">
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <Link href={deal.detail_href} className="font-semibold text-foreground hover:text-brand">
                {deal.deal_name}
              </Link>
              <p className="mt-1 text-xs text-muted">{deal.deal_id}</p>
            </td>
            <td className="px-4 py-5 text-[13px] text-muted sm:px-6">{deal.company_name}</td>
            <td className="px-4 py-5 text-[13px] text-muted sm:px-6">{deal.owner_name}</td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <Badge tone={stageToneMap[deal.stage as keyof typeof stageToneMap] ?? "neutral"}>
                {deal.stage}
              </Badge>
            </td>
            <td className="px-4 py-5 text-[13px] font-medium text-foreground sm:px-6">
              {currencyFormatter.format(deal.amount)}
            </td>
            <td className="px-4 py-5 text-[13px] text-muted sm:px-6">
              {formatIsoDate(deal.close_date)}
            </td>
            <td className="px-4 py-5 text-[13px] text-muted sm:px-6">
              {deal.last_activity_at ? formatDateTime(deal.last_activity_at) : "No activity"}
            </td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <div className="flex min-w-[12rem] flex-wrap gap-2">
                {deal.risk_indicators.slice(0, 3).map((indicator) => (
                  <Badge
                    key={`${deal.deal_id}-${indicator.label}`}
                    tone={severityToneMap[indicator.severity]}
                  >
                    {indicator.label}
                  </Badge>
                ))}
              </div>
            </td>
            <td className="px-4 py-5 text-[13px] text-muted sm:px-6">
              {deal.open_findings_count}
            </td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <Link href={deal.detail_href} className={buttonLinkClassName("secondary", "sm")}>
                View detail
              </Link>
            </td>
          </tr>
        ))}
      </DataTableWrapper>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  helper,
  accent = "neutral",
}: {
  label: string;
  value: string;
  helper: string;
  accent?: "neutral" | "critical" | "warning";
}) {
  return (
    <article className="app-panel p-5">
      <p className="app-overline">{label}</p>
      <p
        className={`mt-3 text-[28px] font-bold tracking-[-0.04em] ${
          accent === "critical"
            ? "text-critical"
            : accent === "warning"
              ? "text-warning"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-[13px] leading-6 text-muted">{helper}</p>
    </article>
  );
}

function DealMobileCard({
  deal,
}: {
  deal: (typeof crmSimulationDealsWorkspace.list_rows)[number];
}) {
  return (
    <article className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={deal.detail_href} className="text-[14px] font-semibold text-foreground hover:text-brand">
            {deal.deal_name}
          </Link>
          <p className="mt-1 text-[12px] text-muted">{deal.company_name}</p>
        </div>
        <p className="text-right text-[14px] font-semibold text-foreground">
          {currencyFormatter.format(deal.amount)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg bg-surface-muted p-3 text-[12px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Owner</span>
          <span className="font-medium text-foreground">{deal.owner_name}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Stage</span>
          <Badge tone={stageToneMap[deal.stage as keyof typeof stageToneMap] ?? "neutral"}>
            {deal.stage}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Close date</span>
          <span className="font-medium text-foreground">{formatIsoDate(deal.close_date)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Last activity</span>
          <span className="font-medium text-foreground">
            {deal.last_activity_at ? formatDateTime(deal.last_activity_at) : "No activity"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">{KPI_COPY.dealLinkedFindings.label}</span>
          <span className="font-medium text-foreground">{deal.open_findings_count}</span>
        </div>
        <div>
          <p className="text-muted">Risk indicators</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {deal.risk_indicators.slice(0, 3).map((indicator) => (
              <Badge
                key={`${deal.deal_id}-${indicator.label}`}
                tone={severityToneMap[indicator.severity]}
              >
                {indicator.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Link href={deal.detail_href} className={`${buttonLinkClassName("secondary")} mt-4 w-full`}>
        View detail
      </Link>
    </article>
  );
}

function formatIsoDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
