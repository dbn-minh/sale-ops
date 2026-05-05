import { Badge } from "@/components/ui/badge";
import { CrmSimulationPanel } from "@/components/demo/crm-simulation-panel";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  crmConnectionSafetyNotes,
  currentCRMProviderSummary,
  futureCRMProviderSummaries,
} from "@/lib/crm/providers";
import {
  crmSimulationData,
  crmSimulationFindingsOverview,
  crmSimulationSummary,
} from "@/lib/data/demo-data";
import { KPI_COPY } from "@/lib/ui-copy";

export default function SettingsPage() {
  const openDealsCount = crmSimulationData.deals.filter(
    (deal) => deal.status === "open",
  ).length;
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const summaryCards = [
    {
      label: KPI_COPY.generatedFindings.label,
      value: String(crmSimulationFindingsOverview.total_findings),
      status: "Rule engine live",
      tone: "brand" as const,
      description: KPI_COPY.generatedFindings.description,
    },
    {
      label: KPI_COPY.pipelineValueAtRiskDeduplicated.label,
      value: currencyFormatter.format(
        crmSimulationFindingsOverview.pipeline_value_at_risk,
      ),
      status: "Deduplicated exposure",
      tone: "warning" as const,
      description: KPI_COPY.pipelineValueAtRiskDeduplicated.description,
    },
    {
      label: KPI_COPY.criticalFindings.label,
      value: String(
        crmSimulationFindingsOverview.by_severity.find(
          (bucket) => bucket.severity === "critical",
        )?.count ?? 0,
      ),
      status: "Severity = critical",
      tone: "critical" as const,
      description: KPI_COPY.criticalFindings.description,
    },
    {
      label: KPI_COPY.seededCrmRecords.label,
      value: (
        crmSimulationSummary.entity_counts.users +
        crmSimulationSummary.entity_counts.companies +
        crmSimulationSummary.entity_counts.contacts +
        crmSimulationSummary.entity_counts.deals +
        crmSimulationSummary.entity_counts.activities +
        crmSimulationSummary.entity_counts.tasks
      ).toLocaleString(),
      status: "Deterministic seed",
      tone: "neutral" as const,
      description: KPI_COPY.seededCrmRecords.description,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Manage CRM Simulation Mode and future integration readiness."
      />

      <CrmSimulationPanel
        openDealsCount={openDealsCount}
        totalFindings={crmSimulationFindingsOverview.total_findings}
        referenceDate={crmSimulationSummary.reference_date}
      />

      <section className="app-panel p-6">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="app-overline">Future providers</p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
              Upcoming CRM channels
            </h2>
          </div>
          <Badge tone="neutral">Integration readiness</Badge>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {futureCRMProviderSummaries.map((provider) => (
            <article
              key={provider.implementationName}
              className="rounded-xl border border-line bg-surface-muted p-4"
            >
              <p className="text-[13px] font-semibold text-foreground">
                {provider.providerName}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted">
                {provider.implementationName}
              </p>
              <p className="mt-3 text-[12px] leading-6 text-muted">
                {provider.summary}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="app-panel p-6">
          <p className="app-overline">Current provider</p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
            CRM connection status
          </h2>
          <div className="mt-5 rounded-xl border border-line bg-surface-muted p-4">
            <p className="text-[13px] font-semibold text-foreground">
              {currentCRMProviderSummary.providerName}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted">
              {currentCRMProviderSummary.implementationName}
            </p>
            <p className="mt-3 text-[12px] leading-6 text-muted">
              {currentCRMProviderSummary.summary}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {crmConnectionSafetyNotes.map((note) => (
              <div
                key={note}
                className="rounded-lg border border-line bg-white px-4 py-3 text-[12px] leading-6 text-muted"
              >
                {note}
              </div>
            ))}
          </div>
        </article>

        <article className="app-panel p-6">
          <p className="app-overline">Simulation diagnostics</p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
            Seed health snapshot
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <MiniMetric
              label="Deals without upcoming tasks"
              value={String(
                crmSimulationSummary.anomaly_counts.deals_without_upcoming_tasks,
              )}
            />
            <MiniMetric
              label="Deals without recent activity"
              value={String(
                crmSimulationSummary.anomaly_counts.deals_without_recent_activity,
              )}
            />
            <MiniMetric
              label="Overdue close dates"
              value={String(crmSimulationSummary.anomaly_counts.overdue_close_dates)}
            />
            <MiniMetric
              label="High-value deals at risk"
              value={String(
                crmSimulationSummary.anomaly_counts.high_value_deals_at_risk,
              )}
            />
          </div>
          <div className="mt-5 rounded-xl border border-line bg-surface-muted p-4">
            <p className="text-[13px] font-semibold text-foreground">Reference date</p>
            <p className="mt-2 text-[12px] text-muted">
              {crmSimulationSummary.reference_date}
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="app-overline">{label}</p>
      <p className="mt-3 text-[24px] font-bold tracking-[-0.03em] text-foreground">
        {value}
      </p>
    </div>
  );
}
