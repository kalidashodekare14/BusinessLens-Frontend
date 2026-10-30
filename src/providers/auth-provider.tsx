"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setToken, clearAuth } from "@/store/auth-slice";
import { baseApi } from "@/store/base-api";

const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = ["/", "/how-it-works", "/about", "/contact", "/privacy", "/terms"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const status = useAppSelector((state) => state.auth.status);
  const reduxAccessToken = useAppSelector((state) => state.auth.accessToken);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        // Seed from the existing session (for example the token the login or
        // register page stored just before navigating here). /auth/refresh may
        // upgrade it, but a refresh failure must not clobber a valid token we
        // already hold — otherwise GET /users/me is sent without a Bearer
        // header, 401s, clears auth and kicks the user back to /login.
        let token: string | null = reduxAccessToken;

        // Try refresh first (may return a new access token).
        const refreshRes = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!mounted) return;
        if (refreshRes.ok) {
          const data = await refreshRes.json().catch(() => null);
          const refreshed =
            data?.accessToken ||
            data?.data?.accessToken ||
            data?.token ||
            data?.data?.token ||
            null;
          if (refreshed) {
            token = refreshed;
            dispatch(setToken(refreshed));
          }
        }

        // Get current user
        const meRes = await fetch("/api/v1/users/me", {
          method: "GET",
          credentials: "include",
          headers: ((): HeadersInit => {
            return token ? { Authorization: `Bearer ${token}` } : {};
          })(),
        }).catch(() => null);

        if (!mounted) return;
        if (!meRes || !meRes.ok) {
          // No valid session: clear and let the guard redirect to /login.
          dispatch(clearAuth());
        } else if (token) {
          // /users/me validated the access token; keep auth state authenticated.
          dispatch(setToken(token));
        }
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
  }, [dispatch, reduxAccessToken]);

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
