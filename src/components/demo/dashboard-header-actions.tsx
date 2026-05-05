"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DashboardHeaderActionsProps = {
  openDealsCount: number;
  totalFindings: number;
};

export function DashboardHeaderActions({
  openDealsCount,
  totalFindings,
}: DashboardHeaderActionsProps) {
  const [message, setMessage] = useState(
    "Recommended next action: review critical / high findings first.",
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="hidden rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-medium text-muted shadow-sm xl:inline-flex">
        {message}
      </div>
      <Button variant="secondary" icon="download">
        Export
      </Button>
      <Button
        variant="primary"
        icon="scan"
        onClick={() => {
          setMessage(
            `Hygiene scan completed. ${totalFindings} findings detected across ${openDealsCount} open deals.`,
          );
        }}
      >
        Run hygiene scan
      </Button>
    </div>
  );
}
