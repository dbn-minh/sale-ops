import {
  addDays,
  addHours,
  DEMO_REFERENCE_DATE,
  subDays,
  toIsoDate,
  toIsoDateTime,
} from "@/lib/data/date-utils";
import { generateHygieneFindings } from "@/lib/data/rule-engine";
import type {
  Activity,
  ActivityType,
  ClosedDealStage,
  Company,
  Contact,
  Deal,
  DealPipeline,
  DealStatus,
  DemoData,
  DemoDataSummary,
  OpenDealStage,
  Task,
  TaskStatus,
  User,
} from "@/lib/data/types";

const OWNER_COMPANY_COUNTS = [24, 18, 15, 13, 10] as const;
const OWNER_DEAL_COUNTS = [
  { open: 32, won: 6, lost: 4 },
  { open: 26, won: 6, lost: 4 },
  { open: 18, won: 6, lost: 4 },
  { open: 14, won: 6, lost: 4 },
  { open: 10, won: 6, lost: 4 },
] as const;

const COMPANY_PREFIXES = [
  "Northstar",
  "BluePeak",
  "Clearwater",
  "Summit",
  "Riverstone",
  "Copperleaf",
  "Evergreen",
  "BrightPath",
  "Signal",
  "Atlas",
] as const;

const COMPANY_SUFFIXES = [
  "Analytics",
  "Systems",
  "Cloud",
  "Labs",
  "Works",
  "Network",
  "Dynamics",
  "Software",
] as const;

const INDUSTRIES = [
  "B2B SaaS",
  "Fintech",
  "Healthcare IT",
  "Cybersecurity",
  "Manufacturing",
  "Logistics",
  "Professional Services",
  "EdTech",
] as const;

const FIRST_NAMES = [
  "Avery",
  "Jordan",
  "Mia",
  "Luca",
  "Camila",
  "Noah",
  "Priya",
  "Theo",
  "Sofia",
  "Marcus",
  "Linh",
  "Elena",
  "Daniel",
  "Riley",
  "Nina",
  "Owen",
  "Grace",
  "Isaac",
  "Hazel",
  "Jonah",
  "Leah",
  "Mason",
  "Aria",
  "Henry",
  "Zoe",
  "Ethan",
  "Ivy",
  "Carson",
  "Ava",
  "Mila",
  "Julian",
  "Chloe",
] as const;

const LAST_NAMES = [
  "Patel",
  "Nguyen",
  "Brooks",
  "Reed",
  "Shah",
  "Chen",
  "Kim",
  "Martinez",
  "Lopez",
  "Bell",
  "Tran",
  "Wright",
  "Coleman",
  "Singh",
  "Garcia",
  "Foster",
  "Cook",
  "Turner",
  "Santos",
  "Price",
] as const;

const JOB_TITLES = [
  "VP of Sales",
  "Director of Revenue Operations",
  "Head of Business Systems",
  "Sales Operations Manager",
  "Chief Revenue Officer",
  "Director of Partnerships",
  "Demand Generation Lead",
  "RevOps Analyst",
  "Head of Commercial Strategy",
  "Customer Success Director",
] as const;

const DEAL_MOTIONS = [
  "Platform Rollout",
  "Security Upgrade",
  "Revenue Automation",
  "Territory Expansion",
  "Forecast Cleanup",
  "Pipeline Modernization",
  "Reporting Consolidation",
  "Data Migration",
  "Team Standardization",
  "Multi-Region Launch",
] as const;

const TASK_TITLES = [
  "Confirm next executive follow-up",
  "Review mutual action plan",
  "Update close plan with champion",
  "Prepare pricing alignment call",
  "Send recap and next-step email",
  "Reconfirm stakeholder timeline",
  "Validate procurement blockers",
  "Schedule decision-maker outreach",
] as const;

const ACTIVITY_SUBJECTS: Record<ActivityType, string[]> = {
  email: [
    "Shared follow-up recap",
    "Sent pricing clarification",
    "Provided implementation outline",
    "Recapped stakeholder feedback",
  ],
  call: [
    "Discovery checkpoint call",
    "Reviewed evaluation timeline",
    "Discussed procurement blockers",
    "Aligned on next meeting",
  ],
  meeting: [
    "Live product walkthrough",
    "Executive alignment review",
    "Commercial terms discussion",
    "Mutual action plan workshop",
  ],
  note: [
    "Logged buyer feedback",
    "Captured competitive context",
    "Documented renewal risk",
    "Updated internal handoff note",
  ],
};

