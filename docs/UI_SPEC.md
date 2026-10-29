# BusinessLens Frontend — UI Specification

Decided by the owner on 2026-10-29. This file says **what the screens look like and do**. `PROJECT_ARCHITECTURE.md` says how the code is organized; `TASKS.md` says the order. Wireframes below are layout sketches; the numbers in them are examples only and must never appear as real data.

Language: **English** for all UI text. (Bengali UI is a possible later addition; do not build it now.)

## 1. Decisions log

| Topic | Decision | Notes |
| --- | --- | --- |
| Primary color | Indigo `#4F46E5` | **May change later.** All colors are CSS variables (section 2), so a change touches one file only. |
| Theme | **Light and dark**, plus "System" | Toggle in the app header, marketing header and Settings. Default: System. |
| Font | Inter via `next/font` | **May change later.** Font is one CSS variable (`--font-sans`) set in one file. |
| Auth layout | Split screen: form left, brand panel right (form only on mobile) | |
| Register | One-step form; no confirm-password field; show/hide password toggle | |
| After demo data | User lands on the dashboard and presses "Run analysis" manually | |
| Navigation (app) | Left sidebar, collapsible; sheet menu on mobile | |
| Public site | Separate pages with their own navigation: Home, How it works, About, Contact, Privacy, Terms | Contact is a full page with several sections (section 8). |
| Charts | None in the MVP | A daily-trend chart needs a new backend endpoint; later. |
| Logo | Text "BusinessLens" plus a small lens icon | |
| Same project | Public site, auth and app live in one Next.js app | Route groups `(marketing)`, `(auth)`, `(app)`. |
| "Forgot password" | Hidden in the MVP | |

## 2. Design tokens

All colors come from CSS variables defined once in `globals.css` (shadcn style), with a `:root` set for light and a `.dark` set for dark. **No component may contain a hard-coded hex color or a raw palette class for brand or status colors** (use semantic tokens: `bg-primary`, `text-muted-foreground`, `bg-severity-high-bg`, and so on). Theme switching uses `next-themes` with the `class` strategy, default `system`, and must not flash the wrong theme on load.

### 2.1 Color values (Tailwind palette values)

| Token | Light | Dark |
| --- | --- | --- |
| `--background` | `#F8FAFC` | `#020617` |
| `--card` / surface | `#FFFFFF` | `#0F172A` |
| `--border` | `#E2E8F0` | `#1E293B` |
| `--foreground` | `#0F172A` | `#F1F5F9` |
| `--muted-foreground` | `#64748B` | `#94A3B8` |
| `--primary` | `#4F46E5` | `#6366F1` |
| `--primary-hover` | `#4338CA` | `#818CF8` |
| `--primary-subtle` (tinted backgrounds, active menu) | `#EEF2FF` | `#1E1B4B` |
| `--primary-foreground` (text on primary) | `#FFFFFF` | `#FFFFFF` |
| Severity HIGH: text / background | `#DC2626` / `#FEF2F2` | `#F87171` / `#450A0A` |
| Severity MEDIUM: text / background | `#D97706` / `#FFFBEB` | `#FBBF24` / `#451A03` |
| Status OPEN: text / background | `#475569` / `#F1F5F9` | `#CBD5E1` / `#1E293B` |
| Status INVESTIGATING: text / background | `#4F46E5` / `#EEF2FF` | `#A5B4FC` / `#1E1B4B` |
| Status RESOLVED: text / background | `#16A34A` / `#F0FDF4` | `#4ADE80` / `#052E16` |
| Metric up / down (change arrows) | `#16A34A` / `#DC2626` | `#4ADE80` / `#F87171` |

Rules: text contrast meets WCAG AA in **both** themes (check each badge and the primary button). Severity and status always show a text label, never color alone. If the owner later swaps the primary color, change only the `--primary*` variables (and re-check contrast in both themes).

### 2.2 Typography, shape, spacing

- Font: Inter. Page title 24 px semibold; section heading 18 px semibold; body 14 px; small 12 px; KPI number 28 px semibold. Numbers use `tabular-nums`.
- Corner radius: cards 12 px; inputs and buttons 8 px. Borders are light 1 px lines; avoid heavy shadows. Spacing on an 8 px grid.
- Sidebar width 248 px; content max width 1200 px.
- Icons: `lucide-react`.
- Logo: a small lens (magnifier) icon in the primary color followed by the word "BusinessLens". One `Logo` component used everywhere.

## 3. Auth screens

### 3.1 Layout

Desktop: two columns. Left: the form (logo on top, form vertically centered, max width about 400 px). Right: a brand panel using the primary tint/color with the tagline **"Know what changed in your business."** and three points: "See which changes matter", "Check the evidence", "Know what to look at next". Mobile: single column with the logo at the top; no brand panel. Login and Register share the layout component. Both themes supported.

