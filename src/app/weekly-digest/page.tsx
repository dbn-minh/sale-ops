import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { WeeklyDigestWorkspace } from "@/components/weekly-digest/weekly-digest-workspace";
import { crmSimulationWeeklyDigest } from "@/lib/data/demo-data";

export default function WeeklyDigestPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Weekly Digest"
        title="Weekly CRM Hygiene Digest"
        description={`Find pipeline risks before revenue slips. A Monday morning view of pipeline risk and recommended actions as of ${formatIsoDate(crmSimulationWeeklyDigest.reference_date)}.`}
        actions={
          <>
            <Button variant="secondary" icon="download">
              Export
            </Button>
            <Button variant="primary" icon="scan">
              Run scan
            </Button>
          </>
        }
      />

      <WeeklyDigestWorkspace model={crmSimulationWeeklyDigest} />
    </div>
  );
}

function formatIsoDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}