const OPEN_STAGE_ROTATION: OpenDealStage[] = [
  "Prospecting",
  "Discovery",
  "Demo Scheduled",
  "Proposal",
  "Negotiation",
  "Contract Review",
];

const LATE_STAGE_ROTATION: OpenDealStage[] = [
  "Proposal",
  "Negotiation",
  "Contract Review",
];

const PROBABILITY_BY_STAGE: Record<OpenDealStage | ClosedDealStage, number> = {
  Prospecting: 15,
  Discovery: 28,
  "Demo Scheduled": 42,
  Proposal: 58,
  Negotiation: 73,
  "Contract Review": 86,
  "Closed Won": 100,
  "Closed Lost": 0,
};

type SeededRandom = ReturnType<typeof createSeededRandom>;

type DealFlags = {
  no_upcoming_task: boolean;
  stale_activity: boolean;
  overdue_close_date: boolean;
  missing_primary_contact: boolean;
  incomplete_primary_contact: boolean;
  stuck_late_stage: boolean;
  high_value_at_risk: boolean;
};

type DealProfile = {
  deal: Deal;
  flags: DealFlags;
};

type CreateDemoDataResult = {
  data: DemoData;
  summary: DemoDataSummary;
};

export function createDemoCrmData(seed = 20260504): CreateDemoDataResult {
  const random = createSeededRandom(seed);
  const users = createUsers();
  const { companies, duplicatePairs } = createCompanies(users, random);
  const contacts = createContacts(companies, random);
  const contactsByCompany = groupByCompany(contacts);
  const contactMap = new Map(contacts.map((contact) => [contact.id, contact]));
  const companyMap = new Map(companies.map((company) => [company.id, company]));
  const companyIdsByOwner = groupCompanyIdsByOwner(companies);
  const incompleteContactIds = new Set(
    contacts.filter((contact) => !contact.email || !contact.phone).map((contact) => contact.id),
  );
  const { deals, dealProfiles } = createDeals({
    users,
    companies,
    companyIdsByOwner,
    contactsByCompany,
    contactMap,
    incompleteContactIds,
    random,
  });
  const activities = createActivities({
    dealProfiles,
    contactsByCompany,
    companyMap,
    random,
  });
  const tasks = createTasks(dealProfiles);
  const baseData: DemoData = {
    users,
    companies,
    contacts,
    deals,
    activities,
    tasks,
    findings: [],
  };
  const findings = generateHygieneFindings(baseData, DEMO_REFERENCE_DATE);
  const data: DemoData = {
    ...baseData,
    findings,
  };

  return {
    data,
    summary: createSummary({
      data,
      dealProfiles,
      duplicatePairs,
      incompleteContactIds,
    }),
  };
}

function createUsers(): User[] {
  return [
    {
      id: "user-001",
      name: "Avery Patel",
      email: "avery.patel@crm-sim.local",
      role: "Sales Manager",
      team: "Enterprise East",
    },
    {
      id: "user-002",
      name: "Jordan Brooks",
      email: "jordan.brooks@crm-sim.local",
      role: "Senior Account Executive",
      team: "Enterprise West",
    },
    {
      id: "user-003",
      name: "Linh Tran",
      email: "linh.tran@crm-sim.local",
      role: "Account Executive",
      team: "Mid-Market",
    },
    {
      id: "user-004",
      name: "Sofia Martinez",
      email: "sofia.martinez@crm-sim.local",
      role: "Account Executive",
      team: "Strategic",
    },
    {
      id: "user-005",
      name: "Marcus Bell",
      email: "marcus.bell@crm-sim.local",
      role: "Sales Manager",
      team: "Commercial",
    },
  ];
}

