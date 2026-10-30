"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setToken, setStatus, clearAuth } from "@/store/auth-slice";
import { baseApi } from "@/store/base-api";

const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = ["/", "/how-it-works", "/about", "/contact", "/privacy", "/terms"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const status = useAppSelector((state) => state.auth.status);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        // Try refresh first
        const refreshRes = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!mounted) return;
        if (refreshRes.ok) {
          const data = await refreshRes.json().catch(() => null);
          const token =
            data?.accessToken ||
            data?.data?.accessToken ||
            data?.token ||
            data?.data?.token ||
            null;
          if (token) {
            dispatch(setToken(token));
          } else {
            dispatch(setStatus("authenticated")); // might have session cookie
          }
        } else {
          dispatch(setStatus("unauthenticated"));
        }

        // Get current user
        const meRes = await fetch("/api/v1/users/me", {
          method: "GET",
          credentials: "include",
          headers: ((): HeadersInit => {
            const state = (globalThis as any).__REDUX_STORE__?.getState?.();
            const t = state?.auth?.accessToken;
            return t ? { Authorization: `Bearer ${t}` } : {};
          })(),
        }).catch(() => null);

        if (!mounted) return;
        if (!meRes || !meRes.ok) {
          // If refresh didn't give us token and me failed, unauthenticated
          dispatch(clearAuth());
        }
        // If ok, user exists - auth state already set if token present
      } catch {
        if (mounted) {
          dispatch(clearAuth());
        }
      } finally {
        if (mounted) setBootstrapped(true);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!bootstrapped) return;
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname?.startsWith(r));
    const isPublic = PUBLIC_ROUTES.some((r) => pathname === r) || pathname?.startsWith("/dev/");

    if (status === "unauthenticated") {
      if (isAuthRoute || isPublic) return;
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
      return;
    }

    if (status === "authenticated") {
      if (isAuthRoute) {
        const isRegister = pathname === "/register" || pathname?.startsWith("/register");
        if (isRegister) {
          router.replace("/onboarding");
          return;
        }
        const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
        if (next && next.startsWith("/")) {
          router.replace(next);
          return;
        }
        router.replace("/dashboard");
        return;
      }
    }
  }, [bootstrapped, status, pathname, router]);

  if (!bootstrapped || status === "unknown") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
