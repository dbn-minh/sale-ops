import type {
  Activity,
  Company,
  Contact,
  Deal,
  Task,
  User,
} from "@/lib/data/types";

export type CRMProviderId = "simulation" | "hubspot" | "pipedrive";
export type CRMConnectionMode = "simulation" | "placeholder" | "live";

export type CRMTaskCreateInput = {
  dealId: string;
  ownerId: string;
  title: string;
  dueDate: string;
};

export type CRMDealNoteInput = {
  dealId: string;
  ownerId: string | null;
  body: string;
};

export type CRMDealNote = {
  id: string;
  deal_id: string;
  owner_id: string | null;
  body: string;
  created_at: string;
  source: "simulation" | "crm";
};

export interface CRMConnector {
  providerId: CRMProviderId;
  providerName: string;
  implementationName: string;
  connectionMode: CRMConnectionMode;
  summary: string;

  fetchUsers(): Promise<User[]>;
  fetchContacts(): Promise<Contact[]>;
  fetchCompanies(): Promise<Company[]>;
  fetchDeals(): Promise<Deal[]>;
  fetchActivities(): Promise<Activity[]>;
  fetchTasks(): Promise<Task[]>;
  createTask(input: CRMTaskCreateInput): Promise<Task>;
  addNoteToDeal(input: CRMDealNoteInput): Promise<CRMDealNote>;
}

export type CRMProviderSummary = {
  providerId: CRMProviderId;
  providerName: string;
  implementationName: string;
  connectionMode: CRMConnectionMode;
  summary: string;
};