function createCompanies(users: User[], random: SeededRandom) {
  const companies: Company[] = [];
  const generatedNames = COMPANY_PREFIXES.flatMap((prefix) =>
    COMPANY_SUFFIXES.map((suffix) => `${prefix} ${suffix}`),
  );

  let globalCompanyIndex = 0;

  users.forEach((user, ownerIndex) => {
    const companyCount = OWNER_COMPANY_COUNTS[ownerIndex];

    for (let localIndex = 0; localIndex < companyCount; localIndex += 1) {
      const companyIndex = globalCompanyIndex;
      const name = generatedNames[companyIndex];
      const domain = `${slugify(name)}.${pickFromList(["com", "io", "co", "ai"], companyIndex)}`;
      const employeeCount = 45 + (companyIndex % 11) * 32 + random.int(0, 85);
      const annualRevenue =
        employeeCount * (18500 + (companyIndex % 5) * 4200) + random.int(120000, 680000);

      companies.push({
        id: createId("company", companyIndex + 1),
        name,
        domain,
        industry: pickFromList(INDUSTRIES, companyIndex),
        employee_count: employeeCount,
        annual_revenue: annualRevenue,
        owner_id: user.id,
        created_at: toIsoDateTime(subDays(DEMO_REFERENCE_DATE, 55 + companyIndex * 4 + random.int(0, 65))),
      });

      globalCompanyIndex += 1;
    }
  });

  const duplicatePairs = [
    {
      first: 4,
      second: 40,
      firstName: "Northstar Systems",
      secondName: "Northstar System",
      domain: "northstar-systems.com",
    },
    {
      first: 11,
      second: 53,
      firstName: "BluePeak Analytics",
      secondName: "Blue Peak Analytics",
      domain: "bluepeak-analytics.com",
    },
    {
      first: 22,
      second: 66,
      firstName: "CloudHarbor Labs",
      secondName: "Cloud Harbor Labs",
      domain: "cloudharbor.ai",
    },
    {
      first: 30,
      second: 74,
      firstName: "SummitGrid Software",
      secondName: "Summit Grid Software",
      domain: "summitgrid.co",
    },
  ] as const;

  duplicatePairs.forEach((pair) => {
    companies[pair.first] = {
      ...companies[pair.first],
      name: pair.firstName,
      domain: pair.domain,
    };
    companies[pair.second] = {
      ...companies[pair.second],
      name: pair.secondName,
      domain: pair.domain,
    };
  });

  return { companies, duplicatePairs };
}

function createContacts(companies: Company[], random: SeededRandom) {
  const contacts: Contact[] = [];
  const incompleteCompanyIndices = new Set([
    0, 3, 7, 11, 15, 18, 22, 26, 30, 34, 39, 43, 47, 51, 55, 59, 63, 67, 71, 75,
  ]);

  companies.forEach((company, companyIndex) => {
    const contactsForCompany = companyIndex < 40 ? 3 : 2;

    for (let localIndex = 0; localIndex < contactsForCompany; localIndex += 1) {
      const contactIndex = contacts.length;
      const firstName = pickFromList(FIRST_NAMES, contactIndex + companyIndex);
      const lastName = pickFromList(LAST_NAMES, contactIndex * 2 + companyIndex);
      const shouldBeIncomplete = incompleteCompanyIndices.has(companyIndex) && localIndex === 0;

      let email: string | null = `${slugify(`${firstName}.${lastName}`)}@${company.domain}`;
      let phone: string | null = buildPhoneNumber(contactIndex);

      if (shouldBeIncomplete) {
        if (companyIndex % 3 === 0) {
          email = null;
        } else if (companyIndex % 3 === 1) {
          phone = null;
        } else {
          email = null;
          phone = null;
        }
      }

      contacts.push({
        id: createId("contact", contactIndex + 1),
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        job_title: pickFromList(JOB_TITLES, contactIndex + localIndex),
        company_id: company.id,
        owner_id: company.owner_id,
        created_at: toIsoDateTime(
          subDays(
            DEMO_REFERENCE_DATE,
            18 + companyIndex * 2 + localIndex * 9 + random.int(0, 30),
          ),
        ),
      });
    }
  });

  return contacts;
}

