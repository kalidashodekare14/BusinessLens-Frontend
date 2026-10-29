"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format";

export interface EvidencePanelProps {
  evidence?: Record<string, any> | null;
  periods?: { current?: string; previous?: string };
  changePct?: number | null;
  relatedMetrics?: Array<{ label: string; changePct?: number | null }>;
}

export function EvidencePanel({ evidence, periods, changePct, relatedMetrics }: EvidencePanelProps) {
  const [rawOpen, setRawOpen] = useState(false);

  const currentValue = evidence?.currentValue ?? evidence?.current ?? evidence?.value;
  const previousValue = evidence?.previousValue ?? evidence?.previous;
  const currency = evidence?.currency;

  const formatVal = (v: any) => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "number") {
      if (currency) return formatCurrency(v.toString(), currency);
      return v.toLocaleString();
    }
    if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v)) {
      if (currency) return formatCurrency(v, currency);
      const num = parseFloat(v);
      return num.toLocaleString();
    }
    return String(v);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {currentValue !== undefined && previousValue !== undefined && (
            <div>
              <span className="font-medium">{formatVal(currentValue)}</span>
              <span className="text-muted-foreground"> vs </span>
              <span className="text-muted-foreground">{formatVal(previousValue)} previous</span>
              {changePct !== null && changePct !== undefined && (
                <span className="ml-2 tabular-nums">{formatPercent(changePct)}</span>
              )}
            </div>
          )}
          {periods?.current && periods?.previous && (
            <div className="text-muted-foreground">
              Periods {periods.current} vs {periods.previous}
            </div>
          )}
        </div>
        {relatedMetrics && relatedMetrics.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Related: {relatedMetrics.map((m, i) => (
              <span key={i}>
                {m.label} {m.changePct !== null && m.changePct !== undefined ? formatPercent(m.changePct) : "-"}
                {i < relatedMetrics.length - 1 ? " . " : ""}
              </span>
            ))}
          </div>
        )}
        <div>
          <button
            onClick={() => setRawOpen(!rawOpen)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {rawOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Raw evidence
          </button>
          {rawOpen && (
            <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-64">
              {JSON.stringify(evidence, null, 2)}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
