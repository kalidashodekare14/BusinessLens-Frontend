import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/auth-slice";
import { clearOrg } from "@/store/org-slice";
import { baseApi } from "@/store/base-api";

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return async () => {
    try {
      // Best effort server logout if endpoint exists
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    dispatch(clearAuth());
    dispatch(clearOrg());
    dispatch(baseApi.util.resetApiState());
    router.push("/login");
  };
}
