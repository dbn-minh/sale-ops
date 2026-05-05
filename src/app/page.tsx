import Link from "next/link";
import { DashboardHeaderActions } from "@/components/demo/dashboard-header-actions";
import { SummaryListCard } from "@/components/dashboard/summary-list-card";
import { Badge } from "@/components/ui/badge";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { PageHeader } from "@/components/ui/page-header";
import {
  crmSimulationDashboard,
  crmSimulationData,
  crmSimulationDealsWorkspace,
} from "@/lib/data/demo-data";
import { KPI_COPY } from "@/lib/ui-copy";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const stageToneMap = {
  Prospecting: "neutral",
  Discovery: "brand",
  "Demo Scheduled": "brand",
  Proposal: "warning",
  Negotiation: "warning",
  "Contract Review": "critical",
  "Closed Won": "success",
  "Closed Lost": "neutral",
} as const;

const severityToneMap = {
  critical: "critical",
  high: "warning",
  medium: "brand",
  low: "neutral",
} as const;

export default function Home() {
  const openDealsCount = crmSimulationData.deals.filter(
    (deal) => deal.status === "open",
  ).length;
  const pipelineValueAtRisk = crmSimulationDashboard.kpis.find(
    (metric) => metric.label === "Pipeline value at risk",
  );
  const openDealsMetric = crmSimulationDashboard.kpis.find(
    (metric) => metric.label === "Open deals scanned",
  );
  const criticalMetric = crmSimulationDashboard.kpis.find(
    (metric) => metric.label === "Critical/high findings",
  );
  const totalFindingsMetric = crmSimulationDashboard.kpis.find(
    (metric) => metric.label === "Total findings",
  );
  const nextStepMetric = crmSimulationDashboard.kpis.find(
    (metric) => metric.label === "Deals with no next step",
  );
  const uniqueDealsAtRiskCount = crmSimulationDealsWorkspace.list_rows.filter(
    (deal) => deal.open_findings_count > 0,
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Executive Overview"
        description={`Find pipeline risks before revenue slips. This dashboard turns the current hygiene scan into a manager-ready view of pipeline value at risk, generated findings, and deals needing attention as of ${formatIsoDate(crmSimulationDashboard.reference_date)}.`}
        actions={
          <DashboardHeaderActions
            openDealsCount={openDealsCount}
            totalFindings={crmSimulationData.findings.length}
          />
        }
      />

      <section className="grid gap-6 xl:grid-cols-12">
        <article className="col-span-12 overflow-hidden rounded-xl bg-brand px-6 py-6 text-white shadow-lg shadow-brand/20 xl:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-100">
            Pipeline value at risk
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="text-[42px] font-extrabold tracking-[-0.05em]">
              {pipelineValueAtRisk?.value ?? "$0"}
            </p>
            <Badge tone="neutral" className="border-white/10 bg-white/10 text-white">
              Deduplicated
            </Badge>
          </div>
          <p className="mt-3 max-w-sm text-[14px] leading-6 text-indigo-50/90">
            Across {uniqueDealsAtRiskCount} unique open deals at risk, with each
            risky deal counted once.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-indigo-100">
                Recommended next action
              </p>
              <p className="mt-2 text-[13px] leading-6 text-white">
                Review critical / high findings first, then create follow-up task
                coverage for late-stage deals.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-indigo-100">
                Manager review
              </p>
              <p className="mt-2 text-[13px] leading-6 text-white">
                Open Findings to move directly from risk detection into
                follow-up action.
              </p>
            </div>
          </div>
        </article>

        <div className="col-span-12 grid gap-4 md:grid-cols-3 xl:col-span-8">
          <MetricPanel
            label={KPI_COPY.openDealsScanned.label}
            value={openDealsMetric?.value ?? "0"}
            helper={KPI_COPY.openDealsScanned.description}
          />
          <MetricPanel
            label={KPI_COPY.generatedFindings.label}
            value={totalFindingsMetric?.value ?? "0"}
            helper={KPI_COPY.generatedFindings.description}
          />
          <MetricPanel
            label={KPI_COPY.criticalHighFindings.label}
            value={criticalMetric?.value ?? "0"}
            helper={KPI_COPY.criticalHighFindings.description}
            accent="critical"
          />
          <MetricPanel
            label={nextStepMetric?.label ?? "Deals with no next step"}
            value={nextStepMetric?.value ?? "0"}
            helper="Open deals that still need follow-up task coverage."
            accent="warning"
            className="md:col-span-2"
          />
          <SummaryCard
            title={KPI_COPY.uniqueDealsAtRisk.label}
            value={String(uniqueDealsAtRiskCount)}
            description={KPI_COPY.uniqueDealsAtRisk.description}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <SummaryListCard
            title="Risks by type"
            description="See which hygiene patterns are driving the most manager attention across the seeded pipeline."
            items={crmSimulationDashboard.findings_by_type.slice(0, 4)}
            footer={
              <Link
                href="/findings"
                className="text-[13px] font-semibold text-brand hover:underline"
              >
                View all findings
              </Link>
            }
          />
        </div>

        <div className="space-y-6 xl:col-span-8">
          <SummaryListCard
            title="Findings by severity"
            description="Critical findings show severity-critical issues only. The combined critical / high count is broken out separately in the KPI row above."
            items={crmSimulationDashboard.findings_by_severity}
          />

          <DataTableWrapper
            title="Deals needing attention"
            description="Top risky deals combine generated findings and duplicate-record exposure so managers can see where pipeline value at risk is most concentrated."
            headerActions={
              <Link
                href="/deals"
                className="text-[13px] font-semibold text-brand hover:underline"
              >
                View all flagged deals
              </Link>
            }
            columns={[
              "Deal name",
              "Risk level",
              "Value",
              "Owner",
              "Primary risk",
            ]}
          >
            {crmSimulationDashboard.top_risky_deals.slice(0, 5).map((deal) => (
              <tr key={deal.deal_id} className="border-t border-line align-top">
                <td className="px-4 py-4 text-[13px] text-foreground sm:px-6">
                  <Link href={`/deals/${deal.deal_id}`} className="font-semibold hover:text-brand">
                    {deal.deal_name}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{deal.company_name}</p>
                </td>
                <td className="px-4 py-4 text-[13px] sm:px-6">
                  <Badge tone={severityToneMap[deal.severity]}>{deal.severity}</Badge>
                </td>
                <td className="px-4 py-4 text-[13px] font-medium text-foreground sm:px-6">
                  {currencyFormatter.format(deal.amount)}
                </td>
                <td className="px-4 py-4 text-[13px] text-muted sm:px-6">
                  <p>{deal.owner_name}</p>
                  <p className="mt-1 text-xs text-muted">{deal.stage}</p>
                </td>
                <td className="px-4 py-4 text-[13px] sm:px-6">
                  <div className="max-w-[22rem] space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={severityToneMap[deal.severity]}>
                        {deal.main_risk_label}
                      </Badge>
                      <Badge
                        tone={
                          stageToneMap[deal.stage as keyof typeof stageToneMap] ?? "neutral"
                        }
                      >
                        {deal.stage}
                      </Badge>
                    </div>
                    <p className="leading-6 text-muted">{deal.main_risk_reason}</p>
                    <p className="text-foreground">
                      Recommended next action: {deal.recommended_action}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </DataTableWrapper>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <SummaryListCard
          title="Pipeline value at risk by owner"
          description="This owner rollup uses the same deduplicated open-deal exposure shown in the dashboard headline."
          items={crmSimulationDashboard.pipeline_value_at_risk_by_owner}
        />

        <DataTableWrapper
          title="Owner leaderboard"
          description="Hygiene score balances issue severity, open-deal coverage, and duplicate-record exposure."
          columns={[
            "Owner",
            "Open deals",
            "Total findings",
            KPI_COPY.criticalFindings.label,
            "Pipeline at risk",
            "Hygiene score",
          ]}
        >
          {crmSimulationDashboard.owner_leaderboard.map((owner) => (
            <tr key={owner.owner_id} className="border-t border-line">
              <td className="px-4 py-4 text-[13px] sm:px-6">
                <p className="font-semibold text-foreground">{owner.owner_name}</p>
                <p className="mt-1 text-xs text-muted">{owner.owner_team}</p>
              </td>
              <td className="px-4 py-4 text-[13px] text-muted sm:px-6">{owner.open_deals}</td>
              <td className="px-4 py-4 text-[13px] text-muted sm:px-6">{owner.total_findings}</td>
              <td className="px-4 py-4 text-[13px] text-muted sm:px-6">{owner.critical_findings}</td>
              <td className="px-4 py-4 text-[13px] text-muted sm:px-6">
                {currencyFormatter.format(owner.pipeline_at_risk)}
              </td>
              <td className="px-4 py-4 text-[13px] sm:px-6">
                <span className={getScoreClassName(owner.hygiene_score)}>
                  {owner.hygiene_score}
                </span>
              </td>
            </tr>
          ))}
        </DataTableWrapper>
      </section>
    </div>
  );
}

function MetricPanel({
  label,
  value,
  helper,
  accent = "neutral",
  className,
}: {
  label: string;
  value: string;
  helper: string;
  accent?: "neutral" | "critical" | "warning";
  className?: string;
}) {
  return (
    <article
      className={`app-panel p-5 ${className ?? ""} ${
        accent === "critical"
          ? "border-critical/20"
          : accent === "warning"
            ? "border-warning/20"
            : ""
      }`}
    >
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

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="app-panel flex flex-col justify-between p-5">
      <div>
        <p className="app-overline">{title}</p>
        <p className="mt-3 text-[24px] font-bold tracking-[-0.03em] text-foreground">
          {value}
        </p>
      </div>
      <p className="mt-4 text-[13px] leading-6 text-muted">{description}</p>
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

function getScoreClassName(score: number) {
  if (score >= 85) {
    return "inline-flex rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-semibold text-success";
  }

  if (score >= 70) {
    return "inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand";
  }

  if (score >= 55) {
    return "inline-flex rounded-full bg-warning-soft px-2.5 py-1 text-[12px] font-semibold text-warning";
  }

  return "inline-flex rounded-full bg-critical-soft px-2.5 py-1 text-[12px] font-semibold text-critical";
}
