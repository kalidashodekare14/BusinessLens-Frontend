"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { useListImportsQuery } from "@/features/imports/imports-api";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState, TableSkeleton } from "@/components/common";
import { formatDateTime } from "@/lib/format";

const statusColors: Record<string, string> = {
  UPLOADED: "bg-muted text-muted-foreground border-transparent",
  MAPPED: "bg-muted text-muted-foreground border-transparent",
  PROCESSING: "bg-[hsl(var(--status-investigating-bg))] text-[hsl(var(--status-investigating))] border-transparent",
  COMPLETED: "bg-[hsl(var(--status-resolved-bg))] text-[hsl(var(--status-resolved))] border-transparent",
  FAILED: "bg-destructive/10 text-destructive border-transparent",
};

export default function ImportsPage() {
  const orgId = useSelector(selectCurrentOrgId);
  const { data, isLoading } = useListImportsQuery(orgId!, { skip: !orgId });

  const imports = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imports"
        description="Upload and track CSV imports"
        actions={
          <Button asChild>
            <Link href="/imports/new">New import</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : imports.length === 0 ? (
            <EmptyState
              title="No imports yet"
              description="Upload a CSV file to get started"
              action={
                <Button asChild>
                  <Link href="/imports/new">New import</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((imp) => (
                  <TableRow key={imp.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{imp.type}</TableCell>
                    <TableCell>
                      <Link href={`/imports/${imp.id}`} className="hover:underline font-medium">
                        {imp.originalFileName ?? imp.fileName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[imp.status] || ""} variant="outline">
                        {imp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{imp.totalRows ?? imp.rowCount ?? "-"}</TableCell>
                    <TableCell>{imp.processedRows ?? imp.processedCount ?? "-"}</TableCell>
                    <TableCell>{imp.failedRows ?? imp.failedCount ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{imp.createdAt ? formatDateTime(imp.createdAt) : "-"}</TableCell>
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
