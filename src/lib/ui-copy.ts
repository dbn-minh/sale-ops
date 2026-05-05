export const SIMULATION_MODE_LABEL = "CRM Simulation Mode";

export const KPI_COPY = {
  openDealsScanned: {
    label: "Open deals scanned",
    description:
      "Open opportunities currently included in the hygiene scan.",
  },
  dealsScanned: {
    label: "Deals scanned",
    description:
      "All deal records in the current simulation, including closed records.",
  },
  generatedFindings: {
    label: "Generated findings",
    description:
      "Rule-engine findings generated from the current seeded CRM dataset.",
  },
  criticalFindings: {
    label: "Critical findings",
    description:
      "Severity-critical findings only. This does not include high-severity findings.",
  },
  criticalHighFindings: {
    label: "Critical / high findings",
    description:
      "Combined urgent findings with severity critical or high.",
  },
  uniqueDealsAtRisk: {
    label: "Unique deals at risk",
    description:
      "Distinct open deals with at least one deal-level or duplicate-company risk signal.",
  },
  dealLinkedFindings: {
    label: "Deal-linked findings",
    description:
      "Findings currently linked to open deals in this view. Company-only duplicate findings are counted separately elsewhere.",
  },
  pipelineValueAtRiskDeduplicated: {
    label: "Pipeline value at risk",
    description:
      "Deduplicated exposure across unique open deals at risk. Each risky deal is counted once.",
  },
  pipelineValueAtRiskIssueRollup: {
    label: "Pipeline value at risk",
    description:
      "Issue-level exposure for this view. Duplicate-company findings add company-level exposure separately, so this number can differ from the dashboard.",
  },
  taskCreatedFindings: {
    label: "Task-created findings",
    description:
      "Findings already converted into local follow-up tasks in this browser.",
  },
  seededCrmRecords: {
    label: "Seeded CRM records",
    description:
      "Users, companies, contacts, deals, activities, and tasks loaded into the deterministic simulation.",
  },
} as const;
