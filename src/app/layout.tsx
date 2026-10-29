import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { StoreProvider } from "@/providers/store-provider";
import { Toaster } from "@/components/ui/toaster";
import { inter } from "@/lib/font";

export const metadata: Metadata = {
  title: "BusinessLens — Know what changed in your business",
  description:
    "BusinessLens helps small businesses understand what changed in their data, with evidence-backed findings and AI explanations.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <StoreProvider>{children}</StoreProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}