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

export class PipedriveConnector implements CRMConnector {
  providerId = "pipedrive" as const;
  providerName = "Pipedrive";
  implementationName = "PipedriveConnector";
  connectionMode = "placeholder" as const;
  summary =
    "Placeholder for a future Pipedrive integration with the same read-only-first and limited write-back rollout.";

  async fetchUsers(): Promise<User[]> {
    // OAuth or token exchange would be introduced here in a future pilot.
    // Start with read-only owner sync, not write-back.
    throw new Error("PipedriveConnector.fetchUsers is a placeholder.");
  }

  async fetchContacts(): Promise<Contact[]> {
    // Read-only contact sync would be added here after auth is introduced.
    throw new Error("PipedriveConnector.fetchContacts is a placeholder.");
  }

  async fetchCompanies(): Promise<Company[]> {
    // Read-only organization sync would be added here after auth is introduced.
    throw new Error("PipedriveConnector.fetchCompanies is a placeholder.");
  }

  async fetchDeals(): Promise<Deal[]> {
    // Read-only deal sync would be added here after auth is introduced.
    throw new Error("PipedriveConnector.fetchDeals is a placeholder.");
  }

  async fetchActivities(): Promise<Activity[]> {
    // Read-only activity sync would be added here after auth is introduced.
    throw new Error("PipedriveConnector.fetchActivities is a placeholder.");
  }

  async fetchTasks(): Promise<Task[]> {
    // Read-only task sync would be added here after auth is introduced.
    throw new Error("PipedriveConnector.fetchTasks is a placeholder.");
  }

  async createTask(input: CRMTaskCreateInput): Promise<Task> {
    void input;
    // Write-back should start with create-task only and remain tightly scoped.
    throw new Error("PipedriveConnector.createTask is a placeholder.");
  }

  async addNoteToDeal(input: CRMDealNoteInput): Promise<CRMDealNote> {
    void input;
    // Add-note should be the second controlled write-back action, not part of
    // the initial read-only pilot.
    throw new Error("PipedriveConnector.addNoteToDeal is a placeholder.");
  }
}
