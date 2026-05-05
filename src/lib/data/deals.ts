import {
  FINDING_TYPE_LABELS,
  buildRuleEngineContext,
  findDuplicateCompanyGroups,
  getCompanyForDeal,
  getLastActivityForDeal,
  getPrimaryContactForDeal,
} from "@/lib/data/rule-engine";
import type {
  DealStage,
  DemoData,
  Finding,
  FindingSeverity,
  FindingStatus,
  FindingType,
  Task,
} from "@/lib/data/types";

type DealRiskSignal = {
  id: string;
  severity: FindingSeverity;
  finding_type: FindingType;
  type_label: string;
  reason: string;
  recommended_action: string;
  pipeline_value_at_risk: number;
  initial_status: FindingStatus;
  source: "deal" | "company";
};

export type DealsListRow = {
  deal_id: string;
  deal_name: string;
  company_name: string;
  owner_name: string;
  stage: DealStage;
  amount: number;
  close_date: string;
  last_activity_at: string | null;
  risk_indicators: Array<{
    severity: FindingSeverity;
    label: string;
  }>;
  open_findings_count: number;
  detail_href: string;
};

export type DealDetailModel = {
  deal_id: string;
  deal_name: string;
  company: {
    name: string;
    domain: string;
    industry: string;
    employee_count: number;
    annual_revenue: number;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    role: string;
    team: string;
  };
  primary_contact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string;
  } | null;
  stage: DealStage;
  amount: number;
  probability: number;
  close_date: string;
  pipeline: string;
  last_activity_at: string | null;
  recommended_next_action: string;
  recent_activities: Array<{
    id: string;
    type: string;
    subject: string;
    occurred_at: string;
  }>;
  base_open_tasks: Array<{
    id: string;
    title: string;
    due_date: string;
    status: Task["status"];
    source: Task["source"];
    created_at: string;
  }>;
  findings: Array<{
    id: string;
    severity: FindingSeverity;
    type_label: string;
    reason: string;
    recommended_action: string;
    pipeline_value_at_risk: number;
    initial_status: FindingStatus;
    source: "deal" | "company";
  }>;
  risk_summary: {
    total_findings: number;
    critical_findings: number;
    pipeline_value_at_risk: number;
  };
};

export type DealsWorkspaceModel = {
  list_rows: DealsListRow[];
  details_by_id: Record<string, DealDetailModel>;
};

export function buildDealsWorkspaceModel(data: DemoData): DealsWorkspaceModel {
  const context = buildRuleEngineContext(data);
  const directFindingsByDeal = groupDealFindings(data.findings);
  const companyFindingsByCompanyId = groupCompanyLevelFindingsByCompany(
    data,
    data.findings,
  );
  const usersById = new Map(data.users.map((user) => [user.id, user]));

  const listRows = data.deals
    .filter((deal) => deal.status === "open")
    .map((deal) => {
      const company = getCompanyForDeal(context, deal);
      const owner = usersById.get(deal.owner_id);
      const signals = collectDealSignals(
        deal.id,
        deal.company_id,
        directFindingsByDeal,
        companyFindingsByCompanyId,
      );
      const lastActivity = getLastActivityForDeal(context, deal.id);

      if (!company || !owner) {
        return null;
      }

      return {
        deal_id: deal.id,
        deal_name: deal.name,
        company_name: company.name,
        owner_name: owner.name,
        stage: deal.stage,
        amount: deal.amount,
        close_date: deal.close_date,
        last_activity_at: lastActivity?.occurred_at ?? null,
        risk_indicators: signals.slice(0, 3).map((signal) => ({
          severity: signal.severity,
          label: signal.type_label,
        })),
        open_findings_count: signals.length,
        detail_href: `/deals/${deal.id}`,
      };
    })
    .filter((row): row is DealsListRow => row !== null)
    .sort(compareDealsListRows);

  const detailsById = Object.fromEntries(
    data.deals.map((deal) => {
      const company = getCompanyForDeal(context, deal);
      const primaryContact = getPrimaryContactForDeal(context, deal);
      const owner = usersById.get(deal.owner_id);
      const lastActivity = getLastActivityForDeal(context, deal.id);
      const dealActivities = context.activitiesByDeal.get(deal.id) ?? [];
      const dealTasks = (context.tasksByDeal.get(deal.id) ?? [])
        .filter((task) => task.status === "open")
        .sort((left, right) => left.due_date.localeCompare(right.due_date));
      const signals = collectDealSignals(
        deal.id,
        deal.company_id,
        directFindingsByDeal,
        companyFindingsByCompanyId,
      );
      const recommendedSignal = signals[0];

      if (!company || !owner) {
        return [deal.id, null];
      }

      const detail: DealDetailModel = {
        deal_id: deal.id,
        deal_name: deal.name,
        company: {
          name: company.name,
          domain: company.domain,
          industry: company.industry,
          employee_count: company.employee_count,
          annual_revenue: company.annual_revenue,
        },
        owner: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          role: owner.role,
          team: owner.team,
        },
        primary_contact: primaryContact
          ? {
              id: primaryContact.id,
              name: `${primaryContact.first_name} ${primaryContact.last_name}`,
              email: primaryContact.email,
              phone: primaryContact.phone,
              job_title: primaryContact.job_title,
            }
          : null,
        stage: deal.stage,
        amount: deal.amount,
        probability: deal.probability,
        close_date: deal.close_date,
        pipeline: deal.pipeline,
        last_activity_at: lastActivity?.occurred_at ?? null,
        recommended_next_action:
          recommendedSignal?.recommended_action ??
          "Maintain the current follow-up cadence and keep the record up to date.",
        recent_activities: dealActivities.slice(0, 6).map((activity) => ({
          id: activity.id,
          type: activity.type,
          subject: activity.subject,
          occurred_at: activity.occurred_at,
        })),
        base_open_tasks: dealTasks.map((task) => ({
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          status: task.status,
          source: task.source,
          created_at: task.created_at,
        })),
        findings: signals.map((signal) => ({
          id: signal.id,
          severity: signal.severity,
          type_label: signal.type_label,
          reason: signal.reason,
          recommended_action: signal.recommended_action,
          pipeline_value_at_risk: signal.pipeline_value_at_risk,
          initial_status: signal.initial_status,
          source: signal.source,
        })),
        risk_summary: {
          total_findings: signals.length,
          critical_findings: signals.filter((signal) => signal.severity === "critical").length,
          pipeline_value_at_risk: deal.amount,
        },
      };

      return [deal.id, detail];
    }),
  );

  return {
    list_rows: listRows,
    details_by_id: Object.fromEntries(
      Object.entries(detailsById).filter((entry): entry is [string, DealDetailModel] => Boolean(entry[1])),
    ),
  };
}

