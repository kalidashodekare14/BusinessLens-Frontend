# Phase F5 — Imports and analysis pages (Plan)

**Goal:** Implement imports (API + list + 3-step wizard + detail with polling/errors) and the analysis history/run page, following existing patterns (RTK Query, base-api envelope handling, auth/org context, shadcn/ui, toasts).

**Constraints/notes from repo:**
- Work one task at a time per TASKS.md; F5 depends on F1–F4 being done (imports/findings/analysis patterns exist).
- API responses follow envelope shapes; `base-api` already unwraps common envelopes and has auth refresh/single-flight.
- Use existing components/patterns: `PageHeader`, `EmptyState`, `ErrorState`, skeletons, badges, `useCurrentOrgId()`, `analysisApi` polling pattern (F3.2).
- Routes go under `(app)` group: add `app/(app)/imports/...` and `app/(app)/analysis/page.tsx`.
- File uploads go through backend via proxy; client does basic checks (`.csv`, ≤ 5 MB).
- Wizard: step 1 upload, step 2 mapping, step 3 preview/confirm. Redirect to import detail on confirm.
- Poll import status while `PROCESSING`; show progress, error report, clear failed/completed-with-errors states.
- Analysis page reuses F3.2 hook (`useStartAnalysisRunMutation` + polling) for "Run analysis".

## Tasks

### F5.1 Create `imports-api.ts` endpoints (with tags)
- **Location:** `src/features/imports/imports-api.ts` (new feature folder `imports/`)
- **Endpoints (infer from types + TASKS):**
  - `listImports` - GET `/organizations/:orgId/imports` → `Import[]` (transform unwrap)
  - `getImport` - GET `/organizations/:orgId/imports/:importId` → `Import` (provides tag `Import` by id)
  - `createImport` / `uploadImport` - POST to create upload session or upload file. Common patterns: 
    - Option A: `POST /organizations/:orgId/imports` with multipart/form-data (file, type) → returns `Import` (UPLOADED/MAPPING)
    - Option B: create then upload. Check backend contract style from existing codebase; follow same pattern as others (body/query as appropriate). Also need to support mapping/confirm.
  - `updateImportMapping` / `submitMapping` - PATCH/PUT to set mapping: `PATCH /organizations/:orgId/imports/:importId/mapping` with body `{ mapping: ImportMapping }` → `Import`
  - `confirmImport` - POST `POST /organizations/:orgId/imports/:importId/confirm` → `Import` (moves to PROCESSING)
  - `getImportErrors` - may be included in `Import.errors` per type; if separate endpoint exists, add it. Type has `errors?: ImportRowError[] | null` so likely included in get/list.
- **Tags:** add `Import` to `baseApi.tagTypes` (already present). Use invalidates/provides appropriately.
- **Transforms:** same envelope unwrap as other APIs.
- **Exports:** hooks for all endpoints.

**Acceptance:** API slice compiles, tags correct, follows existing patterns.

### F5.2 `/imports` list page
- **Route:** `src/app/(app)/imports/page.tsx` (new)
- **Components:** use `PageHeader` (title "Imports", action "New import" linking to `/imports/new`), table with columns: type, file name, status, counts (rowCount/processedCount/failedCount), date (createdAt), empty state with CTA to wizard.
- **Data:** `useListImportsQuery({ organizationId })` via `useCurrentOrgId()`.
- **States:** loading skeleton, error `ErrorState`, empty `EmptyState`.
- **Styling:** shadcn table/badges consistent with findings list.

**Acceptance:** List renders, empty state works, links to wizard and detail.

### F5.3 Wizard step 1 — upload
- **Route:** `src/app/(app)/imports/new/page.tsx` (multi-step wizard). Can use state machine (step 1/2/3) in page component.
- **UI:** type selector (ORDERS/PRODUCTS), file picker with drag-and-drop, client checks (`.csv`, ≤ 5 MB), help text about one-row-per-line-item format, link/button to download `public/sample-orders.csv` (create sample if missing - check if exists).
- **Flow:** on valid file+type, call create/upload mutation → get `Import` with id/status (likely MAPPING or UPLOADED). Store importId in state/query param and go to step 2.
- **Validation:** show errors for invalid type/size/extension.

