"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStartAnalysisRunMutation } from "@/features/analysis/analysis-api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisRunPolling } from "@/features/analysis/use-analysis-polling";

export function LatestAnalysisCard({ organizationId, latestRun }: { organizationId: string | null; latestRun?: any }) {
  const [startRun, { isLoading }] = useStartAnalysisRunMutation();
  const [runId, setRunId] = useState<string | null>(null);
  const { run } = useAnalysisRunPolling(organizationId, runId, !!runId);
  const router = useRouter();

  const handleRun = async () => {
    if (!organizationId) return;
    const result = await startRun(organizationId).unwrap();
    if (result?.id) {
      setRunId(result.id);
    }
  };

  const status = run?.status || latestRun?.status;
  const time = run?.completedAt || latestRun?.completedAt || latestRun?.createdAt;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Latest analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {status === "RUNNING" || status === "PENDING" ? (
          <div className="text-sm text-muted-foreground">Analyzing…</div>
        ) : status === "COMPLETED" ? (
          <div>
            <div className="text-sm">Completed</div>
            {time && <div className="text-xs text-muted-foreground">{new Date(time).toLocaleString()}</div>}
            <Button variant="link" className="px-0 h-auto" onClick={() => router.push("/analysis")}>
              View findings
            </Button>
          </div>
        ) : status === "FAILED" ? (
          <div>
            <div className="text-sm text-destructive">Failed</div>
            <Button size="sm" variant="outline" onClick={handleRun} disabled={isLoading}>
              Retry
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleRun} disabled={isLoading || !organizationId}>
            Run analysis
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
