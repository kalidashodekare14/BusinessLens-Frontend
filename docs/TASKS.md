# BusinessLens Frontend — Tasks

Rules for this file:

- Work **one task at a time**, in order. Do not start a task whose dependencies are unchecked.
- A box is checked `[x]` only after: the code is written, relevant tests pass, `lint`, `typecheck` and `build` pass, and (for 🔒 tasks) the owner has reviewed it. See `AGENT.md` for the definition of done.
- 🔒 = security-sensitive (auth/token handling). After implementing, stop and give the owner a short review summary.
- ⏸ = owner checkpoint. Stop, tell the owner what to try, and wait.
- Each task should fit roughly 30–60 minutes of agent work. If it is bigger, split it and add the pieces here.
- Day targets assume 3–4 focused hours per day (rough guess: 5–7 days in total).
- `PROJECT_ARCHITECTURE.md` defines the design (section numbers like §4.2 refer to it). `docs/UI_SPEC.md` defines colors, themes, wireframes and screen behavior. The backend API is the source of truth for request/response shapes.
- **Build order is deliberate:** setup and design tokens → API foundation → auth and onboarding → app shell and dashboard (with demo data) → findings → imports and analysis → settings → public website → polish.

---

## Phase F0 — Setup, design tokens, contract (Day 1)

- [x] **F0.1** Create the Next.js app (App Router, TypeScript strict, Tailwind, ESLint, `src/` directory). Add Prettier and scripts: `dev`, `lint`, `typecheck`, `test`, `build`.
  *Done when:* `npm run lint && npm run typecheck && npm run build` pass.
- [x] **F0.2** Initialize shadcn/ui and add base components (button, input, label, form, card, badge, table, tabs, dialog, select, dropdown-menu, sheet, skeleton, separator, textarea, checkbox, sonner).
- [x] **F0.3** **Design tokens and theming** (`docs/UI_SPEC.md` §2): CSS variables for light and dark in `globals.css` (primary, background, card, border, foreground, muted, severity HIGH/MEDIUM, status OPEN/INVESTIGATING/RESOLVED, metric up/down, primary-subtle), mapped into Tailwind/shadcn tokens; Inter loaded via `next/font` as one CSS variable; `next-themes` `ThemeProvider` (class strategy, default system, no flash on load); `ThemeToggle` (Light / Dark / System); `Logo` component (lens icon + "BusinessLens"). Build a temporary `/dev/tokens` page that shows buttons, badges and cards in both themes, to be deleted in F8.1.
  *Done when:* switching theme changes everything, no component has a hard-coded brand or status color, and the primary color can be changed by editing only the `--primary*` variables.
- [x] **F0.4** Environment and proxy: `.env.example` (`BACKEND_URL`, optional `NEXT_PUBLIC_API_BASE_URL`), `next.config` rewrite of `/api/v1/:path*` to the backend (§4.1), basic security headers (§10). Verify `GET /api/v1/health` through the proxy.
- [x] **F0.5** **Contract check.** Get the backend's OpenAPI JSON (Swagger) and save a snapshot as `docs/openapi.json`. Compare it with §6 "Endpoints used" and the response shapes (envelope, list `meta`, import mapping format, evidence shape, explanation content, status values, dashboard shape, whether `GET /findings` can sort by severity). Write every difference in `docs/CONTRACT_NOTES.md` and tell the owner. Do not change the backend.
- [x] **F0.6** `src/types/api.ts`: TypeScript types for all DTOs used by the MVP, based on F0.5 (not guessed).

## Phase F1 — API foundation (Day 1–2)

