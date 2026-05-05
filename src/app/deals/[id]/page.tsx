import { notFound } from "next/navigation";
import { DealDetailWorkspace } from "@/components/deals/deal-detail-workspace";
import { crmSimulationDealsWorkspace } from "@/lib/data/demo-data";

type DealDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params;
  const model = crmSimulationDealsWorkspace.details_by_id[id];

  if (!model) {
    notFound();
  }

  return <DealDetailWorkspace model={model} />;
}
