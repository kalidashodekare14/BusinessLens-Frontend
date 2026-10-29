"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { Logo } from "@/components/common/logo";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <div className="grid min-h-screen lg:grid-cols-2">
          <div className="flex flex-col">
            <div className="p-6 lg:p-8">
              <Logo />
            </div>
            <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
              <div className="w-full max-w-[400px]">{children}</div>
            </div>
          </div>
          <div className="hidden lg:flex lg:flex-col lg:justify-center lg:bg-primary-subtle lg:p-12">
            <div className="mx-auto max-w-md space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Know what changed in your business.
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>See which changes matter</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Check the evidence</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Know what to look at next</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