- [x] **F1.1** Redux store, typed hooks, `StoreProvider`. `base-api.ts` with `fetchBaseQuery` (`credentials: 'include'`), envelope unwrapping, error normalization into `ApiError` (§6). Unit tests for the normalization.
- [x] **F1.2** 🔒 Auth slice and refresh logic: in-memory access token, auth header, refresh-on-401 with **single-flight** (concurrent 401s trigger one refresh), retry once, logout/clear on refresh failure. Tests: two simultaneous 401s call refresh once; failed refresh clears state; no token is ever written to storage.
- [x] **F1.3** 🔒 `AuthProvider` and `(app)` layout guard: on load call `/auth/refresh`, then `/users/me`; show a loading screen meanwhile; redirect to `/login` when unauthenticated (remember the requested internal path); redirect logged-in users away from `/login` and `/register`. Logout resets all API state.
- [x] **F1.4** Organization slice (§4.3): current organization id persisted in `localStorage`, validated against the user's organization list, redirect to `/onboarding` when none. A `useCurrentOrgId()` hook. Clear on a 404 for the current organization.
- [x] **F1.5** Common components and helpers: `PageHeader`, `EmptyState`, `ErrorState`, skeletons, `StatusBadge`, `SeverityBadge` (token colors, text labels), and `lib/format.ts` (money with org currency, signed percent, dates). Unit tests for formatting.

## Phase F2 — Auth pages and onboarding (Day 2)

- [x] **F2.1** Split-screen auth layout (`docs/UI_SPEC.md` §3.1): form column plus brand panel on desktop, form only on mobile; works in both themes.
- [x] **F2.2** `/login` (§3.2): validation, generic error handling (invalid credentials, 429, network), redirect rules, show/hide password.
- [x] **F2.3** `/register` (§3.3): fields, live password checklist, server error display, auto-login and redirect to `/onboarding`. No confirm-password field. "Terms" and "Privacy Policy" are plain text until F7.6 turns them into links (the pages do not exist yet).
- [x] **F2.4** `/onboarding` step 1 (§4): stepper, create the organization (name, currency, time zone).
- [x] **F2.5** `/onboarding` step 2: "Load demo data" (demo-data endpoint, loading state, toast, go to dashboard), "Start import" (go to `/imports/new`), "I'll do this later". Handles loading and errors.

## Phase F3 — App shell and dashboard (Day 2–3)

- [x] **F3.1** App shell (§5): sidebar (Dashboard, Findings, Imports, Analysis, Settings), header with business name, theme toggle and user menu with logout, mobile sheet menu.
- [x] **F3.2** `dashboard-api.ts` and `analysis-api.ts` endpoints (dashboard, metrics overview, analysis runs list/get/start) with tags; a hook that starts a run and polls its status every 2 s until `COMPLETED` or `FAILED`, then invalidates `Finding`, `Dashboard`, `Metrics`.
- [x] **F3.3** Dashboard header and KPI cards (§6): business name, period text, **data through** date, Revenue / Orders / Average order value with previous value and signed change %, Open findings card. Component test.
- [x] **F3.4** Dashboard "Needs attention" list (up to 5 OPEN findings, HIGH first then newest, link to detail), "Latest analysis" card with "Run analysis", and the getting-started checklist.
- [x] **F3.5** Dashboard states (§6 table): no data, data but no analysis, running, failed, completed with findings, completed with none. Component test per state.
- [x] **F3.6** ⏸ **Checkpoint.** Owner runs the flow: register → onboarding → load demo data → dashboard → Run analysis → KPI cards and findings appear, in light and dark. Fix what the owner reports before continuing.

## Phase F4 — Findings (Day 3–4)

- [x] **F4.1** `findings-api.ts` endpoints with tags (list, detail, status, notes, regenerate explanation).
- [x] **F4.2** `/findings` list: table with severity, status, title, change %, date; filters for status, severity, type stored in the URL query; pagination; empty state.
- [x] **F4.3** `/findings/[findingId]` layout and `EvidencePanel` (UI_SPEC §7): current vs previous with period dates, change %, thresholds, related metrics, collapsible raw evidence for unknown fields. Component tests with a revenue, an orders and a product evidence sample.
- [x] **F4.4** `ExplanationPanel`: all states (pending/generating with polling, completed with labeled sections, failed with "Try again", slow after about 2 minutes). Rendered as plain text. Component test for each state.
- [x] **F4.5** `StatusControl`: only valid next transitions, confirmation for RESOLVED with the "your investigation outcome" wording, 409 handling, cache invalidation. Unit test for the transition helper.
- [x] **F4.6** `Notes`: list, add form (validation), delete own notes only.

