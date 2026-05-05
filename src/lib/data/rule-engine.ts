import { DEMO_REFERENCE_DATE, toIsoDate, toIsoDateTime } from "@/lib/data/date-utils";
import {
  FINDING_SEVERITIES,
  FINDING_TYPES,
  OPEN_DEAL_STAGES,
} from "@/lib/data/types";
import type {
  Activity,
  Company,
  Contact,
  Deal,
  DemoData,
  Finding,
  FindingSeverity,
  FindingType,
  Task,
} from "@/lib/data/types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LATE_STAGES = new Set<typeof OPEN_DEAL_STAGES[number]>([
  "Proposal",
  "Negotiation",
  "Contract Review",
]);

export const FINDING_TYPE_LABELS: Record<FindingType, string> = {
  no_next_step: "No Next Step",
  stale_deal: "Stale Deal",
  overdue_close_date: "Overdue Close Date",
  close_date_risk: "Close Date Risk",
  missing_primary_contact: "Missing Primary Contact",
  incomplete_contact: "Incomplete Contact",
  duplicate_company: "Duplicate Company",
  high_value_neglected: "High Value Deal Neglected",
};

export type RuleEngineContext = {
  data: DemoData;
  referenceDate: Date;
  referenceDateIso: string;
  activitiesByDeal: Map<string, Activity[]>;
  tasksByDeal: Map<string, Task[]>;
  dealsByCompany: Map<string, Deal[]>;
  companiesById: Map<string, Company>;
  contactsById: Map<string, Contact>;
};

export type DuplicateCompanyGroup = {
  companies: Company[];
  sharedDomain: string | null;
  canonicalName: string | null;
};

export type FindingsOverview = {
  total_findings: number;
  by_severity: Array<{
    severity: FindingSeverity;
    count: number;
  }>;
  by_type: Array<{
    finding_type: FindingType;
    count: number;
  }>;
  pipeline_value_at_risk: number;
  sample_findings: Finding[];
};

export function buildRuleEngineContext(
  data: DemoData,
  referenceDate = DEMO_REFERENCE_DATE,
): RuleEngineContext {
  const activitiesByDeal = new Map<string, Activity[]>();
  const tasksByDeal = new Map<string, Task[]>();
  const dealsByCompany = new Map<string, Deal[]>();

  data.activities.forEach((activity) => {
    const current = activitiesByDeal.get(activity.deal_id) ?? [];
    current.push(activity);
    activitiesByDeal.set(activity.deal_id, current);
  });

  data.tasks.forEach((task) => {
    const current = tasksByDeal.get(task.deal_id) ?? [];
    current.push(task);
    tasksByDeal.set(task.deal_id, current);
  });

  data.deals.forEach((deal) => {
    const current = dealsByCompany.get(deal.company_id) ?? [];
    current.push(deal);
    dealsByCompany.set(deal.company_id, current);
  });

  activitiesByDeal.forEach((items, dealId) => {
    activitiesByDeal.set(
      dealId,
      [...items].sort(
        (left, right) =>
          new Date(right.occurred_at).getTime() -
          new Date(left.occurred_at).getTime(),
      ),
    );
  });

  return {
    data,
    referenceDate,
    referenceDateIso: toIsoDate(referenceDate),
    activitiesByDeal,
    tasksByDeal,
    dealsByCompany,
    companiesById: new Map(data.companies.map((company) => [company.id, company])),
    contactsById: new Map(data.contacts.map((contact) => [contact.id, contact])),
  };
}

export function getLastActivityForDeal(
  context: RuleEngineContext,
  dealId: string,
) {
  return context.activitiesByDeal.get(dealId)?.[0] ?? null;
}

export function getOpenFutureTasksForDeal(
  context: RuleEngineContext,
  dealId: string,
) {
  return (context.tasksByDeal.get(dealId) ?? []).filter(
    (task) =>
      task.status === "open" &&
      compareIsoDate(task.due_date, context.referenceDateIso) > 0,
  );
}

export function getCompanyForDeal(
  context: RuleEngineContext,
  deal: Deal,
) {
  return context.companiesById.get(deal.company_id) ?? null;
}

export function getPrimaryContactForDeal(
  context: RuleEngineContext,
  deal: Deal,
) {
  if (!deal.primary_contact_id) {
    return null;
  }

  return context.contactsById.get(deal.primary_contact_id) ?? null;
}

