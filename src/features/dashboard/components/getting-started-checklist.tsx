"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

export function GettingStartedChecklist({ hasData, hasAnalysis }: { hasData: boolean; hasAnalysis: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Getting started</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {hasData ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
          <span className={hasData ? "" : "text-muted-foreground"}>1 Add data</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {hasAnalysis ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
          <span className={hasAnalysis ? "" : "text-muted-foreground"}>2 Run analysis</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Circle className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">3 Open your first finding</span>
        </div>
      </CardContent>
    </Card>
  );
}
