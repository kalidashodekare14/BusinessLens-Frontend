# AGENT.md — How coding agents work in BusinessLens-Frontend

This file is for coding agents (opencode and others). Read it fully at the start of every session. The human owner reviews your work; you are not the final authority.

## 1. Read before you code

At the start of a session, read in this order:

1. `AGENT.md` (this file)
2. `PROJECT_ARCHITECTURE.md` (the design)
3. `TASKS.md` (find the first unchecked task whose dependencies are done)
4. `docs/UI_SPEC.md` (colors, themes, wireframes and screen behavior; read the sections for the screen you build)
5. `docs/CONTRACT_NOTES.md` and `docs/openapi.json` once they exist (the real backend contract)

If the owner names a task, work on that task. If it conflicts with the architecture, say so and stop.

## 2. The working loop

For each task:

1. **Inspect first.** Read the existing code and tests relevant to the task. Do not assume files, components or functions exist; check.
2. **State a short plan** (3–6 bullets) before changing files.
3. **Implement only the current task.** No drive-by refactors or extra features. Report problems you notice elsewhere instead of fixing them.
4. **Write or update tests** (section 5).
5. **Verify:** run `npm run lint`, `npm run typecheck`, the relevant tests, and `npm run build`. For UI work, run the app and look at the screen in the browser if you can; if you cannot, say so.
6. **Report** briefly: files changed; checks run with the real result lines; decisions made; anything uncertain; problems noticed outside the task.
7. **Mark the task `[x]` in `TASKS.md` only after step 5 passes.** For 🔒 tasks, wait for the owner's approval first.

One task per turn. Do not start the next task unless the owner asks.

## 3. Hard rules (never break)