export function calculatePipelineValueAtRisk(deals: Deal[]) {
  return Array.from(
    new Map(deals.map((deal) => [deal.id, deal])).values(),
  )
    .filter((deal) => deal.status === "open")
    .reduce((total, deal) => total + deal.amount, 0);
}

export function findDuplicateCompanyGroups(companies: Company[]) {
  const parent = companies.map((_, index) => index);

  const find = (index: number): number => {
    if (parent[index] !== index) {
      parent[index] = find(parent[index]);
    }

    return parent[index];
  };

  const union = (left: number, right: number) => {
    const leftRoot = find(left);
    const rightRoot = find(right);

    if (leftRoot !== rightRoot) {
      parent[rightRoot] = leftRoot;
    }
  };

  const linkGroup = (indices: number[]) => {
    if (indices.length < 2) {
      return;
    }

    const [first, ...rest] = indices;
    rest.forEach((index) => union(first, index));
  };

  const byDomain = new Map<string, number[]>();
  const byCanonicalName = new Map<string, number[]>();

  companies.forEach((company, index) => {
    const domain = company.domain.trim().toLowerCase();
    const canonicalName = canonicalizeCompanyName(company.name);

    if (domain) {
      const current = byDomain.get(domain) ?? [];
      current.push(index);
      byDomain.set(domain, current);
    }

    if (canonicalName) {
      const current = byCanonicalName.get(canonicalName) ?? [];
      current.push(index);
      byCanonicalName.set(canonicalName, current);
    }
  });

  Array.from(byDomain.values()).forEach(linkGroup);
  Array.from(byCanonicalName.values()).forEach(linkGroup);

  const groups = new Map<number, Company[]>();

  companies.forEach((company, index) => {
    const root = find(index);
    const current = groups.get(root) ?? [];
    current.push(company);
    groups.set(root, current);
  });

  return Array.from(groups.values())
    .filter((group) => group.length > 1)
    .map((group) => {
      const sortedGroup = [...group].sort((left, right) =>
        left.name.localeCompare(right.name),
      );

      return {
        companies: sortedGroup,
        sharedDomain: getSharedDomain(sortedGroup),
        canonicalName: getSharedCanonicalName(sortedGroup),
      };
    })
    .sort((left, right) =>
      left.companies[0].name.localeCompare(right.companies[0].name),
    );
}

