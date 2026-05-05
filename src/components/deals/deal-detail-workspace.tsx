"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonLinkClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCrmSimulationDemoState } from "@/lib/demo-state/use-findings-demo-state";
import type { DealDetailModel } from "@/lib/data/deals";

type DealDetailWorkspaceProps = {
  model: DealDetailModel;
};

const severityToneMap = {
  critical: "critical",
  high: "warning",
  medium: "brand",
  low: "neutral",
} as const;

const statusToneMap = {
  open: "warning",
  reviewed: "brand",
  ignored: "neutral",
  task_created: "success",
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

export function DealDetailWorkspace({ model }: DealDetailWorkspaceProps) {
  const {
    botTasks,
    findingStatuses,
    setFindingStatus,
    createBotTask,
    isHydrated,
  } = useCrmSimulationDemoState();
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const effectiveFindings = useMemo(
    () =>
      model.findings.map((finding) => ({
        ...finding,
        status: findingStatuses[finding.id] ?? finding.initial_status,
      })),
    [findingStatuses, model.findings],
  );

  const mergedOpenTasks = useMemo(() => {
    const taskMap = new Map(
      model.base_open_tasks.map((task) => [
        task.id,
        { ...task, source_label: task.source === "bot" ? "Bot" : "Manual" },
      ]),
    );

    botTasks
      .filter((task) => task.deal_id === model.deal_id)
      .forEach((task) => {
        taskMap.set(task.id, {
          ...task,
          source_label: "Bot",
        });
      });

    return Array.from(taskMap.values()).sort((left, right) =>
      left.due_date.localeCompare(right.due_date),
    );
  }, [botTasks, model.base_open_tasks, model.deal_id]);

  const recommendedFinding = effectiveFindings.find(
    (finding) => finding.status !== "ignored",
  );
  const closeConfidence = Math.max(12, Math.min(100, model.probability));

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={severityToneMap[effectiveFindings[0]?.severity ?? "medium"]}>
              {effectiveFindings[0]?.severity ?? "at risk"}
            </Badge>
            <span className="text-[13px] text-muted">{model.company.name}</span>
          </div>
          <h1 className="mt-3 text-[34px] font-extrabold tracking-[-0.05em] text-foreground">
            {model.deal_name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 text-[13px]">
            <MetaStat label="Owner" value={model.owner.name} helper={model.owner.team} />
            <MetaStat label="Stage" value={model.stage} helper={`${model.probability}% confidence`} />
            <MetaStat label="Amount" value={currencyFormatter.format(model.amount)} helper={model.pipeline} />
            <MetaStat label="Close date" value={formatIsoDate(model.close_date)} helper="CRM Simulation Mode" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/deals" className={buttonLinkClassName("secondary")}>
            Back to deals
          </Link>
          <Button
            variant="primary"
            icon="scan"
            onClick={() => {
              const created = createBotTask({
                dealId: model.deal_id,
                ownerId: model.owner.id,
                title: `Follow up on ${model.deal_name}`,
              });

              if (created) {
                setFeedbackMessage("Follow-up task created in CRM simulation.");
              }
            }}
          >
            Create follow-up task
          </Button>
        </div>
      </section>

      {feedbackMessage ? (
        <section className="rounded-lg border border-success/20 bg-success-soft px-4 py-3 text-[13px] font-medium text-success">
          {feedbackMessage}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <section className="app-panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="app-overline">Recommended next action</p>
                <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-foreground">
                  Keep this deal moving
                </h2>
              </div>
              <Badge tone={stageToneMap[model.stage as keyof typeof stageToneMap] ?? "neutral"}>
                {model.stage}
              </Badge>
            </div>

            <div className="mt-5 rounded-xl border border-brand/20 bg-brand-soft p-5">
              <p className="text-[14px] leading-6 text-foreground">
                {recommendedFinding?.recommended_action ?? model.recommended_next_action}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-muted">
                <span>Suggested attendees:</span>
                <span className="rounded-full bg-white px-2.5 py-1 font-medium text-foreground">
                  {model.owner.name}
                </span>
                {model.primary_contact ? (
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-foreground">
                    {model.primary_contact.name}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="primary" size="sm">
                  Draft follow-up
                </Button>
                <Button variant="secondary" size="sm">
                  Dismiss
                </Button>
              </div>
            </div>
          </section>

          <section className="app-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="app-overline">Critical findings</p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                  Linked deal findings
                </h2>
              </div>
              <Link href="/findings" className="text-[13px] font-semibold text-brand hover:underline">
                View all
              </Link>
            </div>

            {effectiveFindings.length > 0 ? (
              <div className="app-scrollbar overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-surface-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                        Severity
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                        Issue detected
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectiveFindings.map((finding) => (
                      <tr key={finding.id} className="border-t border-line align-top">
                        <td className="px-4 py-4 text-[13px] sm:px-6">
                          <Badge tone={severityToneMap[finding.severity]}>
                            {finding.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-[13px] sm:px-6">
                          <p className="font-semibold text-foreground">{finding.type_label}</p>
                          <p className="mt-1 max-w-[20rem] text-xs leading-5 text-muted">
                            {finding.reason}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-muted sm:px-6">
                          {finding.source === "company" ? "Company" : "Deal"}
                        </td>
                        <td className="px-4 py-4 text-[13px] sm:px-6">
                          <Badge tone={statusToneMap[finding.status]}>
                            {formatStatusLabel(finding.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-[13px] sm:px-6">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={finding.status === "reviewed"}
                            onClick={() => {
                              setFindingStatus(finding.id, "reviewed");
                              setFeedbackMessage(
                                `${finding.type_label} marked as reviewed.`,
                              );
                            }}
                          >
                            Mark reviewed
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No findings linked to this deal"
                description="This opportunity currently has no generated hygiene findings in CRM Simulation Mode."
              />
            )}
          </section>

          <section className="app-panel p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="app-overline">Activity feed</p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                  Recent activity
                </h2>
              </div>
              <span className="text-[12px] text-muted">
                {model.recent_activities.length} logged updates
              </span>
            </div>

            {model.recent_activities.length > 0 ? (
              <div className="mt-5 space-y-4">
                {model.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    </div>
                    <div className="min-w-0 flex-1 border-b border-line pb-4 last:border-b-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-foreground">
                          {activity.subject}
                        </p>
                        <span className="text-[11px] text-muted">
                          {formatDateTime(activity.occurred_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-muted">{activity.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent activities"
                description="This deal does not have recorded CRM activities in the current simulation dataset."
              />
            )}
          </section>
        </div>

        <aside className="space-y-6 xl:col-span-4">
          <section className="app-panel p-5">
            <p className="app-overline">Deal health index</p>
            <div className="mt-4 flex items-center justify-center">
              <div
                className="relative flex h-36 w-36 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#dc2626 ${closeConfidence * 3.6}deg, #e2e8f0 0deg)`,
                }}
              >
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[32px] font-bold tracking-[-0.05em] text-critical">
                    {closeConfidence}
                  </span>
                  <span className="text-[11px] text-muted">/100</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[12px] text-muted">
              {isHydrated ? "Live browser state applied" : "Loading browser state"}
            </p>
          </section>

          <InfoCard
            title="Company profile"
            items={[
              ["Industry", model.company.industry],
              ["Employees", model.company.employee_count.toLocaleString()],
              ["Estimated ARR", currencyFormatter.format(model.company.annual_revenue)],
              ["Domain", model.company.domain],
            ]}
          />

          <InfoCard
            title="Primary contact"
            items={[
              ["Name", model.primary_contact?.name ?? "Missing primary contact"],
              ["Role", model.primary_contact?.job_title ?? "Associate a decision maker"],
              ["Email", model.primary_contact?.email ?? "Missing email"],
              ["Phone", model.primary_contact?.phone ?? "Missing phone"],
            ]}
          />

          <section className="app-panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="app-overline">Open tasks</p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                  Follow-up coverage
                </h2>
              </div>
              <Badge tone="brand">{mergedOpenTasks.length}</Badge>
            </div>

            {mergedOpenTasks.length > 0 ? (
              <div className="mt-4 space-y-3">
                {mergedOpenTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-line bg-surface-muted p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{task.title}</p>
                        <p className="mt-1 text-[12px] text-muted">
                          Due {formatIsoDate(task.due_date)}
                        </p>
                      </div>
                      <Badge tone={task.source === "bot" ? "success" : "neutral"}>
                        {task.source_label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No open tasks"
                description="Create a follow-up task in CRM simulation to show immediate next-step coverage on this deal."
              />
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}

function MetaStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div>
      <p className="app-overline">{label}</p>
      <p className="mt-1 text-[13px] font-medium text-foreground">{value}</p>
      <p className="mt-1 text-[12px] text-muted">{helper}</p>
    </div>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string]>;
}) {
  return (
    <section className="app-panel p-5">
      <p className="app-overline">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <span className="text-[12px] text-muted">{label}</span>
            <span className="text-right text-[13px] font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((segment) => `${segment[0]?.toUpperCase() ?? ""}${segment.slice(1)}`)
    .join(" ");
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
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
