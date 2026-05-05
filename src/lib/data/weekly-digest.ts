import type { DashboardModel } from "@/lib/data/dashboard";
import type { DealsWorkspaceModel } from "@/lib/data/deals";
import { FINDING_TYPE_LABELS, findDuplicateCompanyGroups } from "@/lib/data/rule-engine";
import { FINDING_TYPES } from "@/lib/data/types";
import type { DemoData, Finding, FindingType } from "@/lib/data/types";

type ActionPriority = "critical" | "high" | "medium";

export type WeeklyDigestIssueTypeRow = {
  finding_type: FindingType;
  finding_type_label: string;
  count: number;
  pipeline_value_at_risk: number;
  recommended_management_action: string;
};

export type WeeklyDigestRiskyDealRow = {
  deal_id: string;
  deal_name: string;
  company_name: string;
  owner_name: string;
  stage: DashboardModel["top_risky_deals"][number]["stage"];
  amount: number;
  close_date: string;
  main_risk_label: string;
  main_risk_reason: string;
  recommended_next_action: string;
  severity: DashboardModel["top_risky_deals"][number]["severity"];
  detail_href: string;
};

export type WeeklyDigestOwnerSummaryRow = {
  owner_id: string;
  owner_name: string;
  owner_team: string;
  open_deals: number;
  total_findings: number;
  critical_findings: number;
  pipeline_at_risk: number;
  hygiene_score: number;
  suggested_coaching_focus: string;
};

export type WeeklyDigestActionItem = {
  id: string;
  title: string;
  supporting_text: string;
  priority: ActionPriority;
};

export type WeeklyDigestModel = {
  reference_date: string;
  scanned_deals_count: number;
  open_deals_count: number;
  issues_found: number;
  critical_high_findings: number;
  pipeline_value_at_risk: number;
  top_issue_types: WeeklyDigestIssueTypeRow[];
  top_risky_deals: WeeklyDigestRiskyDealRow[];
  owner_summary: WeeklyDigestOwnerSummaryRow[];
  recommended_actions: WeeklyDigestActionItem[];
};

const MANAGEMENT_ACTION_BY_TYPE: Record<FindingType, string> = {
  no_next_step: "Create follow-up tasks for deals with no next step",
  stale_deal: "Re-engage stale deals or move them out of stage",
  overdue_close_date: "Update overdue close dates before the next forecast call",
  close_date_risk: "Inspect near-term close-date risk before the next manager review",
  missing_primary_contact: "Associate a primary decision maker on every active opportunity",
  incomplete_contact: "Complete missing contact information for active opportunities",
  duplicate_company: "Clean up duplicate companies before handoff",
  high_value_neglected: "Review all critical high-value neglected deals",
};

const COACHING_FOCUS_BY_TYPE: Record<FindingType, string> = {
  no_next_step: "Coach on next-step discipline so every active opportunity has a dated follow-up.",
  stale_deal: "Push for recent buyer activity or a realistic stage update on quiet deals.",
  overdue_close_date: "Refresh forecast dates and stage confidence before the next forecast call.",
  close_date_risk: "Inspect near-term commits with no recent activity and tighten executive follow-up.",
  missing_primary_contact: "Make sure each active deal has a clear primary decision maker attached.",
  incomplete_contact: "Complete buying-team contact details before opportunities advance further.",
  duplicate_company: "Clean duplicate account records before handoff so ownership and history stay intact.",
  high_value_neglected: "Review neglected high-value deals one by one and escalate follow-up where needed.",
};

const ACTION_PRIORITY_BY_TYPE: Record<FindingType, ActionPriority> = {
  high_value_neglected: "critical",
  close_date_risk: "critical",
  no_next_step: "high",
  stale_deal: "high",
  overdue_close_date: "high",
  missing_primary_contact: "medium",
  incomplete_contact: "medium",
  duplicate_company: "medium",
};

