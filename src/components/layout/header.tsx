"use client";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { useAppSelector } from "@/store/hooks";
import { UserMenu } from "./user-menu";

export function Header() {
  const org = useAppSelector((state: any) => state.org);
  const businessName = org?.organizations?.find(
    (o: any) => o.id === org.currentOrganizationId
  )?.name || org?.currentOrganizationId || "Business";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex-1">
        <div className="text-sm font-medium">{businessName}</div>
      </div>
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
