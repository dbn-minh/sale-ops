import type {
  CRMConnector,
  CRMDealNote,
  CRMDealNoteInput,
  CRMTaskCreateInput,
} from "@/lib/crm/crm-connector";
import type {
  Activity,
  Company,
  Contact,
  Deal,
  Task,
  User,
} from "@/lib/data/types";

export class HubSpotConnector implements CRMConnector {
  providerId = "hubspot" as const;
  providerName = "HubSpot";
  implementationName = "HubSpotConnector";
  connectionMode = "placeholder" as const;
  summary =
    "Placeholder for a future HubSpot integration that should begin with read-only sync before controlled write-back.";

  async fetchUsers(): Promise<User[]> {
    // Future OAuth would be added before any HubSpot API calls are made.
    // The first pilot should use read-only owner sync only.
    throw new Error("HubSpotConnector.fetchUsers is a placeholder.");
  }

  async fetchContacts(): Promise<Contact[]> {
    // Read-only contact sync would be added here after OAuth is established.
    throw new Error("HubSpotConnector.fetchContacts is a placeholder.");
  }

  async fetchCompanies(): Promise<Company[]> {
    // Read-only company sync would be added here after OAuth is established.
    throw new Error("HubSpotConnector.fetchCompanies is a placeholder.");
  }

  async fetchDeals(): Promise<Deal[]> {
    // Read-only deal sync would be added here after OAuth is established.
    throw new Error("HubSpotConnector.fetchDeals is a placeholder.");
  }

  async fetchActivities(): Promise<Activity[]> {
    // Read-only activity sync would be added here after OAuth is established.
    throw new Error("HubSpotConnector.fetchActivities is a placeholder.");
  }

  async fetchTasks(): Promise<Task[]> {
    // Read-only task sync would be added here after OAuth is established.
    throw new Error("HubSpotConnector.fetchTasks is a placeholder.");
  }

  async createTask(input: CRMTaskCreateInput): Promise<Task> {
    void input;
    // Controlled write-back should start with create-task only after the
    // read-only pilot is trusted and audited.
    throw new Error("HubSpotConnector.createTask is a placeholder.");
  }

  async addNoteToDeal(input: CRMDealNoteInput): Promise<CRMDealNote> {
    void input;
    // Controlled write-back for add-note should come after create-task and stay
    // narrow during the first pilot.
    throw new Error("HubSpotConnector.addNoteToDeal is a placeholder.");
  }
}
