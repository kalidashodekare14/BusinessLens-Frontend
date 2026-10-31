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
  const reduxAccessToken = useAppSelector((state) => state.auth.accessToken);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        // Seed from the existing Redux session. On SPA navigation (login/register
        // → dashboard) the store is preserved, so the token is already here.
        // On hard reload it is null and we must rely on /auth/refresh.
        let token: string | null = reduxAccessToken;

        // Try refresh first (may return a new access token + new refresh cookie).
        const refreshRes = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!mounted) return;

        let refreshOk = false;
        if (refreshRes.ok) {
          refreshOk = true;
          const data = await refreshRes.json().catch(() => null);
          const refreshed =
            data?.accessToken ||
            data?.data?.accessToken ||
            data?.token ||
            data?.data?.token ||
            data?.access_token ||
            data?.data?.access_token ||
            (typeof data === "string" ? data : null);
          if (refreshed) {
            token = refreshed;
            dispatch(setToken(refreshed));
          }
        }

        // Get current user. Send Bearer when we have a token; otherwise rely on
        // the httpOnly refresh cookie (session-based auth) if the backend supports it.
        const meRes = await fetch("/api/v1/users/me", {
          method: "GET",
          credentials: "include",
          headers: ((): HeadersInit => {
            return token ? { Authorization: `Bearer ${token}` } : {};
          })(),
        }).catch(() => null);

        if (!mounted) return;
        if (!meRes || !meRes.ok) {
          // No valid /users/me session.
          if (refreshOk && !token) {
            // Refresh cookie is valid but no access token was returned in the
            // body. Treat as a cookie-based session: authenticated without a
            // bearer token (RTK Query still sends the refresh cookie on every call).
            dispatch(setStatus("authenticated"));
          } else {
            // No valid session at all: clear and let the guard redirect to /login.
            dispatch(clearAuth());
          }
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
