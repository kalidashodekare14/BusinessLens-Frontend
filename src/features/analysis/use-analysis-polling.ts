"use client";

import { useEffect, useState } from "react";
import { useGetAnalysisRunQuery } from "./analysis-api";

export function useAnalysisRunPolling(organizationId: string | null, runId: string | null, enabled: boolean) {
  const [isPolling, setIsPolling] = useState(false);
  const { data: run } = useGetAnalysisRunQuery(
    { organizationId: organizationId!, runId: runId! },
    { skip: !organizationId || !runId || !isPolling }
  );

  useEffect(() => {
    let timer: any;
    if (enabled && runId) {
      timer = setTimeout(() => setIsPolling(true), 0);
    } else {
      timer = setTimeout(() => setIsPolling(false), 0);
    }
    return () => clearTimeout(timer);
  }, [enabled, runId]);

  useEffect(() => {
    if (run?.status === "COMPLETED" || run?.status === "FAILED") {
      const timer = setTimeout(() => setIsPolling(false), 0);
      return () => clearTimeout(timer);
    }
  }, [run?.status]);

  return { run, isPolling };
}