function createDeals({
  users,
  companies,
  companyIdsByOwner,
  contactsByCompany,
  contactMap,
  incompleteContactIds,
  random,
}: {
  users: User[];
  companies: Company[];
  companyIdsByOwner: Map<string, string[]>;
  contactsByCompany: Map<string, Contact[]>;
  contactMap: Map<string, Contact>;
  incompleteContactIds: Set<string>;
  random: SeededRandom;
}) {
  const deals: Deal[] = [];
  const dealProfiles: DealProfile[] = [];
  const companyMap = new Map(companies.map((company) => [company.id, company]));

  let openDealIndex = 0;

  users.forEach((user, ownerIndex) => {
    const companyIds = companyIdsByOwner.get(user.id) ?? [];
    const counts = OWNER_DEAL_COUNTS[ownerIndex];
    const totalDeals = counts.open + counts.won + counts.lost;

    for (let localIndex = 0; localIndex < totalDeals; localIndex += 1) {
      const dealIndex = deals.length;
      const companyId = companyIds[localIndex % companyIds.length];
      const status = resolveDealStatus(localIndex, counts);
      const flags =
        status === "open" ? createOpenDealFlags(openDealIndex) : createEmptyDealFlags();
      const stage = resolveDealStage(status, openDealIndex, flags);
      const amount = resolveDealAmount(status, openDealIndex, ownerIndex, flags);
      const closeDate = resolveCloseDate(status, openDealIndex, ownerIndex, flags);
      const createdAt = subDays(
        DEMO_REFERENCE_DATE,
        110 + ownerIndex * 18 + localIndex * 3 + random.int(0, 50),
      );
      const updatedAt = resolveUpdatedAt(status, openDealIndex, localIndex, flags);
      const companyContacts = contactsByCompany.get(companyId) ?? [];
      const primaryContactId = resolvePrimaryContactId({
        companyContacts,
        contactMap,
        incompleteContactIds,
        flags,
      });
      const company = companyMap.get(companyId);

      const deal: Deal = {
        id: createId("deal", dealIndex + 1),
        name: `${company?.name ?? `Account ${dealIndex + 1}`} ${pickFromList(DEAL_MOTIONS, dealIndex)}`,
        company_id: companyId,
        primary_contact_id: primaryContactId,
        owner_id: user.id,
        pipeline: resolvePipeline(openDealIndex, status),
        stage,
        amount,
        probability: PROBABILITY_BY_STAGE[stage],
        close_date: closeDate,
        status,
        created_at: toIsoDateTime(createdAt),
        updated_at: toIsoDateTime(updatedAt > createdAt ? updatedAt : addHours(createdAt, 12)),
      };

      deals.push(deal);
      dealProfiles.push({ deal, flags });

      if (status === "open") {
        openDealIndex += 1;
      }
    }
  });

  return { deals, dealProfiles };
}

function createActivities({
  dealProfiles,
  contactsByCompany,
  companyMap,
  random,
}: {
  dealProfiles: DealProfile[];
  contactsByCompany: Map<string, Contact[]>;
  companyMap: Map<string, Company>;
  random: SeededRandom;
}) {
  const activities: Activity[] = [];

  dealProfiles.forEach((profile, dealIndex) => {
    const activityCount = 3 + (dealIndex % 4) + (dealIndex < 125 ? 1 : 0);
    const dealContacts = contactsByCompany.get(profile.deal.company_id) ?? [];
    const fallbackContactId =
      profile.deal.primary_contact_id ?? dealContacts[0]?.id ?? "contact-001";
    const latestDaysAgo =
      profile.flags.stale_activity || profile.flags.high_value_at_risk
        ? 15 + (dealIndex % 16)
        : profile.deal.status === "open"
          ? dealIndex % 8
          : 6 + (dealIndex % 14);

    for (let activityIndex = 0; activityIndex < activityCount; activityIndex += 1) {
      const type = pickFromList(["email", "call", "meeting", "note"] as const, dealIndex + activityIndex);
      const daysAgo =
        latestDaysAgo +
        (activityCount - activityIndex - 1) * (2 + ((dealIndex + activityIndex) % 3));
      const occurredAt = addHours(
        subDays(DEMO_REFERENCE_DATE, daysAgo),
        8 + random.int(0, 8),
      );
      const company = companyMap.get(profile.deal.company_id);

      activities.push({
        id: createId("activity", activities.length + 1),
        deal_id: profile.deal.id,
        contact_id:
          dealContacts[(activityIndex + dealIndex) % dealContacts.length]?.id ?? fallbackContactId,
        owner_id: profile.deal.owner_id,
        type,
        subject: pickFromList(ACTIVITY_SUBJECTS[type], dealIndex + activityIndex),
        body: `Updated ${company?.name ?? "account"} on commercial progress and captured follow-up context in CRM simulation mode.`,
        occurred_at: toIsoDateTime(occurredAt),
      });
    }
  });

  return activities;
}

