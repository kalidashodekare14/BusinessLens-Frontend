# BusinessLens Frontend — Project Architecture

Status: v1.0 (MVP design). This file defines **how the frontend is built**. `TASKS.md` defines the order of work. `AGENT.md` defines how coding agents must work. If the code and this file disagree, stop and ask the owner.

**Visual design and screen behavior live in `docs/UI_SPEC.md`** (colors, dark/light theme, typography, wireframes, public pages). Read it before building any screen.

The backend lives in a separate repository (`BusinessLens-Backend`). Its `PROJECT_ARCHITECTURE.md` and its Swagger/OpenAPI output (`/api/docs`) define the API. **When this file and the backend's actual API disagree, the backend wins**; record the difference in `docs/CONTRACT_NOTES.md` and adjust the frontend.

## 1. What the frontend is for

BusinessLens helps small businesses understand what changed in their business. The frontend lets a user: register, create a business workspace, import CSV data, run an analysis, read findings with their evidence, read an AI explanation, and track an investigation (OPEN → INVESTIGATING → RESOLVED) with notes.

The UI must make the five core questions easy to answer: What changed? How significant? What evidence? What else is related? What should I investigate next?

## 2. Principles

1. **The backend owns every number.** The frontend displays values from the API. It never recalculates metrics, percentage changes, severity or evidence, and never derives a conclusion from them.
2. **Keep four kinds of statement visually separate:** observed facts, associated signals, possible explanations (hypotheses), and verified causes. The AI explanation panel must label them. The MVP has no verified causes, so possible explanations are always labeled as hypotheses.
3. **Evidence is always one click away** from any finding, and the evidence panel shows the backend's raw values.
4. **AI is optional.** If the explanation is pending or failed, the finding and its evidence still render fully. AI output is rendered as plain text.
5. **Clarity over decoration.** Few charts, clear numbers, practical next steps. Every screen has loading, empty and error states.
6. **Build incrementally.** Only the current task. No features outside the MVP scope (section 13).

## 3. Technology

| Area | Choice |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript (strict) |
| Styling / components | Tailwind CSS, shadcn/ui, `lucide-react` icons |
| Theming | `next-themes` (class strategy): light, dark and system. Colors are CSS variables only (see `docs/UI_SPEC.md` §2) |
| Font | Inter via `next/font`, exposed as one CSS variable so it can be swapped in one place |
| Server state / API | Redux Toolkit with **RTK Query** (`createApi`) |
| Client state | Redux Toolkit slices (auth, current organization) |
| Forms / validation | React Hook Form + Zod (`@hookform/resolvers`) |
| Toasts | `sonner` (via shadcn) |
| Unit / component tests | Vitest (or Jest) + React Testing Library + MSW for API mocks |
| E2E | Playwright (one happy-path smoke test) |
| Package manager | npm |

Check that each package exists and that its current API matches how it is used here before installing; do not rely on memory of versions.

## 4. Connecting to the backend

### 4.1 Same-origin proxy (chosen default)

The browser calls `/api/v1/...` on the **frontend's own origin**. `next.config` rewrites `/api/v1/:path*` to `${BACKEND_URL}/api/v1/:path*` (server-side env var). Benefits: no CORS, and the backend's httpOnly refresh cookie (`bl_refresh`, `Path=/api/v1/auth`) is set on the frontend origin so it just works in development and production.

Fallback if the proxy causes trouble (for example with multipart uploads of up to 5 MB): call the backend directly using `NEXT_PUBLIC_API_BASE_URL`, with `credentials: 'include'`, and configure the backend's `CORS_ORIGIN` and cookie `SameSite`/`Secure` settings. Record the change in `docs/CONTRACT_NOTES.md`.

### 4.2 Authentication flow