export function buildWeeklyDigestModel(
  data: DemoData,
  options: {
    referenceDate: string;
    dashboard: DashboardModel;
    dealsWorkspace: DealsWorkspaceModel;
  },
): WeeklyDigestModel {
  const openDeals = data.deals.filter((deal) => deal.status === "open");
  const ownerFindingsByOwnerId = groupFindingsByOwner(data.findings);
  const duplicateExposureByOwnerId = buildDuplicateExposureByOwnerId(data);
  const topIssueTypes = buildTopIssueTypes(data.findings);
  const detailHrefByDealId = new Map(
    options.dealsWorkspace.list_rows.map((row) => [row.deal_id, row.detail_href]),
  );

  return {
    reference_date: options.referenceDate,
    scanned_deals_count: data.deals.length,
    open_deals_count: openDeals.length,
    issues_found: data.findings.length,
    critical_high_findings: data.findings.filter(
      (finding) => finding.severity === "critical" || finding.severity === "high",
    ).length,
    pipeline_value_at_risk: calculateDigestPipelineValueAtRisk(data),
    top_issue_types: topIssueTypes.slice(0, 6),
    top_risky_deals: options.dashboard.top_risky_deals.slice(0, 6).map((deal) => ({
      deal_id: deal.deal_id,
      deal_name: deal.deal_name,
      company_name: deal.company_name,
      owner_name: deal.owner_name,
      stage: deal.stage,
      amount: deal.amount,
      close_date: deal.close_date,
      main_risk_label: deal.main_risk_label,
      main_risk_reason: deal.main_risk_reason,
      recommended_next_action: deal.recommended_action,
      severity: deal.severity,
      detail_href: detailHrefByDealId.get(deal.deal_id) ?? `/deals/${deal.deal_id}`,
    })),
    owner_summary: options.dashboard.owner_leaderboard.map((owner) => ({
      owner_id: owner.owner_id,
      owner_name: owner.owner_name,
      owner_team: owner.owner_team,
      open_deals: owner.open_deals,
      total_findings: owner.total_findings,
      critical_findings: owner.critical_findings,
      pipeline_at_risk: owner.pipeline_at_risk,
      hygiene_score: owner.hygiene_score,
      suggested_coaching_focus: resolveCoachingFocus(
        ownerFindingsByOwnerId.get(owner.owner_id) ?? [],
        duplicateExposureByOwnerId.get(owner.owner_id) ?? 0,
        owner.critical_findings,
        owner.total_findings,
      ),
    })),
    recommended_actions: buildRecommendedActions(topIssueTypes),
  };
}

function buildTopIssueTypes(findings: Finding[]) {
  return [...FINDING_TYPES]
    .map((findingType) => {
      const matchingFindings = findings.filter(
        (finding) => finding.finding_type === findingType,
      );

      return {
        finding_type: findingType,
        finding_type_label: FINDING_TYPE_LABELS[findingType],
        count: matchingFindings.length,
        pipeline_value_at_risk: matchingFindings.reduce(
          (total, finding) => total + finding.pipeline_value_at_risk,
          0,
        ),
        recommended_management_action: MANAGEMENT_ACTION_BY_TYPE[findingType],
      };
    })
    .filter((row) => row.count > 0)
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      if (right.pipeline_value_at_risk !== left.pipeline_value_at_risk) {
        return right.pipeline_value_at_risk - left.pipeline_value_at_risk;
      }

      return left.finding_type_label.localeCompare(right.finding_type_label);
    });
}

