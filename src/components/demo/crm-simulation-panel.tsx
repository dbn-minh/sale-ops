"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { useCrmSimulationDemoState } from "@/lib/demo-state/use-findings-demo-state";

type CrmSimulationPanelProps = {
  openDealsCount: number;
  totalFindings: number;
  referenceDate: string;
};

const explanationCards = [
  {
    title: "Realistic fake CRM data",
    description:
      "This demo uses a deterministic CRM dataset with seeded pipeline risk, stale records, and data quality issues.",
  },
  {
    title: "No real CRM credentials",
    description:
      "No live HubSpot or other CRM credentials are used anywhere in this build.",
  },
  {
    title: "No real record changes",
    description:
      "No production CRM records are edited, merged, or moved during the demo.",
  },
  {
    title: "Local simulated write-back",
    description:
      "Follow-up task creation and finding status changes are stored only in local browser state.",
  },
] as const;

export function CrmSimulationPanel({
  openDealsCount,
  totalFindings,
  referenceDate,
}: CrmSimulationPanelProps) {
  const { findingStatuses, botTasks, resetSimulation } =
    useCrmSimulationDemoState();
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const localFindingUpdates = useMemo(
    () => Object.keys(findingStatuses).length,
    [findingStatuses],
  );

  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <article className="app-panel col-span-12 p-6 lg:col-span-8">
        <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <AppIcon name="shield" className="h-5 w-5 text-brand" />
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                CRM Simulation Environment
              </h2>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-muted">
              Safely model data hygiene rules before executing writes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface-muted px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
              Active isolation
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-surface-muted p-5">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
            <AppIcon name="shield" className="h-4 w-4 text-success" />
            Safe Mode Guarantee
          </h3>
          <p className="mt-3 text-[13px] leading-6 text-muted">
            The system is currently routed through the <span className="rounded-md border border-line bg-white px-1.5 py-0.5 text-[12px] font-semibold text-brand">FakeCRMConnector</span>. No real credentials are required, and no records will be changed in any production environment. All proposed cleanses, deduplications, and field updates remain inside local demo state.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="app-overline">Simulated records</p>
              <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-foreground">
                {openDealsCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="app-overline">Virtual writes</p>
              <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-foreground">
                {(botTasks.length + localFindingUpdates).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {explanationCards.map((card) => (
              <article
                key={card.title}
                className="rounded-lg border border-line bg-white p-4"
              >
                <p className="text-[13px] font-semibold text-foreground">{card.title}</p>
                <p className="mt-2 text-[12px] leading-6 text-muted">
                  {card.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              icon="scan"
              onClick={() => {
                setFeedbackMessage(
                  `Hygiene scan completed. ${totalFindings} findings detected across ${openDealsCount} open deals.`,
                );
              }}
            >
              Run hygiene scan
            </Button>
            <Button
              variant="secondary"
              icon="refresh"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  !window.confirm(
                    "Reset CRM Simulation? This clears reviewed statuses and bot-created tasks in this browser.",
                  )
                ) {
                  return;
                }

                resetSimulation();
                setFeedbackMessage(
                  "CRM Simulation Mode has been reset. Reviewed statuses and bot-created tasks were cleared.",
                );
              }}
            >
              Reset Simulation State
            </Button>
          </div>

          {feedbackMessage ? (
            <div className="mt-4 rounded-lg border border-success/20 bg-success-soft px-4 py-3 text-[13px] font-medium text-success">
              {feedbackMessage}
            </div>
          ) : null}
        </div>
      </article>

      <aside className="app-panel col-span-12 p-6 lg:col-span-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">
          Pilot Path
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          Staged integration protocol.
        </p>

        <div className="mt-5 space-y-5">
          <StepItem
            isActive
            title="CSV Audit"
            description="Baseline static file analysis."
          />
          <StepItem
            title="Read-Only Connection"
            description="Live polling, blocked writes."
          />
          <StepItem
            title="Controlled Write-Back"
            description="Selective field updates only."
          />
          <StepItem
            title="Custom Rules Execution"
            description="Full autonomous hygiene sweeps."
          />
        </div>

        <div className="mt-6 rounded-lg border border-line bg-surface-muted p-4">
          <p className="text-[13px] font-semibold text-foreground">Reference date</p>
          <p className="mt-2 text-[13px] text-muted">{formatIsoDate(referenceDate)}</p>
        </div>
      </aside>
    </section>
  );
}

function StepItem({
  title,
  description,
  isActive = false,
}: {
  title: string;
  description: string;
  isActive?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
            isActive
              ? "border-brand bg-brand-soft text-brand"
              : "border-line bg-white text-muted"
          }`}
        >
          {isActive ? "1" : ""}
        </div>
        <div className="mt-1 h-full w-px bg-line" />
      </div>
      <div className="pb-1">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[12px] leading-5 text-muted">{description}</p>
      </div>
    </div>
  );
}

function formatIsoDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}
