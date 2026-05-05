import { FINDING_TYPE_LABELS } from "@/lib/data/rule-engine";
import { FINDING_SEVERITIES, FINDING_STATUSES } from "@/lib/data/types";
import type {
  Deal,
  DealStage,
  DemoData,
  Finding,
  FindingSeverity,
  FindingStatus,
  FindingType,
} from "@/lib/data/types";

export type FindingsWorkspaceRow = {
  id: string;
  severity: FindingSeverity;
  finding_type: FindingType;
  finding_type_label: string;
  deal_id: string | null;
  deal_name: string;
  company_id: string | null;
  company_name: string;
  owner_id: string | null;
  owner_name: string;
  amount: number | null;
  stage: Deal["stage"] | null;
  reason: string;
  recommended_action: string;
  pipeline_value_at_risk: number;
  initial_status: FindingStatus;
  created_at: string;
  can_create_task: boolean;
};

export type FindingsWorkspaceModel = {
  reference_date: string;
  rows: FindingsWorkspaceRow[];
  filter_options: {
    severities: Array<{
      value: FindingSeverity;
      label: string;
    }>;
    owners: Array<{
      value: string;
      label: string;
    }>;
    finding_types: Array<{
      value: FindingType;
      label: string;
    }>;
    statuses: Array<{
      value: FindingStatus;
      label: string;
    }>;
    stages: Array<{
      value: Deal["stage"] | "unlinked";
      label: string;
    }>;
  };
};

export function buildFindingsWorkspaceModel(
  data: DemoData,
  referenceDate: string,
): FindingsWorkspaceModel {
  const dealsById = new Map(data.deals.map((deal) => [deal.id, deal]));
  const companiesById = new Map(data.companies.map((company) => [company.id, company]));
  const usersById = new Map(data.users.map((user) => [user.id, user]));

  const rows = [...data.findings]
    .map((finding) => toWorkspaceRow(finding, dealsById, companiesById, usersById))
    .sort(compareWorkspaceRows);

  const ownerOptions = Array.from(
    new Map(
      rows
        .filter((row) => row.owner_id)
        .map((row) => [row.owner_id as string, row.owner_name]),
    ).entries(),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label));

  const stageValues = Array.from(
    new Set<DealStage | "unlinked">(rows.map((row) => row.stage ?? "unlinked")),
  );
  const stageOptions = stageValues
    .map((value) => ({
      value,
      label: value === "unlinked" ? "No linked deal" : value,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));

  return {
    reference_date: referenceDate,
    rows,
    filter_options: {
      severities: [...FINDING_SEVERITIES]
        .reverse()
        .map((value) => ({
          value,
          label: capitalize(value),
        })),
      owners: ownerOptions,
      finding_types: Array.from(
        new Map(rows.map((row) => [row.finding_type, row.finding_type_label])).entries(),
      )
        .map(([value, label]) => ({ value, label }))
        .sort((left, right) => left.label.localeCompare(right.label)),
      statuses: [...FINDING_STATUSES].map((value) => ({
        value,
        label: formatStatusLabel(value),
      })),
      stages: stageOptions,
    },
  };
}

function toWorkspaceRow(
  finding: Finding,
  dealsById: Map<string, Deal>,
  companiesById: Map<string, { id: string; name: string }>,
  usersById: Map<string, { id: string; name: string }>,
): FindingsWorkspaceRow {
  const linkedDeal = finding.deal_id ? dealsById.get(finding.deal_id) ?? null : null;
  const linkedCompanyId = linkedDeal?.company_id ?? finding.company_id;
  const linkedCompany = linkedCompanyId
    ? companiesById.get(linkedCompanyId) ?? null
    : null;
  const linkedOwnerId = linkedDeal?.owner_id ?? finding.owner_id;
  const linkedOwner = linkedOwnerId ? usersById.get(linkedOwnerId) ?? null : null;

  return {
    id: finding.id,
    severity: finding.severity,
    finding_type: finding.finding_type,
    finding_type_label: FINDING_TYPE_LABELS[finding.finding_type],
    deal_id: finding.deal_id,
    deal_name: linkedDeal?.name ?? "Company data hygiene",
    company_id: linkedCompanyId ?? null,
    company_name: linkedCompany?.name ?? "Portfolio-wide",
    owner_id: linkedOwnerId ?? null,
    owner_name: linkedOwner?.name ?? "Shared ownership",
    amount: linkedDeal?.amount ?? null,
    stage: linkedDeal?.stage ?? null,
    reason: finding.reason,
    recommended_action: finding.recommended_action,
    pipeline_value_at_risk: finding.pipeline_value_at_risk,
    initial_status: finding.status,
    created_at: finding.created_at,
    can_create_task: Boolean(linkedDeal?.id),
  };
}

function compareWorkspaceRows(left: FindingsWorkspaceRow, right: FindingsWorkspaceRow) {
  const severityDelta = severityWeight(right.severity) - severityWeight(left.severity);

  if (severityDelta !== 0) {
    return severityDelta;
  }

  if (right.pipeline_value_at_risk !== left.pipeline_value_at_risk) {
    return right.pipeline_value_at_risk - left.pipeline_value_at_risk;
  }

  return left.deal_name.localeCompare(right.deal_name);
}

function severityWeight(severity: FindingSeverity) {
  return {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }[severity];
}

function formatStatusLabel(status: FindingStatus) {
  return status
    .split("_")
    .map(capitalize)
    .join(" ");
}

function capitalize(value: string) {
  return `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
}
