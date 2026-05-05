"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { useFindingsDemoState } from "@/lib/demo-state/use-findings-demo-state";
import type { FindingStatus } from "@/lib/data/types";
import type {
  FindingsWorkspaceModel,
  FindingsWorkspaceRow,
} from "@/lib/data/findings";
import { KPI_COPY } from "@/lib/ui-copy";

type FindingsWorkspaceProps = {
  model: FindingsWorkspaceModel;
};

type FilterState = {
  severity: string;
  owner: string;
  findingType: string;
  status: string;
  stage: string;
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
  Negotiation: "warning",
  "Contract Review": "critical",
  "Closed Won": "success",
  "Closed Lost": "neutral",
} as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const initialFilters: FilterState = {
  severity: "all",
  owner: "all",
  findingType: "all",
  status: "all",
  stage: "all",
};

export function FindingsWorkspace({ model }: FindingsWorkspaceProps) {
  const { effectiveRows, isHydrated, setFindingStatus, createTask } =
    useFindingsDemoState(model.rows);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const filteredRows = useMemo(
    () => effectiveRows.filter((row) => matchesFilters(row, filters)),
    [effectiveRows, filters],
  );

  const summary = useMemo(() => {
    const uniqueDealAmounts = new Map<string, number>();
    let companyLevelRisk = 0;

    filteredRows.forEach((row) => {
      if (row.status === "ignored") {
        return;
      }

      if (row.deal_id && row.amount !== null) {
        uniqueDealAmounts.set(row.deal_id, row.amount);
        return;
      }

      if (!row.deal_id) {
        companyLevelRisk += row.pipeline_value_at_risk;
      }
    });

    return {
      criticalHighFindings: filteredRows.filter(
        (row) => row.severity === "critical" || row.severity === "high",
      ).length,
      pipelineValueAtRisk:
        Array.from(uniqueDealAmounts.values()).reduce(
          (total, amount) => total + amount,
          0,
        ) + companyLevelRisk,
      taskCreatedFindings: filteredRows.filter(
        (row) => row.status === "task_created",
      ).length,
    };
  }, [filteredRows]);

  const summaryCards = [
    {
      label: "Generated findings in view",
      value: String(filteredRows.length),
      status: "Current filter",
      tone: "neutral" as const,
      description:
        "Generated findings currently visible after the active queue filters are applied.",
    },
    {
      label: KPI_COPY.criticalHighFindings.label,
      value: String(summary.criticalHighFindings),
      status: "Priority view",
      tone: "critical" as const,
      description: KPI_COPY.criticalHighFindings.description,
    },
    {
      label: KPI_COPY.pipelineValueAtRiskIssueRollup.label,
      value: currencyFormatter.format(summary.pipelineValueAtRisk),
      status: "Filtered rollup",
      tone: "warning" as const,
      description: KPI_COPY.pipelineValueAtRiskIssueRollup.description,
    },
    {
      label: KPI_COPY.taskCreatedFindings.label,
      value: String(summary.taskCreatedFindings),
      status: "Local browser state",
      tone: "success" as const,
      description: KPI_COPY.taskCreatedFindings.description,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="app-panel p-5">
        <div className="flex flex-col gap-4 border-b border-line pb-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="app-overline">Filters</p>
            <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
              Findings filters
            </h2>
            <p className="mt-1 text-[13px] leading-6 text-muted">
              Narrow the queue by severity, owner, finding type, status, or
              stage to keep manager review focused and fast.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="neutral">{filteredRows.length} findings shown</Badge>
            <Button
              variant="ghost"
              icon="close"
              onClick={() => {
                setFilters(initialFilters);
                setFeedbackMessage("");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <FilterSelect
            label="Severity"
            value={filters.severity}
            onChange={(value) =>
              setFilters((current) => ({ ...current, severity: value }))
            }
            options={[
              { value: "all", label: "Severity: All" },
              ...model.filter_options.severities.map((option) => ({
                ...option,
                label: `Severity: ${option.label}`,
              })),
            ]}
          />
          <FilterSelect
            label="Owner"
            value={filters.owner}
            onChange={(value) => setFilters((current) => ({ ...current, owner: value }))}
            options={[
              { value: "all", label: "Owner: All" },
              ...model.filter_options.owners.map((option) => ({
                ...option,
                label: `Owner: ${option.label}`,
              })),
            ]}
          />
          <FilterSelect
            label="Type"
            value={filters.findingType}
            onChange={(value) =>
              setFilters((current) => ({ ...current, findingType: value }))
            }
            options={[
              { value: "all", label: "Type: All" },
              ...model.filter_options.finding_types.map((option) => ({
                ...option,
                label: `Type: ${option.label}`,
              })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
            options={[
              { value: "all", label: "Status: All" },
              ...model.filter_options.statuses.map((option) => ({
                ...option,
                label: `Status: ${option.label}`,
              })),
            ]}
          />
          <FilterSelect
            label="Stage"
            value={filters.stage}
            onChange={(value) => setFilters((current) => ({ ...current, stage: value }))}
            options={[
              { value: "all", label: "Stage: All" },
              ...model.filter_options.stages.map((option) => ({
                ...option,
                label: option.value === "unlinked" ? "Stage: Unlinked" : `Stage: ${option.label}`,
              })),
            ]}
          />
        </div>

        <p className="mt-4 text-[12px] leading-6 text-muted">
          Status changes and simulated bot tasks persist in this browser for the
          current demo session.
        </p>
      </section>

      {feedbackMessage ? (
        <section className="rounded-lg border border-success/20 bg-success-soft px-4 py-3 text-[13px] font-medium text-success">
          {feedbackMessage}
        </section>
      ) : null}

      <DataTableWrapper
        title="Findings queue"
        description={`Generated findings as of ${formatIsoDate(model.reference_date)} with manager-ready actions for review, ignore, and local CRM task simulation.`}
        footer={`Showing ${filteredRows.length} of ${effectiveRows.length} findings.`}
        mobileCards={filteredRows.map((row) => (
          <FindingMobileCard
            key={row.id}
            row={row}
            onMarkReviewed={() => {
              setFindingStatus(row.id, "reviewed");
              setFeedbackMessage(`${row.finding_type_label} marked as reviewed.`);
            }}
            onIgnore={() => {
              setFindingStatus(row.id, "ignored");
              setFeedbackMessage(`${row.finding_type_label} marked as ignored.`);
            }}
            onCreateTask={() => {
              const created = createTask(row);

              if (created) {
                setFeedbackMessage("Follow-up task created in CRM simulation.");
              }
            }}
          />
        ))}
        stickyHeader
        stickyHeaderOffsetClassName="top-16"
        columns={[
          "Severity",
          "Finding type",
          "Deal & company",
          "Owner",
          "Amount",
          "Stage",
          "Reason",
          "Recommended next action",
          "Status",
          "Actions",
        ]}
        emptyState={
          <EmptyState
            title={
              isHydrated
                ? "No findings match the current filters"
                : "Loading findings workspace"
            }
            description={
              isHydrated
                ? "Try broadening one or more filters to bring findings back into the manager queue."
                : "Restoring browser-persisted finding statuses and bot-created tasks."
            }
            hint={
              isHydrated
                ? "Clear filters to return to the full generated findings queue."
                : undefined
            }
          />
        }
      >
        {filteredRows.map((row) => (
          <tr key={row.id} className="border-t border-line align-top">
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <Badge tone={severityToneMap[row.severity]}>{row.severity}</Badge>
            </td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <p className="font-semibold text-foreground">{row.finding_type_label}</p>
              <p className="mt-1 text-xs text-muted">{row.id}</p>
            </td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              {row.deal_id ? (
                <Link href={`/deals/${row.deal_id}`} className="font-semibold text-foreground hover:text-brand">
                  {row.deal_name}
                </Link>
              ) : (
                <p className="font-semibold text-foreground">{row.deal_name}</p>
              )}
              <p className="mt-1 text-xs text-muted">{row.company_name}</p>
            </td>
            <td className="px-4 py-5 text-[13px] text-muted sm:px-6">
              {row.owner_name}
            </td>
            <td className="px-4 py-5 text-[13px] font-medium text-foreground sm:px-6">
              {row.amount !== null ? currencyFormatter.format(row.amount) : "N/A"}
            </td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              {row.stage ? (
                <Badge tone={stageToneMap[row.stage as keyof typeof stageToneMap] ?? "neutral"}>
                  {row.stage}
                </Badge>
              ) : (
                <span className="text-muted">Unlinked</span>
              )}
            </td>
            <td className="px-4 py-5 text-[13px] text-muted sm:px-6">
              <p className="max-w-[18rem] leading-6">{row.reason}</p>
            </td>
            <td className="px-4 py-5 text-[13px] text-foreground sm:px-6">
              <p className="max-w-[16rem] leading-6">{row.recommended_action}</p>
            </td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <Badge tone={statusToneMap[row.status]}>{formatStatusLabel(row.status)}</Badge>
            </td>
            <td className="px-4 py-5 text-[13px] sm:px-6">
              <div className="flex min-w-[11.5rem] flex-col gap-2.5">
                <Button
                  className="w-full"
                  size="sm"
                  variant="secondary"
                  disabled={row.status === "reviewed"}
                  onClick={() => {
                    setFindingStatus(row.id, "reviewed");
                    setFeedbackMessage(`${row.finding_type_label} marked as reviewed.`);
                  }}
                >
                  Mark reviewed
                </Button>
                <Button
                  className="w-full"
                  size="sm"
                  variant="ghost"
                  disabled={row.status === "ignored"}
                  onClick={() => {
                    setFindingStatus(row.id, "ignored");
                    setFeedbackMessage(`${row.finding_type_label} marked as ignored.`);
                  }}
                >
                  Ignore
                </Button>
                {row.can_create_task ? (
                  <Button
                    className="w-full"
                    size="sm"
                    variant={row.status === "task_created" ? "success" : "primary"}
                    disabled={row.status === "task_created"}
                    onClick={() => {
                      const created = createTask(row);

                      if (created) {
                        setFeedbackMessage(
                          "Follow-up task created in CRM simulation.",
                        );
                      }
                    }}
                  >
                    {row.status === "task_created"
                      ? "Task created"
                      : "Create follow-up task"}
                  </Button>
                ) : (
                  <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-muted">
                    Task creation unavailable without a linked deal.
                  </p>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTableWrapper>
    </div>
  );
}

function FindingMobileCard({
  row,
  onMarkReviewed,
  onIgnore,
  onCreateTask,
}: {
  row: FindingsWorkspaceRow & { status: FindingStatus };
  onMarkReviewed: () => void;
  onIgnore: () => void;
  onCreateTask: () => void;
}) {
  return (
    <article className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={severityToneMap[row.severity]}>{row.severity}</Badge>
            <Badge tone={statusToneMap[row.status]}>{formatStatusLabel(row.status)}</Badge>
          </div>
          <p className="mt-3 text-[14px] font-semibold text-foreground">
            {row.finding_type_label}
          </p>
          <p className="mt-1 text-[12px] text-muted">{row.id}</p>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-semibold text-foreground">
            {row.amount !== null ? currencyFormatter.format(row.amount) : "N/A"}
          </p>
          <p className="mt-1 text-[12px] text-muted">{row.owner_name}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-lg bg-surface-muted p-3">
        <div>
          <p className="text-[12px] font-semibold text-foreground">
            {row.deal_id ? (
              <Link href={`/deals/${row.deal_id}`} className="hover:text-brand">
                {row.deal_name}
              </Link>
            ) : (
              row.deal_name
            )}
          </p>
          <p className="mt-1 text-[12px] text-muted">{row.company_name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {row.stage ? (
            <Badge tone={stageToneMap[row.stage as keyof typeof stageToneMap] ?? "neutral"}>
              {row.stage}
            </Badge>
          ) : (
            <Badge tone="neutral">Unlinked</Badge>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Reason
          </p>
          <p className="mt-1 text-[12px] leading-6 text-muted">{row.reason}</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Recommended next action
          </p>
          <p className="mt-1 text-[12px] leading-6 text-foreground">
            {row.recommended_action}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Button
          className="w-full"
          size="sm"
          variant="secondary"
          disabled={row.status === "reviewed"}
          onClick={onMarkReviewed}
        >
          Mark reviewed
        </Button>
        <Button
          className="w-full"
          size="sm"
          variant="ghost"
          disabled={row.status === "ignored"}
          onClick={onIgnore}
        >
          Ignore
        </Button>
        {row.can_create_task ? (
          <Button
            className="w-full"
            size="sm"
            variant={row.status === "task_created" ? "success" : "primary"}
            disabled={row.status === "task_created"}
            onClick={onCreateTask}
          >
            {row.status === "task_created" ? "Task created" : "Create follow-up task"}
          </Button>
        ) : (
          <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-muted">
            Task creation unavailable without a linked deal.
          </p>
        )}
      </div>
    </article>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function matchesFilters(
  row: FindingsWorkspaceRow & { status: string },
  filters: FilterState,
) {
  return (
    (filters.severity === "all" || row.severity === filters.severity) &&
    (filters.owner === "all" || row.owner_id === filters.owner) &&
    (filters.findingType === "all" || row.finding_type === filters.findingType) &&
    (filters.status === "all" || row.status === filters.status) &&
    (filters.stage === "all" ||
      (filters.stage === "unlinked" ? row.stage === null : row.stage === filters.stage))
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
