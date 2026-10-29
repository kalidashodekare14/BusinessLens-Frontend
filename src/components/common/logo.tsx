import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Search className="h-6 w-6 text-primary" aria-hidden="true" />
      {showText ? <span className="text-lg font-semibold tracking-tight">BusinessLens</span> : null}
    </div>
  );
}

export default Logo;