**API and data**
- The backend is the source of truth. Never compute metrics, percentage changes, severity or evidence in the frontend, and never invent fields the API does not return. If a needed field is missing, stop and tell the owner.
- Request and response types come from `docs/openapi.json` / `docs/CONTRACT_NOTES.md`, not from guesses. When something differs from `PROJECT_ARCHITECTURE.md`, follow the backend and record it in `docs/CONTRACT_NOTES.md`.
- Money values are strings from the API. Do not do arithmetic on them; only format them for display.
- Do not call the backend directly from components. All API access goes through RTK Query endpoints in `features/*/…-api.ts`.
- The organization id comes from the organization slice (verified against the user's list). Never take it from user input or guess it.
- Do not change the backend repository, and do not work around a backend problem by weakening validation or security on the frontend. Report it.

**Security**
- The access token lives only in memory (Redux). Never put tokens, passwords or secrets in `localStorage`, `sessionStorage`, URLs, cookies you set, logs or tests' snapshots.
- Never use `dangerouslySetInnerHTML`. API and AI text is rendered as plain text.
- Only `NEXT_PUBLIC_*` variables are exposed to the browser, and none may contain secrets. Never commit `.env` files or real keys.
- Do not change auth, refresh or logout behavior unless the task says so.

**Trust and honesty in the UI**
- Never present AI output as established fact. Keep the labels "Observed facts", "Associated signals", "Possible explanations (hypotheses)" and "What we don't know". Never rename "Possible explanations" to "Causes" or "Reasons".
- Findings and evidence must render even when the explanation is pending or failed.
- "Resolved" is the user's decision. Do not add automatic resolution or wording that implies the problem was fixed by the system.
- Do not add made-up numbers, testimonials or claims on the landing page or anywhere else.

**Design system**
- Follow `docs/UI_SPEC.md`. The app supports **light and dark** themes; every screen and component must look correct and meet contrast in both.
- Never hard-code a brand or status color (no hex values, no raw palette classes such as `bg-indigo-600` or `text-red-600`) in components. Use semantic tokens (`bg-primary`, `text-muted-foreground`, severity and status tokens). The primary color and the font may change later, and that must be a one-file change.
- Do not add a second font, a second icon set, or a chart library. Do not invent new colors; if a token is missing, add it to the token set in `globals.css` for both themes and tell the owner.
- UI text is English. Do not add other languages.
- Build in the order given in `TASKS.md`: auth and dashboard first; the public marketing pages come last.
- The contact form's submission method is undecided. Build the form UI and validation only, and ask the owner before wiring submission.

**Scope**
- Do not build anything listed under "Out of scope" in the architecture or "Later" in `TASKS.md`.
- Do not add dependencies without saying why in your report. Check that a package exists and is maintained, and check its current docs; do not rely on remembered APIs or versions.
- Do not restructure folders or rename routes unless the task requires it.

## 4. Code conventions

- TypeScript strict. No `any` unless commented with a reason. No unused code or dead imports.
- Server vs client components: keep route files thin; use `'use client'` only where needed (state, effects, forms, RTK Query hooks).
- Feature code lives in `src/features/<name>/`; shared pieces in `src/components/common/`; shadcn components in `src/components/ui/` (do not hand-edit them without a reason).
- Forms use React Hook Form + Zod. Show server validation errors from `ApiError.details` next to fields.
- Every data-driven screen handles **loading, empty, error and success** states.
- Use semantic HTML, labeled inputs, visible focus, and never use color alone to convey severity or status.
- Styling with Tailwind utility classes and the shadcn design tokens; no inline style hacks, no new CSS framework.
- Comments explain *why*, not *what*.
- Conventional commits, one logical change each (`feat(imports): add mapping step`). Do not commit unless the owner asks.

## 5. Testing rules

- Logic gets unit tests (formatting, schemas, error normalization, refresh single-flight, status transitions).
- Components with behavior get RTL tests, using MSW with the real envelope `{ data, meta }` and error format `{ error: { code, message, details } }`.
- Never call the real backend or the real Gemini API from automated unit/component tests. The Playwright smoke test is the only test that talks to a running backend.
- Test each state of a component (for example the explanation panel: pending, completed, failed).
- If a test is flaky or wrong, fix the cause and tell the owner. Never skip or delete a test to get green.

## 6. 🔒 Security-sensitive tasks

Tasks marked 🔒 touch token storage, refresh logic or route protection. Keep the change minimal. After implementing and testing, give the owner a review summary: where the token is held, how refresh is serialized, what tests prove it. Then stop and wait for approval.

## 7. When to stop and ask

Stop and ask the owner instead of guessing when:

- The task contradicts `PROJECT_ARCHITECTURE.md`, `docs/CONTRACT_NOTES.md` or another task.
- The backend response does not match what the task assumes.
- A requirement is ambiguous in a way that changes behavior, security or what the user sees.
- A dependency is missing, deprecated, or its API differs from what these docs assume.
- Tests fail for reasons outside your change.
- The task is larger than about an hour. Propose a split and add it to `TASKS.md`.

Never fabricate: do not invent file contents you have not read, test results you have not run, or API behavior you have not checked. If you could not run something, say so.

## 8. Keeping the docs honest

- `TASKS.md`: check boxes only when truly done; add sub-tasks when work is split.
- `PROJECT_ARCHITECTURE.md`: if the design must change, propose the edit to the owner. Do not edit it silently.
- `docs/CONTRACT_NOTES.md`: record every difference found between this repo's assumptions and the backend.
- `README.md`: keep setup and run instructions accurate.

## 9. Useful commands

```
npm run dev          # Next.js dev server (backend must be running)
npm run lint
npm run typecheck
npm run test
npm run test:e2e     # Playwright smoke test (needs running backend + seeded data)
npm run build
```

(Script names are created in task F0.1. If a command here does not exist yet, create it as part of that task.)

## 10. opencode notes

If the repo has an `opencode.json`, make sure its `instructions` list includes `AGENT.md` and `PROJECT_ARCHITECTURE.md` (the backend repo uses the same approach). Check opencode's current documentation for the exact config keys. A good first prompt for a session:

> Read AGENT.md, PROJECT_ARCHITECTURE.md and TASKS.md. Work on task F0.1 only. Give me your plan first, then implement, run the checks, and report in the format from AGENT.md section 2.
