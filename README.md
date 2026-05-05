# Sales Ops Hygiene Bot

Sales Ops Hygiene Bot is a manager-facing CRM hygiene demo built to help revenue teams find pipeline risks before revenue slips.

It turns realistic fake CRM data into:
- dashboard KPIs
- filterable findings
- deal-level risk context
- a weekly manager digest
- simulated follow-up task workflows

## Product Description

The product highlights the hygiene issues that quietly erode forecast quality and deal momentum:
- deals with no next step
- stale deals
- overdue close dates
- close-date risk
- missing primary contacts
- incomplete contacts
- duplicate companies
- high-value neglected deals

The current build is optimized for a customer demo, not production use.

## What The App Does

- Scans a deterministic fake CRM dataset
- Generates CRM hygiene findings with severity and recommended action
- Shows pipeline value at risk on the Dashboard
- Lets a manager review and filter findings
- Simulates follow-up task creation without touching any real CRM
- Connects findings to deal detail context
- Produces a Weekly CRM Hygiene Digest for manager review

## CRM Simulation Mode

CRM Simulation Mode is the safety and demo layer for the entire product.

- This demo uses realistic fake CRM data.
- No real CRM credentials are used.
- No real CRM records are changed.
- Write-back actions are simulated locally in the browser.
- Local demo state can be reset from Settings.

## Core Demo Flow

The intended story is:
- Start on Dashboard to show pipeline value at risk and critical findings
- Move into Findings for manager review
- Create a simulated follow-up task
- Open the related Deal detail page
- Show the bot-created task in context
- Finish on Weekly Digest as a Monday morning manager report

## How To Run Locally

Requirements:
- Node.js
- npm

Install and run:

```bash
npm install
npm run dev
```

Open:
- `http://127.0.0.1:3000`

Useful checks:

```bash
npm run lint
npm run build
```

## Main Pages

- `/`
  Dashboard with KPI cards, pipeline value at risk, critical findings, and owner leaderboard
- `/findings`
  Manager review workspace with filters, statuses, and create follow-up task actions
- `/deals`
  Deals needing attention ranked by risk pressure
- `/deals/[id]`
  Deal detail with activities, tasks, findings, and recommended next action
- `/weekly-digest`
  Manager-ready weekly CRM hygiene report
- `/settings`
  CRM Simulation Mode explanation, scan controls, reset control, and seed diagnostics

## Data Model Summary

The app uses typed CRM simulation entities in TypeScript:
- Users / Sales Owners
- Companies
- Contacts
- Deals
- Activities
- Tasks
- Findings

The seeded dataset currently includes:
- 5 sales owners
- 80 companies
- 200 contacts
- 150 deals
- 800 activities
- 120 tasks

The data is deterministic so the demo stays stable between reloads.

## Rule Engine Summary

The current rule engine generates findings for these 8 rules:
- No Next Step
- Stale Deal
- Overdue Close Date
- Close Date Risk
- Missing Primary Contact
- Incomplete Contact
- Duplicate Company
- High Value Deal Neglected

Each finding includes:
- severity
- linked CRM record ids where applicable
- reason
- recommended action
- pipeline value at risk
- open status by default

## Simulated Write-Back

The demo supports lightweight simulated write-back only.

- Mark a finding as reviewed
- Ignore a finding
- Create follow-up task for a deal

These actions are stored in browser-local state only. They are not written to any server, database, or real CRM.

## Integration Readiness

The app now includes a connector architecture for future CRM integration without changing the current demo experience.

- Current mode: `FakeCRMConnector`
- Future mode: `HubSpotConnector` and `PipedriveConnector`

Recommended pilot path:

1. CSV/export audit
2. Read-only CRM integration
3. Controlled write-back for create task and add note
4. Custom rules per sales process

## Known Limitations

- No real CRM API integration yet
- No authentication or billing
- No server-side or multi-user persistence
- No PDF export or email delivery yet
- Some dashboard rollups remain based on seeded generated data rather than fully reactive browser-local overrides

## Future CRM Integration Plan

Planned next steps after demo polish:
- Adopt the existing CRM connector interface across the app's read paths
- Expand the placeholder HubSpot and Pipedrive connectors behind the same interface
- Support safe read-only CRM ingestion first
- Add controlled write-back for follow-up tasks only
- Add audit visibility for any future CRM mutations

## Demo Script

Use this short customer walkthrough:

1. Open Dashboard.
   Show "Pipeline value at risk", "Critical findings", and "Deals needing attention".
2. Click "Run hygiene scan".
   Explain that the scan is deterministic in CRM Simulation Mode.
3. Open Findings.
   Filter to `Critical` or `High` findings and show manager review.
4. Click "Create follow-up task" on a finding tied to a deal.
   Call out that no real CRM record is changed.
5. Open the related Deal detail page.
   Show the bot-created task appearing in the task list.
6. Open Weekly Digest.
   Explain how the same signals become a Monday morning manager report.
7. Open Settings.
   Show CRM Simulation Mode and use "Reset CRM Simulation" before the next demo.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Custom reusable UI components
- Deterministic local data generation
- Browser-local demo persistence for review and task simulation
