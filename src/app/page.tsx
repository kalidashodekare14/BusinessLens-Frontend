"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">BusinessLens</h1>
      <p className="mt-4 text-lg text-muted-foreground">Know what changed in your business</p>
      <Link href="/login" className="mt-6 text-primary hover:underline">
        Log in
      </Link>
    </main>
  );
}