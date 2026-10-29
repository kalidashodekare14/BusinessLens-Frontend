import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const classes =
    s === "OPEN"
      ? "bg-[hsl(var(--status-open))]/10 text-[hsl(var(--status-open))] border-[hsl(var(--status-open))]/20"
      : s === "INVESTIGATING"
      ? "bg-[hsl(var(--status-investigating))]/10 text-[hsl(var(--status-investigating))] border-[hsl(var(--status-investigating))]/20"
      : s === "RESOLVED"
      ? "bg-[hsl(var(--status-resolved))]/10 text-[hsl(var(--status-resolved))] border-[hsl(var(--status-resolved))]/20"
      : "bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={cn(classes)}>
      {status}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const s = severity?.toUpperCase();
  const classes =
    s === "HIGH"
      ? "bg-[hsl(var(--severity-high))]/10 text-[hsl(var(--severity-high))] border-[hsl(var(--severity-high))]/20"
      : s === "MEDIUM"
      ? "bg-[hsl(var(--severity-medium))]/10 text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium))]/20"
      : s === "LOW"
      ? "bg-muted text-muted-foreground border-border"
      : "bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={cn(classes)}>
      {severity}
    </Badge>
  );
}