- **Access token:** returned in the login/refresh response body and held **in memory only** (Redux `auth` slice). Never in `localStorage`, `sessionStorage` or a readable cookie.
- **Refresh token:** httpOnly cookie managed by the browser and backend. The frontend cannot read it.
- **Session restore:** on app load, the `AuthProvider` calls `POST /auth/refresh` once. Success → store the new access token, load `GET /users/me`, continue. Failure → status `unauthenticated`. While this runs, protected pages show a loading screen (no flash of login page).
- **Token expiry:** `baseQuery` attaches `Authorization: Bearer <token>`. On a 401 from a non-auth endpoint it calls `/auth/refresh` **once** (single-flight: concurrent 401s share one refresh), then retries the original request. If refresh fails, clear auth state and redirect to `/login`.
- **Logout:** `POST /auth/logout`, then reset the whole store (`baseApi.util.resetApiState()`) so no cached data survives.
- **Route protection:** client-side, in the `(app)` layout (the refresh cookie is not visible to Next middleware as a usable session). Protected data is only ever fetched from the API, which enforces real authorization. Frontend route guards are for UX, not security.

### 4.3 Organization context

Tenant endpoints are `/organizations/:organizationId/...`. The `currentOrganizationId` lives in a slice and is persisted in `localStorage` (an id is not a secret). After login: use the stored id if it is in the user's organization list, else the first organization, else redirect to `/onboarding`. A request that returns 404 for the current organization clears the stored id and returns to organization selection. Never invent or guess an organization id.

## 5. Folder structure

```
BusinessLens-Frontend/
├─ docs/ (UI_SPEC.md, CONTRACT_NOTES.md, openapi.json snapshot)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx, not-found.tsx, error.tsx, globals.css (design tokens, light and dark)
│  │  ├─ (marketing)/             # public site: own layout with public header/footer, static
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx              # Home (/)
│  │  │  ├─ how-it-works/page.tsx, about/page.tsx, contact/page.tsx
│  │  │  └─ privacy/page.tsx, terms/page.tsx
│  │  ├─ (auth)/layout.tsx        # split-screen auth layout
│  │  ├─ (auth)/login/page.tsx, (auth)/register/page.tsx
│  │  └─ (app)/
│  │     ├─ layout.tsx            # auth bootstrap, guard, app shell
│  │     ├─ onboarding/page.tsx
│  │     ├─ dashboard/page.tsx
│  │     ├─ imports/page.tsx, imports/new/page.tsx, imports/[importId]/page.tsx
│  │     ├─ analysis/page.tsx
│  │     ├─ findings/page.tsx, findings/[findingId]/page.tsx
│  │     └─ settings/page.tsx
│  ├─ components/
│  │  ├─ ui/                      # shadcn/ui (generated)
│  │  ├─ common/                  # Logo, PageHeader, EmptyState, ErrorState, Skeletons, StatusBadge, SeverityBadge, Money, Percent, ThemeToggle
│  │  └─ marketing/               # public header, footer, section components
│  ├─ store/
│  │  ├─ store.ts, hooks.ts
│  │  ├─ base-api.ts              # createApi, baseQuery with auth header + refresh, envelope unwrap, error normalization
│  │  ├─ auth-slice.ts            # accessToken, status
│  │  └─ org-slice.ts             # currentOrganizationId
│  ├─ features/
│  │  ├─ auth/ (auth-api.ts, schemas.ts, components/)
│  │  ├─ organizations/
│  │  ├─ imports/ (imports-api.ts, components/: UploadStep, MappingStep, PreviewStep, ErrorReportTable)
│  │  ├─ analysis/
│  │  ├─ findings/ (findings-api.ts, components/: FindingsTable, Filters, EvidencePanel, ExplanationPanel, StatusControl, Notes)
│  │  └─ dashboard/
│  ├─ lib/ (format.ts, errors.ts, constants.ts)
│  ├─ providers/ (StoreProvider, AuthProvider, ThemeProvider)
│  └─ types/ (api.ts: DTO types mirroring the backend)
├─ e2e/ (Playwright)
├─ public/
├─ .env.example, README.md
```

Route files stay thin: they compose feature components. Logic and API calls live in `features/`.

## 6. API layer (RTK Query)

