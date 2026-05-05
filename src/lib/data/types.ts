export const DEAL_PIPELINES = ["New Business", "Expansion"] as const;

export const OPEN_DEAL_STAGES = [
  "Prospecting",
  "Discovery",
  "Demo Scheduled",
  "Proposal",
  "Negotiation",
  "Contract Review",
] as const;

export const CLOSED_DEAL_STAGES = ["Closed Won", "Closed Lost"] as const;

export const ACTIVITY_TYPES = ["email", "call", "meeting", "note"] as const;

export const TASK_STATUSES = ["open", "completed"] as const;

export const TASK_SOURCES = ["manual", "bot"] as const;

export const FINDING_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const FINDING_STATUSES = [
  "open",
  "reviewed",
  "ignored",
  "task_created",
] as const;

export const FINDING_TYPES = [
  "no_next_step",
  "stale_deal",
  "overdue_close_date",
  "close_date_risk",
  "missing_primary_contact",
  "incomplete_contact",
  "duplicate_company",
  "high_value_neglected",
] as const;

export type DealPipeline = (typeof DEAL_PIPELINES)[number];
export type OpenDealStage = (typeof OPEN_DEAL_STAGES)[number];
export type ClosedDealStage = (typeof CLOSED_DEAL_STAGES)[number];
export type DealStage = OpenDealStage | ClosedDealStage;
export type DealStatus = "open" | "won" | "lost";
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskSource = (typeof TASK_SOURCES)[number];
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];
export type FindingStatus = (typeof FINDING_STATUSES)[number];
export type FindingType = (typeof FINDING_TYPES)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
};

export type Company = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employee_count: number;
  annual_revenue: number;
  owner_id: string;
  created_at: string;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string;
  company_id: string;
  owner_id: string;
  created_at: string;
};

export type Deal = {
  id: string;
  name: string;
  company_id: string;
  primary_contact_id: string | null;
  owner_id: string;
  pipeline: DealPipeline;
  stage: DealStage;
  amount: number;
  probability: number;
  close_date: string;
  status: DealStatus;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  deal_id: string;
  contact_id: string;
  owner_id: string;
  type: ActivityType;
  subject: string;
  body: string;
  occurred_at: string;
};

export type Task = {
  id: string;
  deal_id: string;
  owner_id: string;
  title: string;
  due_date: string;
  status: TaskStatus;
  source: TaskSource;
  created_at: string;
};

export type Finding = {
  id: string;
  finding_type: FindingType;
  severity: FindingSeverity;
  deal_id: string | null;
  company_id: string | null;
  contact_id: string | null;
  owner_id: string | null;
  title: string;
  reason: string;
  recommended_action: string;
  pipeline_value_at_risk: number;
  status: FindingStatus;
  created_at: string;
};

export type DemoData = {
  users: User[];
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  tasks: Task[];
  findings: Finding[];
};

export type DemoDataSummary = {
  reference_date: string;
  entity_counts: {
    users: number;
    companies: number;
    contacts: number;
    deals: number;
    activities: number;
    tasks: number;
    findings: number;
  };
  anomaly_counts: {
    duplicate_company_pairs: number;
    duplicate_company_records: number;
    incomplete_contacts: number;
    deals_without_upcoming_tasks: number;
    deals_without_recent_activity: number;
    overdue_close_dates: number;
    deals_missing_primary_contact: number;
    deals_with_incomplete_primary_contact: number;
    deals_stuck_in_late_stage: number;
    high_value_deals_at_risk: number;
  };
  owner_insights: Array<{
    user_id: string;
    owner_name: string;
    company_count: number;
    deal_count: number;
    open_deal_count: number;
    seeded_dirty_deal_count: number;
  }>;
  sample_ids: {
    duplicate_company_ids: string[];
    incomplete_contact_ids: string[];
    no_upcoming_task_deal_ids: string[];
    stale_deal_ids: string[];
    overdue_deal_ids: string[];
    high_value_at_risk_deal_ids: string[];
  };
};