**Acceptance:** Upload works, validation enforced, navigates to mapping step.

### F5.4 Wizard step 2 — mapping
- **UI:** form with one select per canonical field, prefilled from backend suggestion (`import.mapping` or suggestion endpoint), required markers, validation before submit.
- **Data:** use `getImport` to load import and suggestions; `updateImportMapping` mutation.
- **Validation:** ensure all required canonical fields mapped (per TASKS). Component test mentioned - add basic test if easy, or ensure structure testable.
- **Flow:** on submit, call mapping mutation → go to step 3.

**Acceptance:** Mapping prefills, validates, submits, proceeds.

### F5.5 Wizard step 3 — preview and confirm
- **UI:** 20-row preview table with per-row errors (if backend provides preview/errors), "Confirm import" button, loading state.
- **Data:** may need preview endpoint or use import data; `confirmImport` mutation.
- **Flow:** on confirm, call mutation → redirect to `/imports/[importId]`.
- **Errors:** show per-row errors if present.

**Acceptance:** Preview shows, confirm works, redirects to detail.

### F5.6 `/imports/[importId]` detail page
- **Route:** `src/app/(app)/imports/[importId]/page.tsx`
- **UI:** status, progress (processed/failed/total), polling while `PROCESSING` (use `useGetImportQuery` with polling interval e.g. 2000ms), error report table (row, field, reason), clear states for failed and completed-with-errors.
- **Data:** `useGetImportQuery({ organizationId, importId }, { pollingInterval: import.status === 'PROCESSING' ? 2000 : 0 })`
- **States:** loading, error, PROCESSING (progress), FAILED (error report), COMPLETED with errors (show summary + error table), COMPLETED clean.

**Acceptance:** Polling works, progress shown, error table rendered, states handled.

### F5.7 `/analysis` page
- **Route:** `src/app/(app)/analysis/page.tsx` (new under `(app)`)
- **UI:** run history table (from `useListAnalysisRunsQuery`), "Run analysis" button using `useStartAnalysisRunMutation` + polling hook pattern from F3.2 (or replicate: start mutation, poll `getAnalysisRun` every 2s until COMPLETED/FAILED, invalidate tags). Also show failure message, "View findings" on completion.
- **Integration:** reuse logic similar to dashboard's "Run analysis" - ensure it invalidates `Finding`, `Dashboard`, `Metrics` as per F3.2.
- **States:** loading, empty, running, failed, completed.

**Acceptance:** Can run analysis, history shown, navigation to findings works.

## File structure (proposed)
```
src/features/imports/
  imports-api.ts
  components/ (optional: wizard steps, upload dropzone, mapping form, preview table)

src/app/(app)/imports/
  page.tsx
  new/page.tsx
  [importId]/page.tsx

src/app/(app)/analysis/
  page.tsx

public/sample-orders.csv (if not exists)
```

## Implementation notes
- Follow existing patterns exactly (transformResponse unwrap, tags, hooks naming)
- Use `useCurrentOrgId()` everywhere org-scoped
- Add `Import` to tagTypes if not already there (check base-api - it has "Import" already: `tagTypes: ["User", "Organization", "Import", "Finding", "Analysis", "Dashboard", "Metrics"]`)
- For wizard, keep state in page component (step, importId, form data). No need for complex store unless necessary.
- Client validation only as specified; server is source of truth.
- Polling: use RTK Query pollingInterval, stop when terminal state.
- Error handling via toasts where appropriate (follow existing pattern).

## Validation plan
- `npm run lint && npm run typecheck && npm run build` must pass
- Manual flow: navigate to /imports, create new import (upload CSV), map fields, preview/confirm, see detail page poll to completion/error states
- Manual flow: /analysis shows history, run analysis, see status update, view findings on completion
- Check empty states, failed states, completed-with-errors

## Risks
- Upload mechanism: need to match backend's expected content-type/field name for file upload (multipart). If backend expects different shape, adjust mutation. Look up how others do it - no existing upload in codebase yet; follow RESTful convention and be flexible.
- Mapping suggestions shape unknown - handle gracefully if missing.
- Preview endpoint may not exist; fall back to showing import data.
- Polling intervals must not spam; stop on terminal states.
