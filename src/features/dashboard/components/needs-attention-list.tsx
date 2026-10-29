"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/common/status-badges";
import { formatPercent } from "@/lib/format";

export function NeedsAttentionList({ findings }: { findings: any[] }) {
  const items = (findings || [])
    .filter((f: any) => f.status === "OPEN")
    .sort((a: any, b: any) => {
      const severityOrder: any = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const sa = severityOrder[a.severity] ?? 3;
      const sb = severityOrder[b.severity] ?? 3;
      if (sa !== sb) return sa - sb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Needs attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No open findings</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Needs attention</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((finding: any) => (
          <Link
            key={finding.id}
            href={`/findings/${finding.id}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <span className="text-sm truncate max-w-[200px]">{finding.title}</span>
            </div>
            {finding.changePercent !== undefined && (
              <span className="text-sm tabular-nums">{formatPercent(finding.changePercent)}</span>
            )}
          </Link>
        ))}
        <Link href="/findings" className="text-sm text-primary hover:underline">
          View all findings →
        </Link>
      </CardContent>
    </Card>
  );
}
