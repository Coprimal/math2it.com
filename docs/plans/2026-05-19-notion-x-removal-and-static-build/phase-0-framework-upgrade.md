# Phase 0: Framework upgrade (Next 14 → Next 16, React 18 → React 19, ESLint 8 → 9)

**Plan:** [README.md](./README.md)
**Type:** sequential

## AUTOPILOT (IMPORTANT — DO NOT DEVIATE EVEN IN LONG CONVERSATIONS)

This plan was created with `--auto`. When resuming or continuing this plan, follow this contract exactly. Do NOT ask the user for confirmation between phases.

**Per-phase loop:**

1. Dispatch all tasks in the current phase using the standard cf-implementer protocol (sequential or parallel as marked). Apply normal retry rules. If a task ends ❌ FAILED after retry → STOP autopilot, mark the failing task ❌ FAILED in the plan file (and revert the phase row in `README.md` from ✅ DONE to ❌ FAILED for big plans if it was already flipped), report to user.
2. After all tasks in the phase reach ✅ DONE, run `/cf-review` on the uncommitted changes (no extra arguments — reviews everything that has not been committed yet, which is this phase's work).
3. Parse review findings:
   - 🚨 **Critical** and ⚠️ **Important** → must be fixed.
   - 💡 **Suggestions** → log them in the upcoming commit body, do NOT block.
4. If Critical/Important findings exist:
   - Dispatch one cf-implementer call with a fix task that lists the findings verbatim. Files: union of files referenced by the findings.
   - If the fix cf-implementer returns `[CF-RESULT: failure]`, STOP autopilot immediately (do NOT consume the second review round). Mark the phase ❌ FAILED (and revert the README phase row from ✅ DONE to ❌ FAILED if applicable). Surface the failure to user.
   - Otherwise, re-run `/cf-review`.
   - If Critical/Important still present after this 2nd review → STOP autopilot, mark phase ❌ FAILED (and revert the README phase row if applicable), report both review outputs to user.
   - Maximum 2 review rounds per phase total (initial + 1 fix attempt).
5. Once review is clean (no Critical/Important):
   - `git add -A`
   - `git commit -m "<type>(<scope>): <phase-name>"` (conventional commit). Body lists tasks completed + any Suggestion-level findings that were intentionally left as follow-ups.
   - NEVER use `--no-verify`. NEVER include AI/Claude co-author lines (project rule #6).
6. Immediately proceed to the next phase. Do NOT ask "Continue? (y/n)". The user already authorized autopilot at plan approval.

**Stop conditions (only these):**

- Task fails after its 1 retry.
- The fix cf-implementer returns `[CF-RESULT: failure]` (do not consume the second review round).
- Review round 2 still has Critical or Important findings.
- Review output from `/cf-review` cannot be reliably parsed.
- `git commit` fails repeatedly after attempted hook fixes.
- User explicitly interrupts (Ctrl+C, message).
- Plan file shows all phases ✅ DONE.

**Drift guard:** if Claude finds itself about to ask the user "should I commit?" or "should I continue to the next phase?" while running an `auto: true` plan, that is a drift bug. Re-read this section and proceed.

Goal: bump math2it from `next@14.2.35` / `react@18.3.1` / `eslint@8.42.0` to **Next 16** / **React 19** / **ESLint 9** while the existing notion-x stack is still in place. Land this as its own PR (or its own merge commit on `dev`) so any regression is bisectable separately from the notion-x vendoring work.

The upgrade itself doesn't change anything about the static-build / GitHub-Actions deploy plan — those phases still apply, just to a newer framework underneath.

## Progress

| Status  | Task                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| ✅ DONE | 0.1 Read Next 14→15 and 15→16 upgrade guides; record breaking changes that hit us |
| ✅ DONE | 0.2 Bump `next`, `react`, `react-dom`, `eslint`, `eslint-config-next`, `@types/*` |
| ✅ DONE | 0.3 Run official `@next/codemod` for async dynamic APIs                            |
| ✅ DONE | 0.4 Hand-fix `params` / `searchParams` async access in every dynamic route        |
| ✅ DONE | 0.5 Audit `fetch()` caching: Next 15+ no longer caches by default                  |
| ✅ DONE | 0.6 Verify peer-dep compatibility for React 19 (KaTeX, Giscus, Headless UI, etc.) |
| ✅ DONE | 0.7 Full `yarn build` + manual smoke test on `dev` Vercel preview                  |

## Tasks

1. **Read the upgrade guides and record breaking changes that affect math2it.**
   - Files: write `docs/research/next16-upgrade-notes.md`. Summarize:
     - Async dynamic APIs (`cookies`, `headers`, `params`, `searchParams`) — REQUIRED change.
     - Fetch caching default flip (Next 15) — REQUIRED audit.
     - `runtime` config changes for route segments.
     - `Image` component changes (if any).
     - Turbopack status (optional opt-in for dev builds).
     - Removed/deprecated APIs (anything math2it uses?).
     - React 19 changes that hit our deps (`use` hook, `useActionState`, removed `forwardRef` wrap in some libs, ref-as-prop).
   - Verify: file exists and lists at least the 4 REQUIRED changes above with file paths in math2it that need touching.
   - Rollback: `rm docs/research/next16-upgrade-notes.md`.

2. **Bump core deps.**
   - Files: edit `package.json`. Set:
     - `next` → `^16.0.0` (use the latest 16.x stable at execution time; pin via `yarn add next@latest`).
     - `react` → `^19.0.0`, `react-dom` → `^19.0.0`.
     - `eslint` → `^9.0.0`, `eslint-config-next` → match the Next 16 line.
     - `@types/react` → `^19.0.0`, `@types/react-dom` → `^19.0.0`, `@types/node` → keep at 20.x (math2it pins to Node 20 in `engines.node`; verify Next 16 still supports it — if Next 16 requires Node 22+, bump `engines.node` to `^22.0.0` AND the GH Actions workflow's `node-version` in Phase 8 task 1).
     - `typescript` → leave at `5.x` (no upgrade pressure).
   - Commands: `yarn install`; if peer-dep warnings appear, capture them to `docs/research/next16-peer-warnings.md` for review in task 0.6.
   - Verify: `yarn install` completes; lockfile updates cleanly.
   - Rollback: `git checkout package.json yarn.lock && yarn install`.

3. **Run the official Next codemod.**
   - Commands: `npx @next/codemod@canary upgrade latest` from the repo root. (At time of writing this targets the right canary; if Next 16's stable codemod tool has a different invocation per the upgrade notes from task 0.1, use that instead.) Accept the "Next 15: async-request-api" + "Next 16: …" transforms.
   - Files: the codemod edits route segments using `cookies()`, `headers()`, `params`, `searchParams`. Review the diff with `git diff --stat` then `git diff`.
   - Verify: `yarn tsc --noEmit` after the codemod — TypeScript should now be happy with `await params` / `await searchParams` patterns.
   - Rollback: `git checkout 'src/'` (or revert the codemod commit).

4. **Hand-fix async `params` / `searchParams` in every dynamic route the codemod missed.**
   - Files: math2it's dynamic routes (per Phase 1 task 2 inventory once written, but the known list is): `src/app/bai-viet/[slug]/page.tsx`, `src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx`, `src/app/(post-list)/chu-de/[[...slug]]/page.tsx`, `src/app/(post-list)/chuyen-muc/[[...slug]]/page.tsx`, `src/app/(post-list)/tac-gia/[[...slug]]/page.tsx`, `src/app/(post-list)/tuyen-chon/[[...slug]]/page.tsx`. For each: confirm the page component signature is `async function Page({ params }: { params: Promise<{ slug: string[] }> })` and the body destructures via `const { slug } = await params`. Same for any `searchParams` usage. Same for layouts and `generateMetadata` siblings.
   - `generateStaticParams` is NOT async-params-affected — its return shape is unchanged.
   - Verify: `yarn build` succeeds with no "sync access to dynamic API" warnings in the build output.
   - Rollback: revert the offending files; re-run codemod with `--print` first to inspect.

5. **Audit `fetch()` caching defaults.**
   - Files: grep `src/` and (still-present) `notion-x/src/` for `fetch(` calls — most should be inside `@notionhq/client`, `notion-client`, or `open-graph-scraper` libraries (where it doesn't matter for us). Direct `fetch` calls in app code (e.g., the to-be-built `notionFetch` in Phase 2) should explicitly state cache intent: for build-time data fetched by `generateStaticParams` / pages, set `{ cache: 'force-cache' }` so behavior matches the old Next 14 default. For mutation-style calls (the `/api/search-notion` route during the transition), no change needed since static export will drop them.
   - Verify: `yarn build` cache-warm vs cache-cold builds show comparable durations (i.e., the build IS caching as expected).
   - Rollback: revert any fetch-option edits.

6. **Verify peer-dep compatibility for React 19.**
   - Approach: load `docs/research/next16-peer-warnings.md` from task 0.2. For each warning, confirm via the package's GitHub release notes / changelog whether React 19 is officially supported. Expected statuses (verify, do not trust this list — it's a starting point):
     - `@matejmazur/react-katex@3.1.3` — last released 2022, may complain about React 19 peer. Workaround: add `"@matejmazur/react-katex": "$1"` to `resolutions` in `package.json` (yarn 4 style) OR install `react-katex@3.0.1` as an alternative (drop-in compatible). Document choice.
     - `@giscus/react@3.x` — React 19 supported.
     - `@headlessui/react@2.x` — React 19 supported.
     - `@fisch0920/medium-zoom` — peer-agnostic.
     - `react-tooltip@5.x` — React 19 supported.
     - `react-syntax-highlighter@15.x` — React 19 compatible (with peer warning that can be suppressed).
     - `react-copy-to-clipboard@5.x` — React 19 compatible.
     - `react-fast-compare@3.x` — no React peer.
     - `react-image`, `react-lazy-images`, `react-snap-carousel`, `react-geopattern` — likely dead deps removable in Phase 7; if still used in Phase 0, verify or add resolutions.
   - Files: for any peer-dep we override, update `package.json` (`resolutions` for yarn 4) and write the rationale to `docs/research/next16-peer-overrides.md`.
   - Verify: `yarn install` finishes without peer-warning blockers; `yarn tsc --noEmit` passes; `yarn dev` starts; home + a single post render in dev.
   - Rollback: `git checkout package.json yarn.lock && yarn install`.

7. **Full `yarn build` + dev-preview smoke test.**
   - Commands: `yarn clean-build` (math2it has this script — `rimraf .next && yarn build`). Push to `dev`. Watch the existing Vercel preview deploy. Visit the preview URL.
   - Smoke checklist on the preview:
     - Home `/` renders, navbar, footer, hero section all visible.
     - 5 random posts under `/bai-viet/<slug>/` render with math, code, mermaid, images, callouts, Giscus.
     - List pages with pagination work.
     - Tag, category, author pages work.
     - Search (Ctrl+K, still pre-Pagefind) opens and returns results from `/api/search-notion`.
     - 404 page works for unknown slugs.
     - View source shows OG tags and the title populated.
   - Save the preview URL + checklist results to `docs/research/next16-preview-smoke-2026-05-19.md`.
   - Verify: every checklist row PASS. Build duration recorded for later baseline comparison (Phase 1 task 1.1 measures again after notion-x removal).
   - Rollback: revert Phase 0 commits on `dev`. The previous Vercel deploy stays live.
