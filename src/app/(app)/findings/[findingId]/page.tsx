"use client";

import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { useGetFindingQuery } from "@/features/findings/findings-api";
import { EvidencePanel } from "@/features/findings/components/evidence-panel";
import { ExplanationPanel } from "@/features/findings/components/explanation-panel";
import { StatusControl } from "@/features/findings/components/status-control";
import { Notes } from "@/features/findings/components/notes";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const severityColors: Record<string, string> = {
  HIGH: "bg-[hsl(var(--severity-high-bg))] text-[hsl(var(--severity-high))] border-transparent",
  MEDIUM: "bg-[hsl(var(--severity-medium-bg))] text-[hsl(var(--severity-medium))] border-transparent",
  LOW: "bg-muted text-muted-foreground border-transparent",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-[hsl(var(--status-open-bg))] text-[hsl(var(--status-open))] border-transparent",
  INVESTIGATING: "bg-[hsl(var(--status-investigating-bg))] text-[hsl(var(--status-investigating))] border-transparent",
  RESOLVED: "bg-[hsl(var(--status-resolved-bg))] text-[hsl(var(--status-resolved))] border-transparent",
};

export default function FindingDetailPage({ params }: { params: { findingId: string } }) {
  const orgId = useSelector(selectCurrentOrgId);
  const { data: finding, isLoading } = useGetFindingQuery(
    { organizationId: orgId!, findingId: params.findingId },
    { skip: !orgId }
  );

  if (isLoading || !finding) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const evidence = finding.evidence as Record<string, any> | undefined;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-semibold">{finding.title}</h1>
          <Badge className={severityColors[finding.severity] || ""} variant="outline">{finding.severity}</Badge>
          <Badge className={statusColors[finding.status] || ""} variant="outline">{finding.status}</Badge>
        </div>
        {finding.detectedAt && (
          <p className="text-sm text-muted-foreground">Detected in the analysis of {new Date(finding.detectedAt).toLocaleDateString()}</p>
        )}
      </div>

      <EvidencePanel
        evidence={evidence}
        periods={evidence?.periods}
        changePct={finding.changePct}
        relatedMetrics={evidence?.relatedMetrics}
      />

      <ExplanationPanel findingId={finding.id} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Investigation</h2>
          <StatusControl findingId={finding.id} status={finding.status as any} />
        </div>
        <Notes findingId={finding.id} />
      </div>
    </div>
  );
}