- One `baseApi` created with `createApi` and a custom `baseQuery` wrapping `fetchBaseQuery` (`credentials: 'include'`, auth header from state, refresh-on-401 as in 4.2). Features add endpoints with `baseApi.injectEndpoints`.
- **Envelope:** success bodies are `{ data, meta }`. `transformResponse` returns `data` (and `meta` for lists as `{ items, meta }`). Errors are `{ error: { code, message, details } }`; `transformErrorResponse` converts them to a typed `ApiError { status, code, message, details }`. UI shows `message` and uses `code` for logic. Network failures become a generic `NETWORK_ERROR`.
- **Money** arrives as strings. Keep them as strings; format only for display with `Intl.NumberFormat` and the organization's `currency`. Do not do arithmetic on money in the frontend.
- **Tags** and invalidation:

| Endpoint group | Provides | Mutations invalidate |
| --- | --- | --- |
| `users/me`, organizations | `Me`, `Organization` | update profile/org → `Me`/`Organization` |
| imports | `Import` (list, id) | create/mapping/confirm → `Import` |
| products, orders | `Product`, `Order` | demo data → all data tags |
| metrics overview | `Metrics` | analysis completed → `Metrics` |
| analysis runs | `AnalysisRun` | start run → `AnalysisRun` |
| findings | `Finding` (list, id) | status/note/explanation → `Finding`; status also `Dashboard` |
| dashboard | `Dashboard` | analysis completed, status change, demo data |

- **Polling** (`pollingInterval`, stopped when the condition ends): import detail every 2 s while `PROCESSING`; analysis run every 2 s while `QUEUED` or `RUNNING` (on `COMPLETED`, invalidate `Finding`, `Dashboard`, `Metrics`); finding detail every 3 s while the explanation is `PENDING` or `GENERATING`, stopping after about 2 minutes and showing "taking longer than expected" with a retry action.
- **Uploads:** send `FormData` (`file`, `type`); do not set `Content-Type` manually.
- Request/response types live in `src/types/api.ts` and mirror the backend DTOs. Check them against the backend Swagger when implementing each feature.

### Endpoints used

