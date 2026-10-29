"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import Link from "next/link";

export default function TokensPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-2xl font-semibold">Design Tokens</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="text-sm text-primary hover:underline">
              Home
            </Link>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-severity-high-bg text-severity-high-foreground">
              HIGH
            </span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-severity-medium-bg text-severity-medium-foreground">
              MEDIUM
            </span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-status-open-bg text-status-open-foreground">
              OPEN
            </span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-status-investigating-bg text-status-investigating-foreground">
              INVESTIGATING
            </span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-status-resolved-bg text-status-resolved-foreground">
              RESOLVED
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Cards</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Last 30 days vs previous</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">$36,900</p>
                <p className="text-sm text-metric-down tabular-nums">? 23.4%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>Last 30 days vs previous</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">412</p>
                <p className="text-sm text-metric-up tabular-nums">? 12.0%</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Token colors</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="mb-2 h-12 rounded bg-primary" />
              <p className="text-xs">primary</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-2 h-12 rounded bg-background" />
              <p className="text-xs">background</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-2 h-12 rounded bg-card" />
              <p className="text-xs">card</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-2 h-12 rounded bg-muted" />
              <p className="text-xs">muted</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}