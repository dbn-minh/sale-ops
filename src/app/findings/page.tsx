import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FindingsWorkspace } from "@/components/findings/findings-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { crmSimulationFindingsWorkspace } from "@/lib/data/demo-data";

export default function FindingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Findings"
        title="Findings Queue"
        description="Real-time pipeline risk analysis and automated follow-up actions. Filter critical or high-risk findings, update review status, and create follow-up task coverage without touching any real CRM record."
        badge={<Badge tone="warning">Manager review</Badge>}
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

      <FindingsWorkspace model={crmSimulationFindingsWorkspace} />
    </div>
  );
}
