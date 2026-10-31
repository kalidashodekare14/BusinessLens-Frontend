"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { useGetImportQuery, useUpdateImportMappingMutation, useConfirmImportMutation } from "@/features/imports/imports-api";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const orderFields = [
  { key: "orderId", label: "Order ID", required: true },
  { key: "orderedAt", label: "Ordered At", required: true },
  { key: "status", label: "Status", required: false },
  { key: "productName", label: "Product Name", required: true },
  { key: "sku", label: "SKU", required: false },
  { key: "quantity", label: "Quantity", required: true },
  { key: "unitPrice", label: "Unit Price", required: true },
];

const productFields = [
  { key: "name", label: "Name", required: true },
  { key: "sku", label: "SKU", required: false },
  { key: "price", label: "Price", required: false },
];

export default function ImportDetailPage({ params }: { params: { importId: string } | Promise<{ importId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = useSelector(selectCurrentOrgId);
  const stepParam = searchParams.get("step");
  const [step, setStep] = useState<"mapping" | "preview">(stepParam === "preview" ? "preview" : "mapping");
  const [resolvedImportId, setResolvedImportId] = useState<string | null>(null);

  // Resolve params: Next.js 15+/16 may pass params as a Promise for dynamic routes.
  // Handle both Promise and plain-object cases so importId is always available.
  useEffect(() => {
    const resolve = async () => {
      const p = typeof (params as any).then === "function" ? await (params as any) : (params as any);
      setResolvedImportId(p.importId);
    };
    resolve();
  }, [params]);

  const importId = resolvedImportId;
  const { data: importData, isLoading, refetch } = useGetImportQuery(
    { organizationId: orgId!, importId: importId! },
    { skip: !orgId || !importId, pollingInterval: 2000 }
  );

  const [updateMapping, { isLoading: savingMapping }] = useUpdateImportMappingMutation();
  const [confirmImport, { isLoading: confirming }] = useConfirmImportMutation();

  const initialMapping = (() => {
    const m: Record<string, string> = {};
    const sourceMapping = importData?.columnMapping || importData?.mapping;
    if (sourceMapping) {
      Object.entries(sourceMapping).forEach(([k, v]) => {
        if (v) m[k] = v as string;
      });
    }
    return m;
  })();

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const effectiveMapping = Object.keys(mapping).length > 0 ? mapping : initialMapping;

  if (!importId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Import" description="Loading import…" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isLoading || !importData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Import" description="Loading…" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const canonicalFields = importData.type === "PRODUCTS" ? productFields : orderFields;

  const handleSaveMapping = async () => {
    if (!orgId || !importId) return;
    const required = canonicalFields.filter((f) => f.required).map((f) => f.key);
    const missing = required.filter((r) => !effectiveMapping[r]);
    if (missing.length > 0) {
      toast.error("Please map all required fields");
      return;
    }
    try {
      // Build mapping payload: API accepts null or omission for optional fields,
      // but rejects empty string "". Convert empty-string (Not mapped) values to null.
      const mappingPayload: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(effectiveMapping)) {
        mappingPayload[k] = v || null;
      }
      await updateMapping({ organizationId: orgId, importId, mapping: mappingPayload }).unwrap();
      toast.success("Mapping saved");
      setStep("preview");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save mapping");
    }
  };

  const handleConfirm = async () => {
    if (!orgId || !importId) return;
    try {
      await confirmImport({ organizationId: orgId, importId }).unwrap();
      toast.success("Import confirmed");
      router.push("/imports");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Import Details" description={`File: ${importData.originalFileName ?? importData.fileName} • Type: ${importData.type} • Status: ${importData.status}`} />
      {importData.status === "PROCESSING" ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm">Processing... {importData.processedRows ?? importData.processedCount ?? 0} / {importData.totalRows ?? importData.rowCount ?? 0} rows processed</p>
            {importData.failedRows ?? importData.failedCount ? <p className="text-sm text-destructive">{importData.failedRows ?? importData.failedCount} failed</p> : null}
          </CardContent>
        </Card>
      ) : null}
      {importData.status === "FAILED" || (importData.status === "COMPLETED" && (importData.failedRows ?? importData.failedCount) && (importData.failedRows ?? importData.failedCount)! > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            {importData.errors && importData.errors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.errors.slice(0, 100).map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.row}</TableCell>
                      <TableCell>{e.field || "-"}</TableCell>
                      <TableCell>{e.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No error details available</p>
            )}
          </CardContent>
        </Card>
      ) : null}
      {(importData.status === "UPLOADED" || importData.status === "MAPPED") && step === "mapping" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Map Columns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {canonicalFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label} {field.required ? <span className="text-destructive">*</span> : null}
                  </Label>
                  <Select value={effectiveMapping[field.key] || ""} onValueChange={(v) => setMapping((m) => ({ ...m, [field.key]: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not mapped</SelectItem>
                      {(importData.detectedHeaders ?? []).map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveMapping} disabled={savingMapping}>
                {savingMapping ? "Saving..." : "Save and Continue"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/imports")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {(importData.status === "UPLOADED" || importData.status === "MAPPED") && step === "preview" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview and Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Review mapping and confirm to start processing.</p>
            <div className="flex gap-2">
              <Button onClick={handleConfirm} disabled={confirming}>
                {confirming ? "Confirming..." : "Confirm Import"}
              </Button>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back to Mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {importData.status === "COMPLETED" && !((importData.failedRows ?? importData.failedCount) && (importData.failedRows ?? importData.failedCount)! > 0) ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm">Import completed successfully. {importData.processedRows ?? importData.processedCount ?? importData.totalRows ?? importData.rowCount ?? 0} rows processed.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
