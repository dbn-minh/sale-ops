import {
  FINDING_TYPE_LABELS,
  calculatePipelineValueAtRisk,
  findDuplicateCompanyGroups,
} from "@/lib/data/rule-engine";
import { FINDING_TYPES } from "@/lib/data/types";
import type {
  Company,
  Deal,
  DemoData,
  Finding,
  FindingSeverity,
  FindingType,
  User,
} from "@/lib/data/types";

type DashboardTone = "brand" | "critical" | "neutral" | "success" | "warning";

type DashboardBreakdownItem = {
  label: string;
  value: string;
  ratio: number;
  tone: DashboardTone;
  subtext?: string;
};

type DashboardKpi = {
  label: string;
  value: string;
  status: string;
  tone: DashboardTone;
  description: string;
};

type TopRiskyDealRow = {
  deal_id: string;
  deal_name: string;
  company_name: string;
  owner_name: string;
  stage: Deal["stage"];
  amount: number;
  close_date: string;
  main_risk_label: string;
  main_risk_reason: string;
  recommended_action: string;
  severity: FindingSeverity;
  finding_count: number;
};

type OwnerLeaderboardRow = {
  owner_id: string;
  owner_name: string;
  owner_team: string;
  open_deals: number;
  total_findings: number;
  critical_findings: number;
  pipeline_at_risk: number;
  hygiene_score: number;
};

export type DashboardModel = {
  reference_date: string;
  kpis: DashboardKpi[];
  findings_by_severity: DashboardBreakdownItem[];
  findings_by_type: DashboardBreakdownItem[];
  pipeline_value_at_risk_by_owner: DashboardBreakdownItem[];
  top_risky_deals: TopRiskyDealRow[];
  owner_leaderboard: OwnerLeaderboardRow[];
};

type DealRiskSignal = {
  finding_type: FindingType;
  severity: FindingSeverity;
  label: string;
  reason: string;
  recommended_action: string;
};

type RiskyDealAggregate = {
  deal: Deal;
  company: Company;
  owner: User;
  signals: DealRiskSignal[];
  primary_signal: DealRiskSignal;
};

const SEVERITY_ORDER: FindingSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

const SEVERITY_WEIGHT: Record<FindingSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const SEVERITY_TONES: Record<FindingSeverity, DashboardTone> = {
  critical: "critical",
  high: "warning",
  medium: "brand",
  low: "neutral",
};

