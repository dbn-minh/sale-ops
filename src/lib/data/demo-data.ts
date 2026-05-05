import { buildDashboardModel } from "@/lib/data/dashboard";
import { buildDealsWorkspaceModel } from "@/lib/data/deals";
import { buildFindingsWorkspaceModel } from "@/lib/data/findings";
import { buildWeeklyDigestModel } from "@/lib/data/weekly-digest";
import {
  FINDING_TYPE_LABELS,
  summarizeGeneratedFindings,
} from "@/lib/data/rule-engine";
import { createDemoCrmData } from "@/lib/data/seed";

export const crmSimulationSeed = 20260504;

const crmSimulation = createDemoCrmData(crmSimulationSeed);
const companyById = new Map(crmSimulation.data.companies.map((company) => [company.id, company]));
const contactById = new Map(crmSimulation.data.contacts.map((contact) => [contact.id, contact]));
const dealById = new Map(crmSimulation.data.deals.map((deal) => [deal.id, deal]));
const userById = new Map(crmSimulation.data.users.map((user) => [user.id, user]));
const findingsOverview = summarizeGeneratedFindings(crmSimulation.data);
const dashboard = buildDashboardModel(crmSimulation.data);
const dealsWorkspace = buildDealsWorkspaceModel(crmSimulation.data);
const findingsWorkspace = buildFindingsWorkspaceModel(
  crmSimulation.data,
  crmSimulation.summary.reference_date,
);

export const crmSimulationData = crmSimulation.data;
export const crmSimulationSummary = crmSimulation.summary;
export const crmSimulationDashboard = dashboard;
export const crmSimulationDealsWorkspace = dealsWorkspace;
export const crmSimulationFindingsWorkspace = findingsWorkspace;
export const crmSimulationWeeklyDigest = buildWeeklyDigestModel(
  crmSimulation.data,
  {
    referenceDate: crmSimulation.summary.reference_date,
    dashboard,
    dealsWorkspace,
  },
);
export const crmSimulationFindingsOverview = {
  ...findingsOverview,
  by_severity: findingsOverview.by_severity,
  by_type: findingsOverview.by_type.map((bucket) => ({
    ...bucket,
    label: FINDING_TYPE_LABELS[bucket.finding_type],
  })),
  sample_findings: findingsOverview.sample_findings.map((finding) => ({
    ...finding,
    type_label: FINDING_TYPE_LABELS[finding.finding_type],
    owner_name: finding.owner_id
      ? userById.get(finding.owner_id)?.name ?? finding.owner_id
      : "Shared ownership",
    deal_name: finding.deal_id
      ? dealById.get(finding.deal_id)?.name ?? "Deal record"
      : "Company data hygiene",
    company_name: finding.company_id
      ? companyById.get(finding.company_id)?.name ?? finding.company_id
      : "Portfolio-wide",
    contact_name: finding.contact_id
      ? `${contactById.get(finding.contact_id)?.first_name ?? ""} ${contactById.get(finding.contact_id)?.last_name ?? ""}`.trim()
      : "",
  })),
};

export const crmSimulationDebugPreview = {
  duplicate_companies: crmSimulation.summary.sample_ids.duplicate_company_ids
    .map((id) => companyById.get(id))
    .filter((company) => company !== undefined),
  incomplete_contacts: crmSimulation.summary.sample_ids.incomplete_contact_ids
    .map((id) => contactById.get(id))
    .filter((contact) => contact !== undefined)
    .map((contact) => ({
      ...contact,
      company_name: companyById.get(contact.company_id)?.name ?? contact.company_id,
    })),
  seeded_deals: [
    ...crmSimulation.summary.sample_ids.no_upcoming_task_deal_ids.map((id) => ({
      deal: dealById.get(id),
      note: "No upcoming task seeded",
    })),
    ...crmSimulation.summary.sample_ids.stale_deal_ids.map((id) => ({
      deal: dealById.get(id),
      note: "Recent activity intentionally stale",
    })),
    ...crmSimulation.summary.sample_ids.overdue_deal_ids.map((id) => ({
      deal: dealById.get(id),
      note: "Close date intentionally overdue",
    })),
    ...crmSimulation.summary.sample_ids.high_value_at_risk_deal_ids.map((id) => ({
      deal: dealById.get(id),
      note: "High-value risk scenario seeded",
    })),
  ]
    .filter((entry): entry is { deal: NonNullable<typeof entry.deal>; note: string } => Boolean(entry.deal))
    .reduce<
      Array<{
        deal: (typeof crmSimulation.data.deals)[number];
        note: string;
        owner_name: string;
      }>
    >((acc, entry) => {
      if (!acc.some((item) => item.deal.id === entry.deal.id)) {
        acc.push({
          ...entry,
          owner_name: userById.get(entry.deal.owner_id)?.name ?? entry.deal.owner_id,
        });
      }

      return acc;
    }, [])
    .slice(0, 6),
  owner_snapshot: crmSimulation.summary.owner_insights.map((insight) => ({
    ...insight,
    owner_team: userById.get(insight.user_id)?.team ?? "",
    owner_email: userById.get(insight.user_id)?.email ?? "",
  })),
};