function groupDealFindings(findings: Finding[]) {
  const map = new Map<string, DealRiskSignal[]>();

  findings.forEach((finding) => {
    if (!finding.deal_id) {
      return;
    }

    const current = map.get(finding.deal_id) ?? [];
    current.push(toDealRiskSignal(finding, "deal"));
    map.set(finding.deal_id, current);
  });

  map.forEach((signals, dealId) => {
    map.set(dealId, signals.sort(compareSignals));
  });

  return map;
}

function groupCompanyLevelFindingsByCompany(
  data: DemoData,
  findings: Finding[],
) {
  const companyLevelFindings = findings.filter((finding) => !finding.deal_id);
  const groups = findDuplicateCompanyGroups(data.companies);
  const map = new Map<string, DealRiskSignal[]>();

  groups.forEach((group) => {
    const matchingFinding = companyLevelFindings.find(
      (finding) =>
        finding.finding_type === "duplicate_company" &&
        group.companies.some((company) => company.id === finding.company_id),
    );

    if (!matchingFinding) {
      return;
    }

    group.companies.forEach((company) => {
      const current = map.get(company.id) ?? [];
      current.push(toDealRiskSignal(matchingFinding, "company"));
      map.set(company.id, current);
    });
  });

  return map;
}

function collectDealSignals(
  dealId: string,
  companyId: string,
  directFindingsByDeal: Map<string, DealRiskSignal[]>,
  companyFindingsByCompanyId: Map<string, DealRiskSignal[]>,
) {
  const signals = [
    ...(directFindingsByDeal.get(dealId) ?? []),
    ...(companyFindingsByCompanyId.get(companyId) ?? []),
  ];

  return Array.from(new Map(signals.map((signal) => [signal.id, signal])).values()).sort(
    compareSignals,
  );
}

function toDealRiskSignal(
  finding: Finding,
  source: "deal" | "company",
): DealRiskSignal {
  return {
    id: finding.id,
    severity: finding.severity,
    finding_type: finding.finding_type,
    type_label: FINDING_TYPE_LABELS[finding.finding_type],
    reason: finding.reason,
    recommended_action: finding.recommended_action,
    pipeline_value_at_risk: finding.pipeline_value_at_risk,
    initial_status: finding.status,
    source,
  };
}

function compareSignals(left: DealRiskSignal, right: DealRiskSignal) {
  const severityDelta = severityWeight(right.severity) - severityWeight(left.severity);

  if (severityDelta !== 0) {
    return severityDelta;
  }

  if (right.pipeline_value_at_risk !== left.pipeline_value_at_risk) {
    return right.pipeline_value_at_risk - left.pipeline_value_at_risk;
  }

  return left.type_label.localeCompare(right.type_label);
}

function compareDealsListRows(left: DealsListRow, right: DealsListRow) {
  if (right.open_findings_count !== left.open_findings_count) {
    return right.open_findings_count - left.open_findings_count;
  }

  if (right.amount !== left.amount) {
    return right.amount - left.amount;
  }

  return left.close_date.localeCompare(right.close_date);
}

function severityWeight(severity: FindingSeverity) {
  return {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }[severity];
}
