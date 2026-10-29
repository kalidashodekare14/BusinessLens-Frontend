"use client";

import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth bootstrap (session restore via /auth/refresh) implemented in F1.3
  return <>{children}</>;
}