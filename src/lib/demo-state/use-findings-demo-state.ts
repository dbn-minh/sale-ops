import { useEffect, useMemo, useState } from "react";
import { addBusinessDays, DEMO_REFERENCE_DATE, toIsoDate } from "@/lib/data/date-utils";
import type { FindingsWorkspaceRow } from "@/lib/data/findings";
import type { FindingStatus } from "@/lib/data/types";

export type SimulatedBotTask = {
  id: string;
  finding_id: string | null;
  deal_id: string;
  owner_id: string | null;
  title: string;
  due_date: string;
  status: "open";
  source: "bot";
  created_at: string;
};

type PersistedCrmSimulationState = {
  finding_statuses: Record<string, FindingStatus>;
  bot_tasks: SimulatedBotTask[];
};

const STORAGE_KEY = "sales-ops-hygiene-bot:findings-demo-state:v1";

const DEFAULT_STATE: PersistedCrmSimulationState = {
  finding_statuses: {},
  bot_tasks: [],
};

type CreateBotTaskInput = {
  dealId: string;
  ownerId: string | null;
  title: string;
  findingId?: string | null;
};

export function useCrmSimulationDemoState() {
  const [persistedState, setPersistedState] =
    useState<PersistedCrmSimulationState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPersistedState(readPersistedState());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  }, [isHydrated, persistedState]);

  const actions = useMemo(
    () => ({
    setFindingStatus(findingId: string, status: FindingStatus) {
      setPersistedState((current) => ({
        ...current,
        finding_statuses: {
          ...current.finding_statuses,
          [findingId]: status,
        },
      }));
    },
    createBotTask(input: CreateBotTaskInput) {
      setPersistedState((current) => {
        const existingTask = current.bot_tasks.find(
          (task) => input.findingId && task.finding_id === input.findingId,
        );

        if (existingTask) {
          return {
            ...current,
            finding_statuses: input.findingId
              ? {
                  ...current.finding_statuses,
                  [input.findingId]: "task_created",
                }
              : current.finding_statuses,
          };
        }

        const newTask: SimulatedBotTask = {
          id: `bot-task-${input.dealId}-${current.bot_tasks.length + 1}`,
          finding_id: input.findingId ?? null,
          deal_id: input.dealId,
          owner_id: input.ownerId,
          title: input.title,
          due_date: toIsoDate(addBusinessDays(DEMO_REFERENCE_DATE, 2)),
          status: "open",
          source: "bot",
          created_at: new Date().toISOString(),
        };

        return {
          finding_statuses: input.findingId
            ? {
                ...current.finding_statuses,
                [input.findingId]: "task_created",
              }
            : current.finding_statuses,
          bot_tasks: [...current.bot_tasks, newTask],
        };
      });

      return true;
    },
    resetSimulation() {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }

      setPersistedState(DEFAULT_STATE);
      return true;
    },
  }),
    [],
  );

  return {
    isHydrated,
    findingStatuses: persistedState.finding_statuses,
    botTasks: persistedState.bot_tasks,
    ...actions,
  };
}

export function useFindingsDemoState(initialRows: FindingsWorkspaceRow[]) {
  const demoState = useCrmSimulationDemoState();

  const effectiveRows = useMemo(
    () =>
      initialRows.map((row) => ({
        ...row,
        status: demoState.findingStatuses[row.id] ?? row.initial_status,
      })),
    [demoState.findingStatuses, initialRows],
  );

  return {
    isHydrated: demoState.isHydrated,
    effectiveRows,
    botTasks: demoState.botTasks,
    setFindingStatus: demoState.setFindingStatus,
    createTask(row: FindingsWorkspaceRow) {
      if (!row.deal_id) {
        return false;
      }

      return demoState.createBotTask({
        dealId: row.deal_id,
        ownerId: row.owner_id,
        title: `Follow up on ${row.deal_name}`,
        findingId: row.id,
      });
    },
  };
}

function readPersistedState(): PersistedCrmSimulationState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return DEFAULT_STATE;
  }

  try {
    const parsed = JSON.parse(storedValue) as PersistedCrmSimulationState;

    return {
      finding_statuses: parsed.finding_statuses ?? {},
      bot_tasks: parsed.bot_tasks ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}