## Phase F5 — Imports and analysis pages (Day 4–5)

- [ ] **F5.1** `imports-api.ts` endpoints (list, get, create/upload, mapping, confirm, errors) with tags.
- [ ] **F5.2** `/imports` list page (type, file name, status, counts, date) with empty state and link to the wizard.
- [ ] **F5.3** Wizard step 1 — upload: type selector, file picker with drag-and-drop, client checks (`.csv`, ≤ 5 MB), help text on the one-row-per-line-item format, downloadable sample CSV (`public/sample-orders.csv`).
- [ ] **F5.4** Wizard step 2 — mapping: one select per canonical field, prefilled from the backend suggestion, required markers, validation before submit. Component test.
- [ ] **F5.5** Wizard step 3 — preview and confirm: 20-row preview table with per-row errors, "Confirm import", redirect to the import detail page.
- [ ] **F5.6** `/imports/[importId]`: status, progress (processed/failed/total), polling while `PROCESSING`, error report table (row, field, reason), clear failed and completed-with-errors states.
- [ ] **F5.7** `/analysis`: run history table and "Run analysis" (reusing the F3.2 hook), failure message, "View findings" on completion.

## Phase F6 — Settings and global handling (Day 5)

- [ ] **F6.1** `/settings`: profile update, change password (clears session on success, per backend behavior), business settings for OWNER, theme selector.
- [ ] **F6.2** Global handling: `not-found.tsx`, `error.tsx` boundary, toast for unexpected errors, session-expired flow, consistent loading/empty/error states across pages.

## Phase F7 — Public website (Day 5–6)

Built only after the app works. Own layout and navigation; static pages; both themes; honesty rules in `docs/UI_SPEC.md` §8.

- [ ] **F7.1** `(marketing)` layout: public header (logo, Home, How it works, About, Contact, theme toggle, Log in, Get started), mobile menu, footer (product links, Privacy, Terms, GitHub).
- [ ] **F7.2** Home `/` with the sections listed in UI_SPEC §8 (hero, problem, four steps, benefits, labeled "Example" finding card, FAQ, closing call to action).
- [ ] **F7.3** `/how-it-works`.
- [ ] **F7.4** `/about` (owner supplies the builder text and links; use clearly marked placeholders until then).
- [ ] **F7.5** `/contact` as a full page with its sections (intro, contact cards, message form, short FAQ, call to action). Form UI and validation only. **Ask the owner how submission should work before wiring it.**
- [ ] **F7.6** `/privacy` and `/terms` (short, plain, honest about being a demo project; owner reviews). Then make the "Terms" and "Privacy Policy" mentions on `/register` real links.
- [ ] **F7.7** SEO basics: page titles and descriptions, Open Graph tags, `sitemap` and `robots`.

## Phase F8 — Polish and delivery (Day 6–7)

- [ ] **F8.1** Responsive, accessibility and theme pass over every screen: keyboard navigation, focus states, labels, contrast in both themes, tablet and mobile widths. Delete the temporary `/dev/tokens` page.
- [ ] **F8.2** Playwright smoke test and a `test:e2e` script: register → onboarding with demo data → run analysis → open a finding → change its status → add a note. Documented in the README.
- [ ] **F8.3** `README.md`: what the project is, screenshots (dashboard in light and dark, import wizard, finding detail), architecture summary, how to run with the backend's docker compose, demo walkthrough, tech choices.
- [ ] **F8.4** Optional: deploy the frontend (Vercel or Render), set `BACKEND_URL`, verify login, refresh cookie and an import end to end. Record the live URL in the README.

---

## Later (not in the MVP — do not start)

Shopify screens, email verification and password recovery screens, notifications, reports, AI chat, member invitations, audit-log screen, Bengali UI, charts (needs a backend trend endpoint), pricing page.
