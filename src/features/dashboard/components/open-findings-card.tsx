"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function OpenFindingsCard({ count, highCount }: { count: number; highCount: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Open findings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{count}</div>
        {highCount > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            {highCount} high
          </div>
        )}
        <Link href="/findings" className="text-xs text-primary hover:underline mt-2 inline-block">
          View all findings →
        </Link>
      </CardContent>
    </Card>
  );
}
