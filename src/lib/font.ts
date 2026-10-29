import { Inter } from "next/font/google";

/**
 * Inter via next/font, exposed as a single CSS variable (`--font-sans`).
 * Swapping the font later is a one-file change (this file + globals.css).
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});