export function generateHygieneFindings(
  data: DemoData,
  referenceDate = DEMO_REFERENCE_DATE,
) {
  const context = buildRuleEngineContext(data, referenceDate);
  const findings: Finding[] = [];
  const findingKeys = new Set<string>();

  const pushFinding = (
    finding_type: FindingType,
    input: Omit<Finding, "id" | "finding_type" | "status" | "created_at">,
  ) => {
    const dedupeKey = [
      finding_type,
      input.deal_id ?? "",
      input.company_id ?? "",
      input.contact_id ?? "",
      input.owner_id ?? "",
    ].join(":");

    if (findingKeys.has(dedupeKey)) {
      return;
    }

    findingKeys.add(dedupeKey);
    findings.push({
      id: createFindingId(findings.length + 1),
      finding_type,
      status: "open",
      created_at: toIsoDateTime(referenceDate),
      ...input,
    });
  };

  data.deals.forEach((deal) => {
    if (deal.status !== "open") {
      return;
    }

    const company = getCompanyForDeal(context, deal);
    const primaryContact = getPrimaryContactForDeal(context, deal);
    const lastActivity = getLastActivityForDeal(context, deal.id);
    const futureTasks = getOpenFutureTasksForDeal(context, deal.id);
    const lastActivityAgeInDays = getActivityAgeInDays(
      lastActivity?.occurred_at ?? null,
      referenceDate,
    );
    const daysUntilClose = differenceFromReferenceInDays(
      deal.close_date,
      referenceDate,
    );
    const noRecentActivityInTenDays =
      lastActivityAgeInDays === null || lastActivityAgeInDays > 10;
    const staleActivity =
      lastActivityAgeInDays === null || lastActivityAgeInDays > 14;

    if (futureTasks.length === 0) {
      pushFinding("no_next_step", {
        severity: deal.amount > 20000 ? "high" : "medium",
        deal_id: deal.id,
        company_id: deal.company_id,
        contact_id: deal.primary_contact_id,
        owner_id: deal.owner_id,
        title: `${deal.name} has no documented next step`,
        reason: `This open deal has no open task due after ${context.referenceDateIso}, so the follow-up plan is unclear.`,
        recommended_action:
          "Create a follow-up task within 2 business days",
        pipeline_value_at_risk: calculatePipelineValueAtRisk([deal]),
      });
    }

    if (staleActivity) {
      pushFinding("stale_deal", {
        severity: isLateOpenStage(deal.stage) ? "high" : "medium",
        deal_id: deal.id,
        company_id: deal.company_id,
        contact_id: deal.primary_contact_id,
        owner_id: deal.owner_id,
        title: `${deal.name} has gone stale`,
        reason: lastActivity
          ? `The last recorded activity was ${lastActivityAgeInDays} days ago while the deal remains open in ${deal.stage}.`
          : `No activity is recorded for this open deal, leaving the opportunity without a current engagement signal.`,
        recommended_action:
          "Contact the decision maker or update the deal stage",
        pipeline_value_at_risk: calculatePipelineValueAtRisk([deal]),
      });
    }

    if (daysUntilClose < 0) {
      pushFinding("overdue_close_date", {
        severity: "high",
        deal_id: deal.id,
        company_id: deal.company_id,
        contact_id: deal.primary_contact_id,
        owner_id: deal.owner_id,
        title: `${deal.name} has an overdue close date`,
        reason: `The deal is still open, but its close date of ${deal.close_date} is behind the reference date of ${context.referenceDateIso}.`,
        recommended_action: "Update close date or review forecast",
        pipeline_value_at_risk: calculatePipelineValueAtRisk([deal]),
      });
    }

    if (daysUntilClose >= 0 && daysUntilClose <= 7 && noRecentActivityInTenDays) {
      pushFinding("close_date_risk", {
        severity: deal.amount > 50000 ? "critical" : "high",
        deal_id: deal.id,
        company_id: deal.company_id,
        contact_id: deal.primary_contact_id,
        owner_id: deal.owner_id,
        title: `${deal.name} is approaching close without recent activity`,
        reason: `The deal is due to close within ${daysUntilClose} days, but there has been no activity in the last 10 days.`,
        recommended_action: "Schedule immediate follow-up",
        pipeline_value_at_risk: calculatePipelineValueAtRisk([deal]),
      });
    }

    if (!deal.primary_contact_id) {
      pushFinding("missing_primary_contact", {
        severity: "medium",
        deal_id: deal.id,
        company_id: deal.company_id,
        contact_id: null,
        owner_id: deal.owner_id,
        title: `${deal.name} is missing a primary contact`,
        reason: `This open deal has no primary decision maker associated with the opportunity record.`,
        recommended_action: "Associate a primary decision maker",
        pipeline_value_at_risk: calculatePipelineValueAtRisk([deal]),
      });
    }

    if (primaryContact && (!primaryContact.email || !primaryContact.phone)) {
      const missingFields = [
        primaryContact.email ? null : "email",
        primaryContact.phone ? null : "phone",
      ].filter(Boolean);

      pushFinding("incomplete_contact", {
        severity: deal.amount > 20000 ? "medium" : "low",
        deal_id: deal.id,
        company_id: company?.id ?? deal.company_id,
        contact_id: primaryContact.id,
        owner_id: deal.owner_id,
        title: `${primaryContact.first_name} ${primaryContact.last_name} is missing key contact details`,
        reason: `The primary contact for ${deal.name} is missing ${missingFields.join(" and ")}, which limits reliable follow-up coverage.`,
        recommended_action: "Complete contact information",
        pipeline_value_at_risk: calculatePipelineValueAtRisk([deal]),
      });
    }

    if (deal.amount > 50000 && noRecentActivityInTenDays && futureTasks.length === 0) {
      pushFinding("high_value_neglected", {
        severity: "critical",
        deal_id: deal.id,
        company_id: deal.company_id,
        contact_id: deal.primary_contact_id,
        owner_id: deal.owner_id,
        title: `${deal.name} is a neglected high-value opportunity`,
        reason: `The deal amount exceeds $50,000, there has been no activity in the last 10 days, and no future task is scheduled.`,
        recommended_action:
          "Escalate to sales manager and create follow-up task",
        pipeline_value_at_risk: calculatePipelineValueAtRisk([deal]),
      });
    }
  });

  findDuplicateCompanyGroups(data.companies).forEach((group) => {
    const companyIds = new Set(group.companies.map((company) => company.id));
    const relatedDeals = data.deals.filter(
      (deal) => deal.status === "open" && companyIds.has(deal.company_id),
    );
    const ownerIds = new Set(group.companies.map((company) => company.owner_id));
    const primaryCompany = group.companies[0];
    const companyNames = group.companies.map((company) => company.name);
    const duplicateReason = group.sharedDomain
      ? `These company records share the domain ${group.sharedDomain} and should be reviewed for a possible merge.`
      : `These company records use nearly identical names and should be reviewed for a possible merge.`;

    pushFinding("duplicate_company", {
      severity: "medium",
      deal_id: null,
      company_id: primaryCompany.id,
      contact_id: null,
      owner_id: ownerIds.size === 1 ? primaryCompany.owner_id : null,
      title:
        companyNames.length === 2
          ? `Potential duplicate companies: ${companyNames[0]} and ${companyNames[1]}`
          : `Potential duplicate company group: ${companyNames[0]} and ${companyNames.length - 1} more`,
      reason: duplicateReason,
      recommended_action: "Review and merge duplicate company records",
      pipeline_value_at_risk: calculatePipelineValueAtRisk(relatedDeals),
    });
  });

  return findings;
}

