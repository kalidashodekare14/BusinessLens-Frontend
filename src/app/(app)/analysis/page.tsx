"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { useListAnalysisRunsQuery, useStartAnalysisRunMutation, useGetAnalysisRunQuery } from "@/features/analysis/analysis-api";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState, TableSkeleton } from "@/components/common";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  QUEUED: "bg-muted text-muted-foreground border-transparent",
  RUNNING: "bg-[hsl(var(--status-investigating-bg))] text-[hsl(var(--status-investigating))] border-transparent",
  COMPLETED: "bg-[hsl(var(--status-resolved-bg))] text-[hsl(var(--status-resolved))] border-transparent",
  FAILED: "bg-destructive/10 text-destructive border-transparent",
};

export default function AnalysisPage() {
  const orgId = useSelector(selectCurrentOrgId);
  const { data: runs, isLoading } = useListAnalysisRunsQuery(orgId!, { skip: !orgId });
  const [startAnalysis, { isLoading: starting }] = useStartAnalysisRunMutation();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const { data: activeRun } = useGetAnalysisRunQuery(
    { organizationId: orgId!, runId: activeRunId! },
    { skip: !orgId || !activeRunId, pollingInterval: 2000 }
  );

  const runAnalysis = async () => {
    if (!orgId) return;
    try {
      const result = await startAnalysis(orgId).unwrap();
      setActiveRunId(result.id);
      toast.success("Analysis started");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start analysis");
    }
  };

  const runsList = Array.isArray(runs) ? runs : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis"
        description="Run analysis to detect findings"
        actions={
          <Button onClick={runAnalysis} disabled={starting || !orgId}>
            {starting ? "Starting..." : "Run analysis"}
          </Button>
        }
      />
      {(activeRun?.status === "RUNNING" || activeRun?.status === "QUEUED") && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm">Analysis running...</p>
          </CardContent>
        </Card>
      )}
      {activeRun?.status === "FAILED" && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">Analysis failed{(activeRun as any).errorMessage ? `: ${(activeRun as any).errorMessage}` : ""}</p>
          </CardContent>
        </Card>
      )}
      {activeRun?.status === "COMPLETED" && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <p className="text-sm">Analysis completed. {activeRun.findingsCount ?? 0} findings detected.</p>
            <Button asChild size="sm">
              <Link href="/findings">View findings</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : runsList.length === 0 ? (
            <EmptyState title="No analysis runs yet" description="Run your first analysis" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runsList.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <Badge className={statusColors[run.status] || ""} variant="outline">
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{run.findingsCount ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{run.createdAt ? formatDateTime(run.createdAt) : "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{run.completedAt ? formatDateTime(run.completedAt) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