export function buildDashboardModel(data: DemoData): DashboardModel {
  const openDeals = data.deals.filter((deal) => deal.status === "open");
  const companiesById = new Map(data.companies.map((company) => [company.id, company]));
  const usersById = new Map(data.users.map((user) => [user.id, user]));
  const findingsByDealId = groupFindingsByDeal(data.findings);
  const duplicateGroups = findDuplicateCompanyGroups(data.companies);
  const duplicateGroupByCompanyId = new Map<string, Company[]>();

  duplicateGroups.forEach((group) => {
    group.companies.forEach((company) => {
      duplicateGroupByCompanyId.set(company.id, group.companies);
    });
  });

  const riskyDeals = openDeals
    .map((deal) => buildRiskyDealRow(deal, findingsByDealId, duplicateGroupByCompanyId, companiesById, usersById))
    .filter((deal): deal is RiskyDealAggregate => deal !== null)
    .sort(compareRiskyDeals);

  const riskyDealRecords = riskyDeals.map((deal) => deal.deal);
  const totalFindings = data.findings.length;
  const criticalHighFindings = data.findings.filter(
    (finding) => finding.severity === "critical" || finding.severity === "high",
  ).length;

  const countByType = new Map<FindingType, number>();

  data.findings.forEach((finding) => {
    countByType.set(
      finding.finding_type,
      (countByType.get(finding.finding_type) ?? 0) + 1,
    );
  });

  return {
    reference_date: data.findings[0]?.created_at.slice(0, 10) ?? "",
    kpis: [
      {
        label: "Open deals scanned",
        value: String(openDeals.length),
        status: "CRM Simulation Mode",
        tone: "brand",
        description:
          "Every open opportunity in the seeded CRM dataset is included in the hygiene scan.",
      },
      {
        label: "Total findings",
        value: String(totalFindings),
        status: "Detection live",
        tone: "neutral",
        description:
          "Live hygiene findings now surface where pipeline records and follow-up discipline are slipping.",
      },
      {
        label: "Critical/high findings",
        value: String(criticalHighFindings),
        status: "Manager review",
        tone: "critical",
        description:
          "These are the issues most likely to hide revenue risk or demand immediate sales manager attention.",
      },
      {
        label: "Pipeline value at risk",
        value: formatCompactCurrency(calculatePipelineValueAtRisk(riskyDealRecords)),
        status: "Revenue signal",
        tone: "warning",
        description:
          "This rollup reflects unique open deals with active hygiene issues or duplicate-company exposure.",
      },
      {
        label: "Deals with no next step",
        value: String(countByType.get("no_next_step") ?? 0),
        status: "Follow-up gap",
        tone: "warning",
        description:
          "These deals are open without a future task, leaving the next action undocumented.",
      },
      {
        label: "Stale deals",
        value: String(countByType.get("stale_deal") ?? 0),
        status: "Engagement risk",
        tone: "brand",
        description:
          "These opportunities have gone quiet long enough to threaten momentum and forecast confidence.",
      },
      {
        label: "Overdue close dates",
        value: String(countByType.get("overdue_close_date") ?? 0),
        status: "Forecast watch",
        tone: "neutral",
        description:
          "These open deals are still carrying close dates that have already passed the reference date.",
      },
    ],
    findings_by_severity: buildFindingsBySeverity(data.findings, totalFindings),
    findings_by_type: buildFindingsByType(countByType, totalFindings),
    pipeline_value_at_risk_by_owner: buildPipelineByOwner(
      riskyDealRecords,
      data.users,
      calculatePipelineValueAtRisk(riskyDealRecords),
    ),
    top_risky_deals: riskyDeals.slice(0, 8).map((deal) => ({
      deal_id: deal.deal.id,
      deal_name: deal.deal.name,
      company_name: deal.company.name,
      owner_name: deal.owner.name,
      stage: deal.deal.stage,
      amount: deal.deal.amount,
      close_date: deal.deal.close_date,
      main_risk_label: deal.primary_signal.label,
      main_risk_reason: deal.primary_signal.reason,
      recommended_action: deal.primary_signal.recommended_action,
      severity: deal.primary_signal.severity,
      finding_count: deal.signals.length,
    })),
    owner_leaderboard: buildOwnerLeaderboard(
      data.users,
      openDeals,
      data.findings,
      riskyDealRecords,
      duplicateGroups.map((group) => group.companies),
    ),
  };
}

function buildFindingsBySeverity(
  findings: Finding[],
  totalFindings: number,
): DashboardBreakdownItem[] {
  return SEVERITY_ORDER.map((severity) => {
    const count = findings.filter((finding) => finding.severity === severity).length;

    return {
      label:
        severity === "critical"
          ? "Critical findings"
          : severity === "high"
            ? "High findings"
            : severity === "medium"
              ? "Medium findings"
              : "Low findings",
      value: String(count),
      ratio: totalFindings === 0 ? 0 : count / totalFindings,
      tone: SEVERITY_TONES[severity],
      subtext:
        totalFindings === 0
          ? "No findings generated"
          : `${Math.round((count / totalFindings) * 100)}% of total findings`,
    };
  });
}

function buildFindingsByType(
  countByType: Map<FindingType, number>,
  totalFindings: number,
): DashboardBreakdownItem[] {
  return [...FINDING_TYPES]
    .map((findingType) => {
      const count = countByType.get(findingType) ?? 0;

      return {
      label: FINDING_TYPE_LABELS[findingType],
      value: String(count),
      ratio: totalFindings === 0 ? 0 : count / totalFindings,
      tone: resolveTypeTone(findingType),
      subtext:
        totalFindings === 0
          ? "No findings generated"
          : `${Math.round((count / totalFindings) * 100)}% of total findings`,
      };
    })
    .sort((left, right) => Number(right.value) - Number(left.value));
}