### 3.2 Login (`/login`)

```text
[lens] BusinessLens

Welcome back
Log in to your workspace

Email
[ you@company.com              ]
Password
[ ••••••••••••            (eye) ]
[           Log in            ]

New here? Create an account
```

- Fields: Email (required, valid email), Password (required, show/hide toggle).
- Success: go to the page the user originally requested (internal paths only) or `/dashboard`; if the user has no organization, `/onboarding`.
- Wrong credentials: one generic alert above the form: "Invalid email or password." Never say which part was wrong. HTTP 429: "Too many attempts. Please try again in a moment." Network failure: a separate, clear message.
- No "Forgot password" link in the MVP.

### 3.3 Register (`/register`)

```text
Create your account
Start understanding your business data

Full name
[ Your name                    ]
Work email
[ you@company.com              ]
Password
[ ••••••••••••            (eye) ]
( ) At least 10 characters        <- becomes checked as the user types

[        Create account        ]

By creating an account you agree to the Terms and Privacy Policy.
Already have an account? Log in
```

- Fields: Full name (required), Work email, Password (at least 10 characters, live checklist). No confirm-password field.
- Success: the user is logged in automatically and sent to `/onboarding`.
- Errors: show the backend's message in an alert above the form; show field errors under the matching field. "Terms" and "Privacy Policy" are plain text until the public pages exist (task F7.6), then they link to `/terms` and `/privacy`.

### 3.4 Both screens

Submit shows a spinner and disables the fields and button (no double submit); first field is auto-focused; Enter submits; correct `autocomplete` values (`email`, `current-password`, `new-password`); a logged-in user visiting these pages is redirected to `/dashboard`.

## 4. Onboarding (`/onboarding`)

No sidebar. A small stepper "1 Business · 2 Data" on top.

**Step 1: Create your business.** Business name (required); Currency (select, default USD, help text "Used to display amounts. One currency per workspace."); Time zone (select, default the browser's zone); button Continue. Creates the organization.

**Step 2: Add your data.** Two cards and a skip link:

```text
+------------------------------+  +------------------------------+
| Try with demo data           |  | Import my CSV                |
| Sample orders for about 5    |  | Upload your orders and       |
| months. See findings in      |  | products files and map the   |
| under a minute.              |  | columns.                     |
| [ Load demo data ]           |  | [ Start import ]             |
+------------------------------+  +------------------------------+
                  I'll do this later
```

- Load demo data: loading state, then toast "Demo data loaded" and go to `/dashboard`, where "Run analysis" is the emphasized action. Analysis does **not** run automatically.
- Start import: go to `/imports/new`.
- I'll do this later: go to the empty dashboard.
- A user who has no organization is always sent back to step 1 after login.

## 5. App shell

Left sidebar with the logo and items: Dashboard, Findings, Imports, Analysis, Settings (icons from `lucide-react`; the current item uses the primary-subtle background and primary text). Header: business name, theme toggle (Light / Dark / System), user menu (Profile → Settings, Log out). On small screens the sidebar becomes a sheet opened by a menu button.

## 6. Dashboard (`/dashboard`)

Purpose: show what needs attention now and get to the evidence in one click. All numbers come from the backend; the frontend computes nothing.

```text
+----------+----------------------------------------------------------------+
| [lens]   | Dashboard                          Acme Store v    (A) v       |
|          | Last 30 days vs previous 30 days . data through 12 Oct         |
| Dash     | +-----------+ +-----------+ +-----------+ +-----------+        |
| Findings | | Revenue   | | Orders    | | Avg order | | Open      |        |
| Imports  | | $36,900   | | 412       | | $89.56    | | findings  |        |
| Analysis | | v 23.4%   | | v 12.0%   | | v 13.0%   | | 5         |        |
| Settings | | prev $48k | | prev 468  | | prev $103 | | 2 high    |        |
|          | +-----------+ +-----------+ +-----------+ +-----------+        |
|          | +- Needs attention ----------------+ +- Latest analysis --+   |
|          | | [HIGH] Revenue dropped    -23.4% | | Completed          |   |
|          | | [HIGH] Product A revenue  -41.0% | | 12 Oct, 10:42      |   |
|          | | [MED ] Orders dropped     -12.0% | | [ Run analysis ]   |   |
|          | |           View all findings ->   | +--------------------+   |
|          | +----------------------------------+                          |
+----------+----------------------------------------------------------------+
```

| Block | Shows | Source (verify against `docs/openapi.json`) |
| --- | --- | --- |
| Title and period | Business name, "Last 30 days vs previous 30 days", **data through** date | `GET /dashboard`, `GET /metrics/overview` |
| KPI cards (Revenue, Orders, Average order value) | Current value, previous value in small text, change % with arrow (decrease uses the "down" color, increase the "up" color) | `GET /metrics/overview` |
| Open findings card | Total open, how many HIGH | `GET /dashboard` |
| Needs attention | Up to 5 OPEN findings: severity badge, title, change %, link to detail; HIGH first, then newest. Ordering is presentation only | `GET /findings?status=OPEN` |
| Latest analysis | Status, time, "Run analysis" button | `GET /dashboard`, `POST /analysis-runs` |
| Getting-started checklist (until done) | 1 Add data, 2 Run analysis, 3 Open your first finding | derived from state |

"Data through" must always be shown: the periods are based on the latest order date in the data, not today's date.

States (each has its own appearance):

| State | Shown |
| --- | --- |
| No data | Checklist card with "Load demo data" and "Import CSV" instead of KPI cards |
| Data, no analysis | "Your data is ready" and a prominent "Run analysis" button |
| Analysis running | "Analyzing…" with progress; status polled every 2–3 seconds |
| Analysis failed | The backend's safe message (for example not enough orders) and a retry button |
| Completed with findings | The full dashboard |
| Completed, no findings | "No significant changes found." plus: comparison needs at least 20 orders in the previous period; steady numbers are a good sign, not a guarantee |

## 7. Other app screens (summary)

- **Findings** (`/findings`): table with severity, status, title, change %, date; filters for status, severity and type stored in the URL; pagination; empty state.
- **Finding detail** (`/findings/[findingId]`): the main screen.

```text
Revenue dropped 23.4%                                  [HIGH] [Open]
Detected in the analysis of 12 Oct

+- Evidence ------------------------------------------------------+
| Revenue   $36,900  vs  $48,160 previous              -23.4%      |
| Periods   13 Sep - 12 Oct  vs  14 Aug - 12 Sep                   |
| Related   Orders -12.0%  .  Average order value -13.0%           |
| > Raw evidence                                                   |
+------------------------------------------------------------------+
+- AI explanation -- AI-generated from the evidence above ---------+
| Summary . Observed facts . Associated signals                    |
| Possible explanations (hypotheses, not confirmed)                |
| Investigation steps . What we don't know                         |
+------------------------------------------------------------------+
+- Investigation --------------------------------------------------+
| Status: Open     [ Start investigating ]                         |
| Notes ...                                         [ Add note ]   |
+------------------------------------------------------------------+
```

  Evidence comes first and works even if the explanation is pending or failed. "Possible explanations" is always labeled as hypotheses. "Resolved" is the user's own outcome.
- **Imports**: history table and "New import". Wizard: 1) choose type (Orders or Products) and a `.csv` file (max 5 MB; sample CSV download; explain one row per line item), 2) column mapping prefilled from the backend suggestion, 3) 20-row preview with row errors, then Confirm. Detail page shows progress and the error report.
- **Analysis**: run history, "Run analysis", status.
- **Settings**: profile, change password, business settings (OWNER only), theme.

