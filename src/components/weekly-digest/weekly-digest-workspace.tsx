"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { useCrmSimulationDemoState } from "@/lib/demo-state/use-findings-demo-state";
import type { WeeklyDigestModel } from "@/lib/data/weekly-digest";

type WeeklyDigestWorkspaceProps = {
  model: WeeklyDigestModel;
};

const priorityToneMap = {
  critical: "critical",
  high: "warning",
  medium: "brand",
} as const;

const severityToneMap = {
  critical: "critical",
  high: "warning",
  medium: "brand",
  low: "neutral",
} as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function WeeklyDigestWorkspace({ model }: WeeklyDigestWorkspaceProps) {
  const { findingStatuses } = useCrmSimulationDemoState();

  const taskCreatedFindings = useMemo(
    () =>
      Object.values(findingStatuses).filter((status) => status === "task_created")
        .length,
    [findingStatuses],
  );

  const ownerRiskBars = model.owner_summary.slice(0, 4);
  const maxOwnerRisk = Math.max(
    ...ownerRiskBars.map((owner) => owner.pipeline_at_risk),
    1,
  );
  const maxIssueCount = Math.max(
    ...model.top_issue_types.slice(0, 5).map((issueType) => issueType.count),
    1,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <DigestMetric label="Scanned deals" value={String(model.scanned_deals_count)} />
        <DigestMetric label="Open deals" value={String(model.open_deals_count)} />
        <DigestMetric label="Issues found" value={String(model.issues_found)} />
        <DigestMetric
          label="Critical findings"
          value={String(model.critical_high_findings)}
          accent="critical"
        />
        <DigestMetric
          label="Value at risk"
          value={currencyFormatter.format(model.pipeline_value_at_risk)}
        />
        <DigestMetric
          label="Tasks created"
          value={String(taskCreatedFindings)}
          accent="brand"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DataTableWrapper
            title="Top risky deals"
            description="The fastest path from weekly summary into deal-level context, with the primary risk signal and recommended next action."
            headerActions={
              <Link href="/deals" className="text-[13px] font-semibold text-brand hover:underline">
                View all
              </Link>
            }
            columns={[
              "Deal name",
              "Value",
              "Owner",
              "Primary risk",
            ]}
          >
            {model.top_risky_deals.map((deal) => (
              <tr key={deal.deal_id} className="border-t border-line align-top">
                <td className="px-4 py-4 text-[13px] sm:px-6">
                  <div className="space-y-2">
                    <div>
                      <Link href={deal.detail_href} className="font-semibold text-foreground hover:text-brand">
                        {deal.deal_name}
                      </Link>
                      <p className="mt-1 text-xs text-muted">{deal.company_name}</p>
                    </div>
                    <Link
                      href={deal.detail_href}
                      className="text-[12px] font-semibold text-brand hover:underline"
                    >
                      View deal detail
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px] font-medium text-foreground sm:px-6">
                  {currencyFormatter.format(deal.amount)}
                </td>
                <td className="px-4 py-4 text-[13px] text-muted sm:px-6">
                  <p>{deal.owner_name}</p>
                  <p className="mt-1 text-xs text-muted">{deal.stage}</p>
                </td>
                <td className="px-4 py-4 text-[13px] sm:px-6">
                  <div className="max-w-[18rem] space-y-2">
                    <Badge tone={severityToneMap[deal.severity]}>
                      {deal.main_risk_label}
                    </Badge>
                    <p className="leading-6 text-muted">{deal.main_risk_reason}</p>
                    <p className="text-foreground">
                      Recommended next action: {deal.recommended_next_action}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </DataTableWrapper>

          <section className="app-panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="app-overline">Owner performance risk</p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                  Pipeline value at risk by owner
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {ownerRiskBars.map((owner) => (
                <div key={owner.owner_id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                    {initials(owner.owner_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">
                          {owner.owner_name}
                        </p>
                        <p className="text-[12px] text-muted">
                          {owner.open_deals} open deals at risk
                        </p>
                      </div>
                      <span className="text-[12px] font-medium text-foreground">
                        {currencyFormatter.format(owner.pipeline_at_risk)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-contrast">
                      <div
                        className={`h-full rounded-full ${
                          owner.critical_findings > 0 ? "bg-critical" : "bg-brand"
                        }`}
                        style={{
                          width: `${Math.max(
                            14,
                            (owner.pipeline_at_risk / maxOwnerRisk) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="app-panel p-5">
            <div>
              <p className="app-overline">Recommended actions</p>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                This week
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {model.recommended_actions.map((action) => (
                <article
                  key={action.id}
                  className="rounded-lg border border-line bg-surface-muted p-4"
                >
                  <div className="flex items-center gap-2">
                    <Badge tone={priorityToneMap[action.priority]}>
                      {action.priority}
                    </Badge>
                    <p className="text-[13px] font-semibold text-foreground">
                      {action.title}
                    </p>
                  </div>
                  <p className="mt-3 text-[12px] leading-6 text-muted">
                    {action.supporting_text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="app-panel p-5">
            <div>
              <p className="app-overline">Top issue types</p>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                Management focus
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {model.top_issue_types.slice(0, 5).map((issueType) => (
                <div key={issueType.finding_type}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        {issueType.finding_type_label}
                      </p>
                      <p className="mt-1 text-[12px] text-muted">
                        {issueType.count} findings
                      </p>
                    </div>
                    <span className="text-[12px] font-medium text-foreground">
                      {currencyFormatter.format(issueType.pipeline_value_at_risk)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-surface-contrast">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{
                        width: `${Math.max(14, (issueType.count / maxIssueCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <DataTableWrapper
        title="Owner summary"
        description="Use this view to coach the team based on open-deal coverage, severity mix, and pipeline value at risk."
        columns={[
          "Owner",
          "Open deals",
          "Total findings",
          "Critical findings",
          "Pipeline at risk",
          "Hygiene score",
          "Suggested coaching focus",
        ]}
      >
        {model.owner_summary.map((owner) => (
          <tr key={owner.owner_id} className="border-t border-line align-top">
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
            <td className="px-4 py-4 text-[13px] text-muted sm:px-6">
              <p className="max-w-[22rem] leading-6">{owner.suggested_coaching_focus}</p>
            </td>
          </tr>
        ))}
      </DataTableWrapper>
    </div>
  );
}

function DigestMetric({
  label,
  value,
  accent = "neutral",
}: {
  label: string;
  value: string;
  accent?: "neutral" | "critical" | "brand";
}) {
  return (
    <article className="app-panel p-5">
      <p
        className={`app-overline ${
          accent === "critical"
            ? "text-critical"
            : accent === "brand"
              ? "text-brand"
              : ""
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-3 text-[28px] font-bold tracking-[-0.04em] ${
          accent === "critical"
            ? "text-critical"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
    </article>
  );
}

function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
