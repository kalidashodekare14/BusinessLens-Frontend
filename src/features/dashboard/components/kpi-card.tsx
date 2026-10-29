"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  currency?: string;
  changePercent?: number;
}

export function KPICard({ title, value, previousValue, currency = "USD", changePercent }: KPICardProps) {
  const isPositive = changePercent !== undefined && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{formatCurrency(value, currency)}</div>
        {changePercent !== undefined && (
          <div className="flex items-center gap-1 text-xs mt-1">
            {isNegative && <ArrowDown className="h-3 w-3 text-red-600" />}
            {isPositive && <ArrowUp className="h-3 w-3 text-green-600" />}
            <span className={cn(isNegative && "text-red-600", isPositive && "text-green-600")}>
              {formatPercent(changePercent)}
            </span>
            {previousValue !== undefined && (
              <span className="text-muted-foreground ml-1">
                prev {formatCurrency(previousValue, currency)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