export function summarizeGeneratedFindings(
  data: DemoData,
): FindingsOverview {
  const bySeverity = [...FINDING_SEVERITIES]
    .reverse()
    .map((severity) => ({
      severity,
      count: data.findings.filter((finding) => finding.severity === severity).length,
    }));
  const byType = FINDING_TYPES.map((finding_type) => ({
    finding_type,
    count: data.findings.filter((finding) => finding.finding_type === finding_type).length,
  }));
  const duplicateCompanyIds = new Set(
    findDuplicateCompanyGroups(data.companies).flatMap((group) =>
      group.companies.map((company) => company.id),
    ),
  );
  const atRiskDeals = data.deals.filter(
    (deal) =>
      deal.status === "open" &&
      (data.findings.some((finding) => finding.deal_id === deal.id) ||
        duplicateCompanyIds.has(deal.company_id)),
  );

  return {
    total_findings: data.findings.length,
    by_severity: bySeverity,
    by_type: byType,
    pipeline_value_at_risk: calculatePipelineValueAtRisk(atRiskDeals),
    sample_findings: [...data.findings]
      .sort(compareFindings)
      .slice(0, 5),
  };
}

function compareFindings(left: Finding, right: Finding) {
  const severityDelta =
    severityRank(right.severity) - severityRank(left.severity);

  if (severityDelta !== 0) {
    return severityDelta;
  }

  if (right.pipeline_value_at_risk !== left.pipeline_value_at_risk) {
    return right.pipeline_value_at_risk - left.pipeline_value_at_risk;
  }

  return left.title.localeCompare(right.title);
}

function severityRank(severity: FindingSeverity) {
  return {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }[severity];
}

function isLateOpenStage(stage: Deal["stage"]) {
  return LATE_STAGES.has(stage as (typeof OPEN_DEAL_STAGES)[number]);
}

function createFindingId(value: number) {
  return `finding-${String(value).padStart(3, "0")}`;
}

function canonicalizeCompanyName(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, "");

  return normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
}

function getSharedDomain(companies: Company[]) {
  const counts = new Map<string, number>();

  companies.forEach((company) => {
    const domain = company.domain.trim().toLowerCase();
    counts.set(domain, (counts.get(domain) ?? 0) + 1);
  });

  return Array.from(counts.entries()).find(([, count]) => count > 1)?.[0] ?? null;
}

function getSharedCanonicalName(companies: Company[]) {
  const canonicalNames = companies.map((company) =>
    canonicalizeCompanyName(company.name),
  );

  return canonicalNames.every((name) => name === canonicalNames[0])
    ? canonicalNames[0]
    : null;
}

function compareIsoDate(left: string, right: string) {
  if (left === right) {
    return 0;
  }

  return left > right ? 1 : -1;
}

function getActivityAgeInDays(value: string | null, referenceDate: Date) {
  if (!value) {
    return null;
  }

  const deltaInMs = referenceDate.getTime() - new Date(value).getTime();

  return Math.floor(deltaInMs / DAY_IN_MS);
}

function differenceFromReferenceInDays(value: string, referenceDate: Date) {
  const targetDate = parseIsoDateToUtcDay(value);
  const referenceDay = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  );

  return Math.floor((targetDate - referenceDay) / DAY_IN_MS);
}

function parseIsoDateToUtcDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
}
