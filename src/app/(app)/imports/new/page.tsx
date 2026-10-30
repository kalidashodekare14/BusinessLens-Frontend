"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";
import { useCreateImportMutation } from "@/features/imports/imports-api";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export default function NewImportPage() {
  const router = useRouter();
  const orgId = useSelector(selectCurrentOrgId);
  const [type, setType] = useState<"ORDERS" | "PRODUCTS">("ORDERS");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [createImport, { isLoading }] = useCreateImportMutation();

  const validateFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only CSV files are allowed");
      return false;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be 5 MB or less");
      return false;
    }
    return true;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const onUpload = async () => {
    if (!orgId || !file) return;
    try {
      const result = await createImport({ organizationId: orgId, type, file }).unwrap();
      toast.success("File uploaded");
      router.push(`/imports/${result.id}?step=mapping`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Import" description="Upload a CSV file to import your data" />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Import Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "ORDERS" | "PRODUCTS")}>
              <SelectTrigger className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORDERS">Orders</SelectItem>
                <SelectItem value="PRODUCTS">Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>File</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : ""}`}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm">Drag and drop your CSV here, or</p>
              <Button variant="link" onClick={() => inputRef.current?.click()}>
                browse
              </Button>
              <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onSelect} />
              {file ? <p className="mt-2 text-sm font-medium">{file.name}</p> : null}
            </div>
            <p className="text-xs text-muted-foreground">
              CSV only, max 5 MB. One row per line item.{" "}
              <a href="/sample-orders.csv" download className="underline">
                Download sample CSV
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onUpload} disabled={!file || isLoading || !orgId}>
              {isLoading ? "Uploading..." : "Continue to Mapping"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/imports")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
