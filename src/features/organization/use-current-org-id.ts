import { useAppSelector } from "@/store/hooks";

export function useCurrentOrgId() {
  return useAppSelector((state: any) => state.org?.currentOrganizationId ?? null);
}