function createTasks(dealProfiles: DealProfile[]) {
  const tasks: Task[] = [];
  const openDealsWithoutUpcomingTask = dealProfiles.filter(
    (profile) => profile.deal.status === "open" && profile.flags.no_upcoming_task,
  );
  const healthyOpenDeals = dealProfiles.filter(
    (profile) => profile.deal.status === "open" && !profile.flags.no_upcoming_task,
  );
  const closedDeals = dealProfiles.filter((profile) => profile.deal.status !== "open");

  healthyOpenDeals.forEach((profile, index) => {
    tasks.push(
      createTaskRecord({
        id: tasks.length + 1,
        deal_id: profile.deal.id,
        owner_id: profile.deal.owner_id,
        title: pickFromList(TASK_TITLES, index),
        due_date: toIsoDate(addDays(DEMO_REFERENCE_DATE, 1 + (index % 9))),
        status: "open",
        created_at: toIsoDateTime(subDays(DEMO_REFERENCE_DATE, 6 + (index % 12))),
      }),
    );
  });

  openDealsWithoutUpcomingTask.slice(0, 20).forEach((profile, index) => {
    const status: TaskStatus = index % 2 === 0 ? "open" : "completed";

    tasks.push(
      createTaskRecord({
        id: tasks.length + 1,
        deal_id: profile.deal.id,
        owner_id: profile.deal.owner_id,
        title: pickFromList(TASK_TITLES, index + 12),
        due_date: toIsoDate(subDays(DEMO_REFERENCE_DATE, 1 + (index % 10))),
        status,
        created_at: toIsoDateTime(subDays(DEMO_REFERENCE_DATE, 10 + (index % 18))),
      }),
    );
  });

  closedDeals.slice(0, 25).forEach((profile, index) => {
    tasks.push(
      createTaskRecord({
        id: tasks.length + 1,
        deal_id: profile.deal.id,
        owner_id: profile.deal.owner_id,
        title: pickFromList(TASK_TITLES, index + 25),
        due_date: toIsoDate(subDays(DEMO_REFERENCE_DATE, 5 + (index % 15))),
        status: "completed",
        created_at: toIsoDateTime(subDays(DEMO_REFERENCE_DATE, 12 + (index % 20))),
      }),
    );
  });

  healthyOpenDeals.slice(0, 5).forEach((profile, index) => {
    tasks.push(
      createTaskRecord({
        id: tasks.length + 1,
        deal_id: profile.deal.id,
        owner_id: profile.deal.owner_id,
        title: pickFromList(TASK_TITLES, index + 55),
        due_date: toIsoDate(addDays(DEMO_REFERENCE_DATE, 10 + index * 2)),
        status: "open",
        created_at: toIsoDateTime(subDays(DEMO_REFERENCE_DATE, 2 + index)),
      }),
    );
  });

  return tasks;
}

function createSummary({
  data,
  dealProfiles,
  duplicatePairs,
  incompleteContactIds,
}: {
  data: DemoData;
  dealProfiles: DealProfile[];
  duplicatePairs: ReadonlyArray<{
    first: number;
    second: number;
    firstName: string;
    secondName: string;
    domain: string;
  }>;
  incompleteContactIds: Set<string>;
}): DemoDataSummary {
  const duplicateCompanyIds = duplicatePairs.flatMap((pair) => [
    data.companies[pair.first].id,
    data.companies[pair.second].id,
  ]);

  const countFlag = (key: keyof DealFlags) =>
    dealProfiles.filter((profile) => profile.flags[key]).length;

  return {
    reference_date: toIsoDate(DEMO_REFERENCE_DATE),
    entity_counts: {
      users: data.users.length,
      companies: data.companies.length,
      contacts: data.contacts.length,
      deals: data.deals.length,
      activities: data.activities.length,
      tasks: data.tasks.length,
      findings: data.findings.length,
    },
    anomaly_counts: {
      duplicate_company_pairs: duplicatePairs.length,
      duplicate_company_records: duplicateCompanyIds.length,
      incomplete_contacts: incompleteContactIds.size,
      deals_without_upcoming_tasks: countFlag("no_upcoming_task"),
      deals_without_recent_activity: countFlag("stale_activity"),
      overdue_close_dates: countFlag("overdue_close_date"),
      deals_missing_primary_contact: countFlag("missing_primary_contact"),
      deals_with_incomplete_primary_contact: countFlag("incomplete_primary_contact"),
      deals_stuck_in_late_stage: countFlag("stuck_late_stage"),
      high_value_deals_at_risk: countFlag("high_value_at_risk"),
    },
    owner_insights: data.users.map((user) => {
      const ownerDeals = dealProfiles.filter((profile) => profile.deal.owner_id === user.id);

      return {
        user_id: user.id,
        owner_name: user.name,
        company_count: data.companies.filter((company) => company.owner_id === user.id).length,
        deal_count: ownerDeals.length,
        open_deal_count: ownerDeals.filter((profile) => profile.deal.status === "open").length,
        seeded_dirty_deal_count: ownerDeals.filter((profile) => hasDirtyFlag(profile.flags)).length,
      };
    }),
    sample_ids: {
      duplicate_company_ids: duplicateCompanyIds.slice(0, 4),
      incomplete_contact_ids: Array.from(incompleteContactIds).slice(0, 4),
      no_upcoming_task_deal_ids: dealProfiles
        .filter((profile) => profile.flags.no_upcoming_task)
        .slice(0, 4)
        .map((profile) => profile.deal.id),
      stale_deal_ids: dealProfiles
        .filter((profile) => profile.flags.stale_activity)
        .slice(0, 4)
        .map((profile) => profile.deal.id),
      overdue_deal_ids: dealProfiles
        .filter((profile) => profile.flags.overdue_close_date)
        .slice(0, 4)
        .map((profile) => profile.deal.id),
      high_value_at_risk_deal_ids: dealProfiles
        .filter((profile) => profile.flags.high_value_at_risk)
        .slice(0, 4)
        .map((profile) => profile.deal.id),
    },
  };
}