function buildPipelineByOwner(
  riskyDeals: Deal[],
  users: User[],
  totalPipelineAtRisk: number,
): DashboardBreakdownItem[] {
  return users
    .map((user) => {
      const ownerDeals = riskyDeals.filter((deal) => deal.owner_id === user.id);
      const pipelineValueAtRisk = calculatePipelineValueAtRisk(ownerDeals);

      return {
        label: user.name,
        value: formatCompactCurrency(pipelineValueAtRisk),
        ratio: totalPipelineAtRisk === 0 ? 0 : pipelineValueAtRisk / totalPipelineAtRisk,
        tone:
          pipelineValueAtRisk > totalPipelineAtRisk * 0.28
            ? ("critical" as DashboardTone)
            : ("brand" as DashboardTone),
        subtext: `${ownerDeals.length} deals needing attention`,
        pipelineValueAtRisk,
      };
    })
    .filter((owner) => owner.pipelineValueAtRisk > 0)
    .sort((left, right) => right.pipelineValueAtRisk - left.pipelineValueAtRisk)
    .map((owner) => ({
      label: owner.label,
      value: owner.value,
      ratio: owner.ratio,
      tone: owner.tone,
      subtext: owner.subtext,
    }));
}

function buildOwnerLeaderboard(
  users: User[],
  openDeals: Deal[],
  findings: Finding[],
  riskyDeals: Deal[],
  duplicateCompanyGroups: Company[][],
) {
  return users
    .map((user) => {
      const ownerOpenDeals = openDeals.filter((deal) => deal.owner_id === user.id);
      const ownerFindings = findings.filter((finding) => finding.owner_id === user.id);
      const duplicateExposureCount = duplicateCompanyGroups.filter((group) => {
        const companyIds = new Set(group.map((company) => company.id));

        return ownerOpenDeals.some((deal) => companyIds.has(deal.company_id));
      }).length;
      const ownerRiskyDeals = riskyDeals.filter((deal) => deal.owner_id === user.id);
      const criticalFindings = ownerFindings.filter(
        (finding) => finding.severity === "critical",
      ).length;
      const totalFindings = ownerFindings.length + duplicateExposureCount;
      const pipelineAtRisk = calculatePipelineValueAtRisk(ownerRiskyDeals);

      return {
        owner_id: user.id,
        owner_name: user.name,
        owner_team: user.team,
        open_deals: ownerOpenDeals.length,
        total_findings: totalFindings,
        critical_findings: criticalFindings,
        pipeline_at_risk: pipelineAtRisk,
        hygiene_score: calculateHygieneScore(
          ownerOpenDeals.length,
          ownerFindings,
          duplicateExposureCount,
        ),
      };
    })
    .sort((left, right) => {
      if (left.hygiene_score !== right.hygiene_score) {
        return left.hygiene_score - right.hygiene_score;
      }

      return right.pipeline_at_risk - left.pipeline_at_risk;
    });
}

function buildRiskyDealRow(
  deal: Deal,
  findingsByDealId: Map<string, Finding[]>,
  duplicateGroupByCompanyId: Map<string, Company[]>,
  companiesById: Map<string, Company>,
  usersById: Map<string, User>,
): RiskyDealAggregate | null {
  const company = companiesById.get(deal.company_id);
  const owner = usersById.get(deal.owner_id);

  if (!company || !owner) {
    return null;
  }

  const directFindings = findingsByDealId.get(deal.id) ?? [];
  const signals = [
    ...directFindings.map(toRiskSignal),
    ...createDuplicateCompanySignals(deal, company, duplicateGroupByCompanyId),
  ];

  if (signals.length === 0) {
    return null;
  }

  const primarySignal = [...signals].sort(compareSignals)[0];

  return {
    deal,
    company,
    owner,
    signals,
    primary_signal: primarySignal,
  };
}

