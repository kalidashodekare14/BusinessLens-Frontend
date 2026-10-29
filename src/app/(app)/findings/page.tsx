"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { useListFindingsQuery } from "@/features/findings/findings-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

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

export default function FindingsPage() {
  const orgId = useSelector(selectCurrentOrgId);
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status") || "";
  const severity = searchParams.get("severity") || "";
  const type = searchParams.get("type") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 20;

  const { data, isLoading } = useListFindingsQuery(
    { organizationId: orgId!, status: status || undefined, severity: severity || undefined, type: type || undefined, page, pageSize },
    { skip: !orgId }
  );

  const findings = Array.isArray(data) ? data : [];

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/findings?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Findings</h1>
        <p className="text-sm text-muted-foreground">Review and investigate changes in your business</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={status || "all"} onValueChange={(v) => updateFilter("status", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="INVESTIGATING">Investigating</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severity || "all"} onValueChange={(v) => updateFilter("severity", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type || "all"} onValueChange={(v) => updateFilter("type", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : findings.length === 0 ? (
            <EmptyState title="No findings" description="Run an analysis to detect changes in your business." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow key={finding.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Badge className={severityColors[finding.severity] || ""} variant="outline">
                        {finding.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[finding.status] || ""} variant="outline">
                        {finding.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/findings/${finding.id}`} className="hover:underline font-medium">
                        {finding.title}
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {finding.changePct !== null && finding.changePct !== undefined ? `${finding.changePct > 0 ? "+" : ""}${finding.changePct.toFixed(1)}%` : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {finding.detectedAt ? formatDate(finding.detectedAt) : finding.createdAt ? formatDate(finding.createdAt) : "-"}
                    </TableCell>
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