function buildRecommendedActions(issueTypes: WeeklyDigestIssueTypeRow[]) {
  return issueTypes
    .map((issueType) => ({
      id: issueType.finding_type,
      title: MANAGEMENT_ACTION_BY_TYPE[issueType.finding_type],
      supporting_text: `${issueType.count} findings across ${formatCompactCurrency(issueType.pipeline_value_at_risk)} of pipeline value at risk.`,
      priority: ACTION_PRIORITY_BY_TYPE[issueType.finding_type],
    }))
    .sort((left, right) => {
      const priorityDelta =
        actionPriorityWeight(right.priority) - actionPriorityWeight(left.priority);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, 5);
}

function calculateDigestPipelineValueAtRisk(data: DemoData) {
  const dealsById = new Map(data.deals.map((deal) => [deal.id, deal]));
  const riskyDealIds = new Set<string>();
  let companyLevelPipelineRisk = 0;

  data.findings.forEach((finding) => {
    if (finding.deal_id) {
      riskyDealIds.add(finding.deal_id);
      return;
    }

    companyLevelPipelineRisk += finding.pipeline_value_at_risk;
  });

  return (
    Array.from(riskyDealIds).reduce((total, dealId) => {
      const deal = dealsById.get(dealId);

      if (!deal || deal.status !== "open") {
        return total;
      }

      return total + deal.amount;
    }, 0) + companyLevelPipelineRisk
  );
}

function groupFindingsByOwner(findings: Finding[]) {
  const map = new Map<string, Finding[]>();

  findings.forEach((finding) => {
    if (!finding.owner_id) {
      return;
    }

    const current = map.get(finding.owner_id) ?? [];
    current.push(finding);
    map.set(finding.owner_id, current);
  });

  return map;
}

function buildDuplicateExposureByOwnerId(data: DemoData) {
  const openDeals = data.deals.filter((deal) => deal.status === "open");
  const groups = findDuplicateCompanyGroups(data.companies);
  const duplicateExposureByOwnerId = new Map<string, number>();

  groups.forEach((group) => {
    const companyIds = new Set(group.companies.map((company) => company.id));
    const ownerIds = new Set(
      openDeals
        .filter((deal) => companyIds.has(deal.company_id))
        .map((deal) => deal.owner_id),
    );

    ownerIds.forEach((ownerId) => {
      duplicateExposureByOwnerId.set(
        ownerId,
        (duplicateExposureByOwnerId.get(ownerId) ?? 0) + 1,
      );
    });
  });

  return duplicateExposureByOwnerId;
}

function resolveCoachingFocus(
  ownerFindings: Finding[],
  duplicateExposureCount: number,
  criticalFindings: number,
  totalFindings: number,
) {
  if (criticalFindings > 0) {
    const criticalType = selectDominantFindingType(
      ownerFindings.filter(
        (finding) => finding.severity === "critical" || finding.severity === "high",
      ),
    );

    if (criticalType) {
      return COACHING_FOCUS_BY_TYPE[criticalType];
    }
  }

  const dominantType = selectDominantFindingType(ownerFindings);

  if (dominantType) {
    return COACHING_FOCUS_BY_TYPE[dominantType];
  }

  if (duplicateExposureCount > 0) {
    return COACHING_FOCUS_BY_TYPE.duplicate_company;
  }

  if (totalFindings === 0) {
    return "Maintain current hygiene rhythm and keep late-stage opportunities current.";
  }

  return "Review the open risk queue and reinforce weekly CRM hygiene habits.";
}

function selectDominantFindingType(findings: Finding[]) {
  const counts = new Map<FindingType, number>();

  findings.forEach((finding) => {
    counts.set(finding.finding_type, (counts.get(finding.finding_type) ?? 0) + 1);
  });

  const entries = Array.from(counts.entries()).sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    const priorityDelta =
      actionPriorityWeight(ACTION_PRIORITY_BY_TYPE[right[0]]) -
      actionPriorityWeight(ACTION_PRIORITY_BY_TYPE[left[0]]);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return FINDING_TYPE_LABELS[left[0]].localeCompare(FINDING_TYPE_LABELS[right[0]]);
  });

  return entries[0]?.[0] ?? null;
}

function actionPriorityWeight(priority: ActionPriority) {
  return {
    critical: 3,
    high: 2,
    medium: 1,
  }[priority];
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