function groupFindingsByDeal(findings: Finding[]) {
  const map = new Map<string, Finding[]>();

  findings.forEach((finding) => {
    if (!finding.deal_id) {
      return;
    }

    const current = map.get(finding.deal_id) ?? [];
    current.push(finding);
    map.set(finding.deal_id, current);
  });

  return map;
}

function toRiskSignal(finding: Finding): DealRiskSignal {
  return {
    finding_type: finding.finding_type,
    severity: finding.severity,
    label: FINDING_TYPE_LABELS[finding.finding_type],
    reason: finding.reason,
    recommended_action: finding.recommended_action,
  };
}

function createDuplicateCompanySignals(
  deal: Deal,
  company: Company,
  duplicateGroupByCompanyId: Map<string, Company[]>,
) {
  const group = duplicateGroupByCompanyId.get(deal.company_id);

  if (!group) {
    return [];
  }

  const companionNames = group
    .filter((candidate) => candidate.id !== company.id)
    .map((candidate) => candidate.name)
    .slice(0, 2);

  return [
    {
      finding_type: "duplicate_company" as const,
      severity: "medium" as const,
      label: FINDING_TYPE_LABELS.duplicate_company,
      reason: `${company.name} appears alongside ${companionNames.join(" and ")}, which can split account history and owner context across duplicate records.`,
      recommended_action: "Review and merge duplicate company records",
    },
  ];
}

function compareRiskyDeals(
  left: RiskyDealAggregate,
  right: RiskyDealAggregate,
) {
  const severityDelta =
    SEVERITY_WEIGHT[right.primary_signal.severity] -
    SEVERITY_WEIGHT[left.primary_signal.severity];

  if (severityDelta !== 0) {
    return severityDelta;
  }

  const leftCriticalSignals = left.signals.filter(
    (signal) => signal.severity === "critical",
  ).length;
  const rightCriticalSignals = right.signals.filter(
    (signal) => signal.severity === "critical",
  ).length;

  if (rightCriticalSignals !== leftCriticalSignals) {
    return rightCriticalSignals - leftCriticalSignals;
  }

  if (right.signals.length !== left.signals.length) {
    return right.signals.length - left.signals.length;
  }

  if (right.deal.amount !== left.deal.amount) {
    return right.deal.amount - left.deal.amount;
  }

  return left.deal.close_date.localeCompare(right.deal.close_date);
}

function compareSignals(left: DealRiskSignal, right: DealRiskSignal) {
  const severityDelta =
    SEVERITY_WEIGHT[right.severity] - SEVERITY_WEIGHT[left.severity];

  if (severityDelta !== 0) {
    return severityDelta;
  }

  return left.label.localeCompare(right.label);
}

function calculateHygieneScore(
  openDeals: number,
  findings: Finding[],
  duplicateExposureCount: number,
) {
  if (openDeals === 0) {
    return 100;
  }

  const criticalCount = findings.filter((finding) => finding.severity === "critical").length;
  const highCount = findings.filter((finding) => finding.severity === "high").length;
  const mediumCount =
    findings.filter((finding) => finding.severity === "medium").length +
    duplicateExposureCount;
  const lowCount = findings.filter((finding) => finding.severity === "low").length;
  const penalty =
    criticalCount * 6 + highCount * 3 + mediumCount * 2 + lowCount;

  return clamp(Math.round(100 - (penalty / openDeals) * 10), 38, 96);
}

function resolveTypeTone(findingType: FindingType): DashboardTone {
  if (findingType === "high_value_neglected" || findingType === "close_date_risk") {
    return "critical";
  }

  if (
    findingType === "no_next_step" ||
    findingType === "stale_deal" ||
    findingType === "overdue_close_date"
  ) {
    return "warning";
  }

  if (findingType === "duplicate_company") {
    return "neutral";
  }

  return "brand";
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
