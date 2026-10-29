"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { useGetDashboardQuery, useGetMetricsOverviewQuery } from "../dashboard-api";
import { KPICard } from "./kpi-card";
import { OpenFindingsCard } from "./open-findings-card";
import { NeedsAttentionList } from "./needs-attention-list";
import { LatestAnalysisCard } from "./latest-analysis-card";
import { GettingStartedChecklist } from "./getting-started-checklist";
import { NoDataState } from "./no-data-state";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useStartAnalysisRunMutation } from "@/features/analysis/analysis-api";
import { useState } from "react";
import { useAnalysisRunPolling } from "@/features/analysis/use-analysis-polling";

export function DashboardView() {
  const orgState = useAppSelector((state: any) => state.org);
  const orgId = orgState?.currentOrganizationId;
  const org = orgState?.organizations?.find((o: any) => o.id === orgId);
  
  const { data: dashboard, isLoading: dashLoading } = useGetDashboardQuery(orgId!, { skip: !orgId });
  const { data: metrics } = useGetMetricsOverviewQuery({ organizationId: orgId! }, { skip: !orgId });
  const [startRun, { isLoading: starting }] = useStartAnalysisRunMutation();
  const [runId, setRunId] = useState<string | null>(null);
  const { run } = useAnalysisRunPolling(orgId, runId, !!runId);
  const router = useRouter();

  if (!orgId) {
    router.push("/onboarding");
    return null;
  }

  const hasData = dashboard?.hasData !== false && (metrics?.revenue !== undefined || dashboard?.metrics);
  const latestRun = dashboard?.latestAnalysisRun || run;
  const hasAnalysis = latestRun?.status === "COMPLETED";
  const isRunning = latestRun?.status === "RUNNING" || latestRun?.status === "PENDING";

  if (dashLoading) {
    return <div className="space-y-4">Loading...</div>;
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Get started by adding your data</p>
        </div>
        <NoDataState organizationId={orgId} />
        <GettingStartedChecklist hasData={false} hasAnalysis={false} />
      </div>
    );
  }

  if (!hasAnalysis && !isRunning) {
    const handleRun = async () => {
      const result = await startRun(orgId).unwrap();
      if (result?.id) setRunId(result.id);
    };
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your data is ready</p>
        </div>
        <Card className="p-6 text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Run analysis to see findings</h3>
            <p className="text-sm text-muted-foreground">Analysis compares periods and identifies changes.</p>
          </div>
          <Button onClick={handleRun} disabled={starting}>
            Run analysis
          </Button>
        </Card>
        <GettingStartedChecklist hasData={true} hasAnalysis={false} />
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Analyzing…</p>
        </div>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Analysis in progress. This may take a moment.</p>
        </Card>
      </div>
    );
  }

  if (latestRun?.status === "FAILED") {
    const handleRun = async () => {
      const result = await startRun(orgId).unwrap();
      if (result?.id) setRunId(result.id);
    };
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <Card className="p-6 text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-destructive">Analysis failed</h3>
            <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
          </div>
          <Button onClick={handleRun} disabled={starting}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Completed
  const periodText = metrics?.periodLabel || "Last 30 days vs previous 30 days";
  const dataThrough = metrics?.dataThrough || dashboard?.dataThrough;
  const revenue = metrics?.revenue?.current ?? dashboard?.metrics?.revenue?.current;
  const revenuePrev = metrics?.revenue?.previous ?? dashboard?.metrics?.revenue?.previous;
  const revenueChange = metrics?.revenue?.changePercent ?? dashboard?.metrics?.revenue?.changePercent;
  const orders = metrics?.orders?.current ?? dashboard?.metrics?.orders?.current;
  const ordersPrev = metrics?.orders?.previous ?? dashboard?.metrics?.orders?.previous;
  const ordersChange = metrics?.orders?.changePercent ?? dashboard?.metrics?.orders?.changePercent;
  const aov = metrics?.averageOrderValue?.current ?? dashboard?.metrics?.averageOrderValue?.current;
  const aovPrev = metrics?.averageOrderValue?.previous ?? dashboard?.metrics?.averageOrderValue?.previous;
  const aovChange = metrics?.averageOrderValue?.changePercent ?? dashboard?.metrics?.averageOrderValue?.changePercent;
  const openCount = dashboard?.openFindingsCount || 0;
  const highCount = dashboard?.openHighCount || 0;
  const findings = dashboard?.needsAttention || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{org?.name || "Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">
          {periodText}
          {dataThrough && <span> · data through {new Date(dataThrough).toLocaleDateString()}</span>}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {revenue !== undefined && (
          <KPICard title="Revenue" value={revenue} previousValue={revenuePrev} currency={org?.currency || "USD"} changePercent={revenueChange} />
        )}
        {orders !== undefined && (
          <KPICard title="Orders" value={orders} previousValue={ordersPrev} currency={org?.currency || "USD"} changePercent={ordersChange} />
        )}
        {aov !== undefined && (
          <KPICard title="Average order value" value={aov} previousValue={aovPrev} currency={org?.currency || "USD"} changePercent={aovChange} />
        )}
        <OpenFindingsCard count={openCount} highCount={highCount} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <NeedsAttentionList findings={findings} />
        <div className="space-y-4">
          <LatestAnalysisCard organizationId={orgId} latestRun={latestRun} />
          <GettingStartedChecklist hasData={true} hasAnalysis={true} />
        </div>
      </div>
    </div>
  );
}