## 8. Public website (`(marketing)` route group)

Own layout with its own navigation; static rendering; page metadata for SEO. **Header:** logo, Home, How it works, About, Contact, theme toggle, "Log in", "Get started" (primary button); mobile menu. **Footer:** product links, Privacy, Terms, GitHub link. All pages work in both themes.

**Honesty rules:** no invented testimonials, customer logos, statistics or awards. Any sample finding card is clearly labeled "Example". Screenshots, when added, are real screenshots of the finished app.

| Route | Sections |
| --- | --- |
| `/` Home | Hero (headline, one-sentence explanation, "Get started" and "See how it works"); the problem (data exists, time to analyze does not); how it works in four steps (Import, Analyze, See evidence, Investigate); key benefits (evidence-backed findings, AI that separates facts from guesses, CSV import, each business's data kept separate); an "Example" finding card; 4–5 FAQs; closing call to action |
| `/how-it-works` | Short intro; the four steps in detail; what happens to your data; what BusinessLens does not do (it does not claim causes it cannot prove, it does not predict); call to action |
| `/about` | Why the project exists; principles (clarity, trustworthy analysis, AI never invents numbers, your data stays yours); who it is for; about the builder (owner supplies text), tech stack, GitHub link |
| `/contact` | A proper page with several sections: intro; contact options as cards (email, GitHub, LinkedIn; owner supplies the values); a "Send a message" form section; short FAQ (for example what to expect after writing); closing call to action. **How the form sends is not decided yet** (options: a mailto link, a third-party form service, or a backend endpoint). Build the form UI with validation, and ask the owner before implementing submission |
| `/privacy`, `/terms` | Short, plain-language pages that state honestly this is a demo/portfolio project; the owner reviews and fills in contact details. These pages are not legal advice |

Not built: `/pricing` (no payments).

## 9. States every screen must have

Loading (skeleton), empty (explains what to do next), error (shows the safe message and a retry where it makes sense), and success. All forms disable the submit button while submitting and show server errors.