function groupByCompany(contacts: Contact[]) {
  const map = new Map<string, Contact[]>();

  contacts.forEach((contact) => {
    const current = map.get(contact.company_id) ?? [];
    current.push(contact);
    map.set(contact.company_id, current);
  });

  return map;
}

function groupCompanyIdsByOwner(companies: Company[]) {
  const map = new Map<string, string[]>();

  companies.forEach((company) => {
    const current = map.get(company.owner_id) ?? [];
    current.push(company.id);
    map.set(company.owner_id, current);
  });

  return map;
}

function resolveDealStatus(
  localIndex: number,
  counts: { open: number; won: number; lost: number },
): DealStatus {
  if (localIndex < counts.open) {
    return "open";
  }

  if (localIndex < counts.open + counts.won) {
    return "won";
  }

  return "lost";
}

function createOpenDealFlags(openDealIndex: number): DealFlags {
  return {
    no_upcoming_task: isWithinRanges(openDealIndex, [
      [0, 11],
      [18, 25],
      [32, 37],
      [48, 51],
    ]),
    stale_activity: isWithinRanges(openDealIndex, [
      [0, 9],
      [18, 25],
      [32, 37],
      [60, 63],
    ]),
    overdue_close_date: isWithinRanges(openDealIndex, [
      [4, 11],
      [26, 33],
      [50, 55],
    ]),
    missing_primary_contact: isWithinRanges(openDealIndex, [
      [2, 5],
      [20, 23],
      [48, 51],
    ]),
    incomplete_primary_contact: isWithinRanges(openDealIndex, [
      [6, 10],
      [24, 28],
      [52, 56],
    ]),
    stuck_late_stage: isWithinRanges(openDealIndex, [
      [0, 15],
      [34, 41],
      [70, 71],
    ]),
    high_value_at_risk: isWithinRanges(openDealIndex, [
      [0, 3],
      [18, 21],
      [32, 33],
    ]),
  };
}

function createEmptyDealFlags(): DealFlags {
  return {
    no_upcoming_task: false,
    stale_activity: false,
    overdue_close_date: false,
    missing_primary_contact: false,
    incomplete_primary_contact: false,
    stuck_late_stage: false,
    high_value_at_risk: false,
  };
}

function resolveDealStage(
  status: DealStatus,
  openDealIndex: number,
  flags: DealFlags,
) {
  if (status === "won") {
    return "Closed Won" as const;
  }

  if (status === "lost") {
    return "Closed Lost" as const;
  }

  if (flags.stuck_late_stage || flags.high_value_at_risk) {
    return pickFromList(LATE_STAGE_ROTATION, openDealIndex);
  }

  return pickFromList(OPEN_STAGE_ROTATION, openDealIndex);
}

