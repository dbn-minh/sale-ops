import { DEMO_REFERENCE_DATE, toIsoDateTime } from "@/lib/data/date-utils";
import type { DemoData, Task } from "@/lib/data/types";
import type {
  CRMConnector,
  CRMDealNote,
  CRMDealNoteInput,
  CRMTaskCreateInput,
} from "@/lib/crm/crm-connector";

type DemoDataSource = DemoData | (() => DemoData);

export class FakeCRMConnector implements CRMConnector {
  providerId = "simulation" as const;
  providerName = "Simulation Mode";
  implementationName = "FakeCRMConnector";
  connectionMode = "simulation" as const;
  summary =
    "Uses deterministic fake CRM data and simulated write-back so the product demo stays safe and replayable.";

  constructor(private readonly dataSource: DemoDataSource) {}

  async fetchUsers() {
    return [...this.getData().users];
  }

  async fetchContacts() {
    return [...this.getData().contacts];
  }

  async fetchCompanies() {
    return [...this.getData().companies];
  }

  async fetchDeals() {
    return [...this.getData().deals];
  }

  async fetchActivities() {
    return [...this.getData().activities];
  }

  async fetchTasks() {
    return [...this.getData().tasks];
  }

  async createTask(input: CRMTaskCreateInput): Promise<Task> {
    // Demo mode intentionally avoids real CRM credentials and does not persist
    // write-back. This method returns a simulated task shape only so the
    // integration contract can be exercised safely during product development.
    return {
      id: `simulation-task-${input.dealId}-${sanitizeId(input.title)}`,
      deal_id: input.dealId,
      owner_id: input.ownerId,
      title: input.title,
      due_date: input.dueDate,
      status: "open",
      source: "bot",
      created_at: toIsoDateTime(DEMO_REFERENCE_DATE),
    };
  }

  async addNoteToDeal(input: CRMDealNoteInput): Promise<CRMDealNote> {
    // Demo mode does not write notes back to a live CRM. Returning a simulated
    // note lets the future connector interface stay concrete without changing
    // the current UX or requiring credentials.
    return {
      id: `simulation-note-${input.dealId}-${Math.abs(hashString(input.body))}`,
      deal_id: input.dealId,
      owner_id: input.ownerId,
      body: input.body,
      created_at: toIsoDateTime(DEMO_REFERENCE_DATE),
      source: "simulation",
    };
  }

  private getData() {
    return typeof this.dataSource === "function" ? this.dataSource() : this.dataSource;
  }
}

function sanitizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return hash;
}
