import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          subtle: "hsl(var(--primary-subtle))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Semantic severity / status tokens (both themes)
        severity: {
          high: {
            DEFAULT: "hsl(var(--severity-high))",
            bg: "hsl(var(--severity-high-bg))",
            foreground: "hsl(var(--severity-high-foreground))",
          },
          medium: {
            DEFAULT: "hsl(var(--severity-medium))",
            bg: "hsl(var(--severity-medium-bg))",
            foreground: "hsl(var(--severity-medium-foreground))",
          },
        },
        status: {
          open: {
            DEFAULT: "hsl(var(--status-open))",
            bg: "hsl(var(--status-open-bg))",
            foreground: "hsl(var(--status-open-foreground))",
          },
          investigating: {
            DEFAULT: "hsl(var(--status-investigating))",
            bg: "hsl(var(--status-investigating-bg))",
            foreground: "hsl(var(--status-investigating-foreground))",
          },
          resolved: {
            DEFAULT: "hsl(var(--status-resolved))",
            bg: "hsl(var(--status-resolved-bg))",
            foreground: "hsl(var(--status-resolved-foreground))",
          },
        },
        metric: {
          up: "hsl(var(--metric-up))",
          down: "hsl(var(--metric-down))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;