function resolveDealAmount(
  status: DealStatus,
  openDealIndex: number,
  ownerIndex: number,
  flags: DealFlags,
) {
  if (flags.high_value_at_risk) {
    return 68000 + openDealIndex * 1400;
  }

  if (status === "open" && flags.stuck_late_stage) {
    return 28000 + ownerIndex * 5500 + (openDealIndex % 7) * 3200;
  }

  if (status === "open") {
    return 12000 + ownerIndex * 4200 + (openDealIndex % 12) * 2600;
  }

  if (status === "won") {
    return 18000 + ownerIndex * 5000 + (openDealIndex % 8) * 4100;
  }

  return 14000 + ownerIndex * 3300 + (openDealIndex % 6) * 2800;
}

function resolveCloseDate(
  status: DealStatus,
  openDealIndex: number,
  ownerIndex: number,
  flags: DealFlags,
) {
  if (status === "won" || status === "lost") {
    return toIsoDate(subDays(DEMO_REFERENCE_DATE, 5 + ownerIndex * 7 + (openDealIndex % 35)));
  }

  if (flags.overdue_close_date) {
    return toIsoDate(subDays(DEMO_REFERENCE_DATE, 2 + (openDealIndex % 27)));
  }

  if (flags.high_value_at_risk) {
    return toIsoDate(addDays(DEMO_REFERENCE_DATE, 2 + (openDealIndex % 4)));
  }

  if (flags.stale_activity) {
    return toIsoDate(addDays(DEMO_REFERENCE_DATE, 11 + (openDealIndex % 18)));
  }

  return toIsoDate(addDays(DEMO_REFERENCE_DATE, 15 + ownerIndex * 3 + (openDealIndex % 44)));
}

function resolveUpdatedAt(
  status: DealStatus,
  openDealIndex: number,
  localIndex: number,
  flags: DealFlags,
) {
  if (status === "won" || status === "lost") {
    return subDays(DEMO_REFERENCE_DATE, 4 + (localIndex % 20));
  }

  if (flags.high_value_at_risk) {
    return subDays(DEMO_REFERENCE_DATE, 11 + (openDealIndex % 8));
  }

  if (flags.stuck_late_stage || flags.stale_activity || flags.no_upcoming_task) {
    return subDays(DEMO_REFERENCE_DATE, 14 + (openDealIndex % 19));
  }

  return subDays(DEMO_REFERENCE_DATE, openDealIndex % 6);
}

function resolvePrimaryContactId({
  companyContacts,
  contactMap,
  incompleteContactIds,
  flags,
}: {
  companyContacts: Contact[];
  contactMap: Map<string, Contact>;
  incompleteContactIds: Set<string>;
  flags: DealFlags;
}) {
  if (flags.missing_primary_contact) {
    return null;
  }

  if (flags.incomplete_primary_contact) {
    const incompleteContact =
      companyContacts.find((contact) => incompleteContactIds.has(contact.id)) ?? companyContacts[0];

    if (incompleteContact) {
      if (!incompleteContactIds.has(incompleteContact.id)) {
        const existing = contactMap.get(incompleteContact.id);

        if (existing) {
          existing.phone = null;
          incompleteContactIds.add(existing.id);
        }
      }

      return incompleteContact.id;
    }
  }

  return companyContacts[0]?.id ?? null;
}

function resolvePipeline(openDealIndex: number, status: DealStatus): DealPipeline {
  if (status !== "open") {
    return "New Business";
  }

  return openDealIndex % 5 === 0 ? "Expansion" : "New Business";
}

function createTaskRecord(task: {
  id: number;
  deal_id: string;
  owner_id: string;
  title: string;
  due_date: string;
  status: TaskStatus;
  created_at: string;
}): Task {
  return {
    id: createId("task", task.id),
    deal_id: task.deal_id,
    owner_id: task.owner_id,
    title: task.title,
    due_date: task.due_date,
    status: task.status,
    source: "manual",
    created_at: task.created_at,
  };
}

function hasDirtyFlag(flags: DealFlags) {
  return Object.values(flags).some(Boolean);
}

function buildPhoneNumber(index: number) {
  return `+1-415-555-${String(1100 + index).slice(-4)}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function createId(prefix: string, value: number) {
  return `${prefix}-${String(value).padStart(3, "0")}`;
}

function pickFromList<T>(items: readonly T[], index: number) {
  return items[index % items.length];
}

function isWithinRanges(
  value: number,
  ranges: ReadonlyArray<readonly [number, number]>,
) {
  return ranges.some(([start, end]) => value >= start && value <= end);
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int(min: number, max: number) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
  };
}
