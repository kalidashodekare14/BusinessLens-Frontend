"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateFindingStatusMutation } from "@/features/findings/findings-api";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { toast } from "sonner";

export type FindingStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

const transitions: Record<FindingStatus, FindingStatus[]> = {
  OPEN: ["INVESTIGATING", "RESOLVED"],
  INVESTIGATING: ["OPEN", "RESOLVED"],
  RESOLVED: ["OPEN"],
};

export function getAllowedTransitions(status: FindingStatus): FindingStatus[] {
  return transitions[status] || [];
}

export function StatusControl({ findingId, status }: { findingId: string; status: FindingStatus }) {
  const orgId = useSelector(selectCurrentOrgId);
  const [updateStatus, { isLoading }] = useUpdateFindingStatusMutation();
  const allowed = getAllowedTransitions(status);

  const handleChange = async (next: FindingStatus) => {
    if (next === "RESOLVED") {
      const ok = confirm("Mark this finding as resolved? This represents your investigation outcome.");
      if (!ok) return;
    }
    try {
      await updateStatus({ organizationId: orgId!, findingId, status: next }).unwrap();
    } catch (err: any) {
      if (err?.status === 409) {
        toast.error("Status conflict. The finding may have been updated.");
      } else {
        toast.error(err?.data?.message || "Failed to update status");
      }
    }
  };

  if (allowed.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {allowed.includes("INVESTIGATING") && status === "OPEN" && (
        <Button size="sm" onClick={() => handleChange("INVESTIGATING")} disabled={isLoading}>
          Start investigating
        </Button>
      )}
      {allowed.includes("RESOLVED") && (
        <Button size="sm" variant="secondary" onClick={() => handleChange("RESOLVED")} disabled={isLoading}>
          Mark resolved
        </Button>
      )}
      {allowed.includes("OPEN") && status !== "OPEN" && (
        <Button size="sm" variant="ghost" onClick={() => handleChange("OPEN")} disabled={isLoading}>
          Reopen
        </Button>
      )}
    </div>
  );
}
