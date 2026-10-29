"use client";

import { useEffect, useState } from "react";
import { useGetAnalysisRunQuery } from "./analysis-api";

export function useAnalysisRunPolling(organizationId: string | null, runId: string | null, enabled: boolean) {
  const [isPolling, setIsPolling] = useState(enabled && !!runId);
  const { data: run, refetch } = useGetAnalysisRunQuery(
    { organizationId: organizationId!, runId: runId! },
    { skip: !organizationId || !runId || !isPolling }
  );

  useEffect(() => {
    if (!isPolling || !runId) return;
    if (run?.status === "COMPLETED" || run?.status === "FAILED") {
      setIsPolling(false);
      return;
    }
    const interval = setInterval(() => {
      refetch();
    }, 2000);
    return () => clearInterval(interval);
  }, [isPolling, runId, run?.status, refetch]);

  useEffect(() => {
    if (enabled && runId) {
      setIsPolling(true);
    } else if (!enabled) {
      setIsPolling(false);
    }
  }, [enabled, runId]);

  return { run, isPolling };
}