Auth: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`. User: `GET|PATCH /users/me`, `POST /users/me/change-password`. Organizations: `POST|GET /organizations`, `GET|PATCH /organizations/:id`, `POST /organizations/:id/demo-data`.
Under `/organizations/:organizationId`: `POST|GET /imports`, `GET /imports/:importId`, `PUT /imports/:importId/mapping`, `POST /imports/:importId/confirm`, `GET /imports/:importId/errors`, `GET /products`, `GET /orders`, `GET /metrics/overview`, `POST|GET /analysis-runs`, `GET /analysis-runs/:runId`, `GET /findings`, `GET /findings/:findingId`, `PATCH /findings/:findingId/status`, `POST /findings/:findingId/notes`, `DELETE /findings/:findingId/notes/:noteId`, `POST /findings/:findingId/explanation`, `GET /dashboard`. (`GET /audit-logs` exists; no MVP screen uses it.)

## 7. Pages

| Route | Purpose | Key states |
| --- | --- | --- |
| `/`, `/how-it-works`, `/about`, `/contact`, `/privacy`, `/terms` | Public marketing site (built last; sections in `docs/UI_SPEC.md` §8). Contact is a full page with several sections | static |
| `/login`, `/register` | Auth forms in a split-screen layout (`docs/UI_SPEC.md` §3) | field errors, server error, submitting |
| `/onboarding` | Create the business (name, currency, timezone); button "Load demo data" | creating, demo loading |
| `/dashboard` | Open findings by severity, latest analysis, key metrics (current vs previous), "Run analysis" | no data yet → guide to import or demo data; analysis running |
| `/imports` | Import history | empty, loading |
| `/imports/new` | 3-step wizard: upload → map columns → preview and confirm | per-step validation, errors |
| `/imports/[importId]` | Progress, counts, error report table | processing (polling), completed, failed |
| `/analysis` | Analysis history and "Run analysis" | running, failed with message |
| `/findings` | Findings list with filters (status, severity, type), pagination, filters stored in the URL query | empty ("no findings: your metrics look steady, or you need more data") |
| `/findings/[findingId]` | **Main screen:** header (title, severity, status), evidence, AI explanation, status control, notes | explanation pending/failed, 404 |
| `/settings` | Profile, change password, business settings (OWNER) | success toast, errors |

## 8. Key screen behavior

**Import wizard.** Step 1: choose type (Orders or Products) and file (client-side checks: `.csv`, ≤ 5 MB), upload. Step 2: show a select per canonical field, prefilled from the backend's suggested mapping, required fields marked; submit mapping. Step 3: show the 20-row preview and per-row errors from the backend; "Confirm import" starts processing and goes to the import detail page. The orders format is one row per line item; explain this near the upload field and offer the sample CSV (`public/sample-orders.csv`, copied from the backend's `sample-data`). Cancelled/refunded/voided orders are stored but excluded from analysis; mention this in help text.

**Finding detail.**
1. Header: title, severity badge, status badge, created date.
2. **Evidence panel:** current vs previous values (with period dates), change %, thresholds, related metrics. Render the known evidence shape; render any unknown fields in a collapsible "Raw evidence" key-value view so nothing is hidden.
3. **AI explanation panel:** sections "Summary", "Observed facts", "Associated signals", "Possible explanations (hypotheses, not confirmed)", "Investigation steps", "What we don't know". A small note: "AI-generated from the evidence above; numbers are verified against it." States: pending/generating (skeleton + polling), completed, failed (message + "Try again" button calling the regenerate endpoint).
4. **Status control:** shows only valid next transitions (OPEN → INVESTIGATING; INVESTIGATING → RESOLVED; RESOLVED → OPEN "Reopen"). A 409 shows the backend message. Text clarifies that Resolved means *your* investigation outcome.
5. **Notes:** list with author and time; add form; delete only on own notes (UI hides the button for others; the backend enforces it).

**Formatting.** Currency via `Intl.NumberFormat` with the organization currency; percentages with one decimal and an explicit sign (`-14.0%`); dates in the user's locale. Severity and status colors come from semantic tokens that have both a light and a dark value (`docs/UI_SPEC.md` §2.1), always shown with text, never color alone. Components never hard-code brand or status colors, so the primary color and font can be swapped later in one place.

## 9. Forms and validation

React Hook Form + Zod. Zod schemas mirror the backend's rules: email format; password at least 10 characters; organization name required; note text required. Client validation is for UX only; always display server validation errors (`details`) next to fields when present. Disable submit while pending; no double submits.

## 10. Security

- Access token in memory only. No tokens or secrets in `localStorage`, URLs or logs.
- Render all API and AI text as plain text. No `dangerouslySetInnerHTML`, no markdown-to-HTML on AI output.
- Only `NEXT_PUBLIC_*` variables reach the browser, and none may hold secrets. The frontend has no API keys.
- Never trust data from the URL for authorization decisions; ids in URLs are just requests the API authorizes.
- Reset all cached API data on logout and on organization change.
- Set sensible security headers in `next.config` (frame protection, content-type sniffing off, referrer policy). A strict CSP is optional for the MVP.

## 11. Testing

- **Unit:** formatting helpers, Zod schemas, error normalization, the refresh single-flight logic, status-transition helper.
- **Component (RTL + MSW):** login form, mapping step, evidence panel, explanation panel in each state, status control, notes. Mock the API with MSW using the real envelope and error format.
- **E2E (Playwright):** one smoke test against a running backend with seeded data: register → onboarding with demo data → run analysis → open a finding → change its status → add a note.
- A task is not done until its tests pass and lint/type-check/build are clean.

## 12. Configuration and deployment

Environment: `BACKEND_URL` (server-only, used by rewrites; for example `http://localhost:3001` in development), optional `NEXT_PUBLIC_API_BASE_URL` (default `/api/v1`). Local: `npm run dev` with the backend running via its docker compose. Hosted demo: Vercel or Render for the frontend with `BACKEND_URL` pointing at the deployed API; confirm the cookie works end to end (same-origin via the proxy makes this simple).

## 13. Out of scope for the MVP

Shopify integration, email verification and password recovery screens, notifications, reports, expense analysis, AI chat/Q&A, organization invitations and member management, audit-log screen, internationalization (the UI is English only), charts (a daily-trend chart needs a new backend endpoint), a pricing page, offline support. Do not build them.
