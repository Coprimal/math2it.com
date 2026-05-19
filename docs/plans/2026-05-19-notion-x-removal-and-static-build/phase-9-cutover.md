# Phase 9: Verification, cutover, and docs

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

Goal: confirm the rewritten site is visually + behaviorally indistinguishable from the current one, merge `dev` → `main`, watch the first production scheduled run, and document the new setup so future maintenance is obvious.

## Progress

| Status  | Task                                                                          |
| ------- | ----------------------------------------------------------------------------- |
| ⬜ TODO | 9.1 Functional checklist on `dev` preview (search, OG, sitemap, pagination)  |
| ⬜ TODO | 9.2 Visual diff — 10 representative posts side-by-side with current prod     |
| ⬜ TODO | 9.3 Merge `dev` → `main`, dispatch the workflow against `main`               |
| ⬜ TODO | 9.4 Post-cutover monitoring + write `docs/memory/` notes for future sessions |

## Tasks

1. **Functional checklist on `dev` preview URL.**
   - Files: write `docs/research/cutover-checklist-2026-05-19.md` with one row per check, marked PASS/FAIL:
     - Home `/` renders, hero section + categories visible.
     - 5 random posts under `/bai-viet/<slug>/` render with: title, cover image, body (paragraphs, headings, lists), math (both inline + block), at least one code block + at least one mermaid block, callouts, images with zoom, TOC, related posts.
     - `/tat-ca-bai-viet/` and `/tat-ca-bai-viet/trang/2/` render and paginate.
     - `/chu-de/<known-tag>/` + pagination work.
     - `/chuyen-muc/<known-category>/` + pagination work.
     - `/tac-gia/<known-author>/` + pagination work.
     - `/tuyen-chon/` works.
     - Each `(single-page)` route renders.
     - Ctrl+K opens search; typing a known title returns the matching post.
     - View source: OG tags, title, canonical, JSON-LD all populated.
     - `/sitemap.xml` (or whatever `next-sitemap` outputs) contains every prerendered URL.
     - 404 on an unknown slug returns `not-found.tsx` (proves `dynamicParams = false` works).
     - Giscus comments load on a single post.
     - Mobile breakpoint at 375px and 768px both look correct.
   - Verify: every row PASS.
   - Rollback: keep iterating on `dev` until every row passes. Do NOT proceed to task 9.3 until this is clean.

2. **Visual diff against current prod.**
   - Files: pick 10 representative posts (different categories, mix of math-heavy, code-heavy, image-heavy). For each: screenshot the current live prod URL + the `dev` preview URL at 1280px width; diff them with a tool like `pixelmatch` (or eyeball — explicitly document which). Save image pairs + a one-line PASS/FAIL note to `docs/research/visual-diff-2026-05-19/`.
   - Verify: zero structural diffs. Minor font-rendering differences caused by environment are acceptable; spacing, color, layout shifts are NOT.
   - Rollback: fix the renderer; re-deploy `dev`; re-diff.

3. **Merge `dev` → `main` and trigger production workflow.**
   - Commands:
     - `git checkout main && git pull && git merge --no-ff dev` (or open a PR if the repo workflow uses PRs).
     - Push `main`. The workflow auto-triggers via the push.
     - In parallel: in the Vercel UI, confirm the "Ignored Build Step" is still `exit 0` on the production environment.
   - Verify: the workflow completes; `vercel deploy --prebuilt --prod` prints the production URL; visiting `https://math2it.com/` shows the new build. Run the home-page + 1 single-post smoke test live in prod.
   - Rollback: `git revert -m 1 <merge-commit-sha>` on `main`; the next push re-triggers the workflow which redeploys the pre-refactor build. If urgency is high, re-enable Vercel auto-build in the UI as a safety net while the revert is in flight.

4. **Post-cutover monitoring + memory notes.**
   - Files:
     - Watch the next scheduled cron firing (≤ 5 days after cutover). Confirm it completes cleanly and content updates land. Note any flakiness in `docs/research/post-cutover-2026-05-19.md`.
     - Write three memory files for future sessions:
       - `docs/memory/infrastructure/build-pipeline.md` — "math2it builds in GitHub Actions; Vercel only serves prebuilt output. Workflow at `.github/workflows/deploy-vercel.yml`. Cron is `0 0 */5 * *`. Vercel auto-build is disabled via the project's 'Ignored Build Step' setting (`exit 0`). To manually trigger a rebuild: `gh workflow run deploy-vercel.yml --ref main`. Required GitHub secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID. All Notion env vars live in Vercel project settings, NOT GitHub secrets — `vercel pull` fetches them at build time."
       - `docs/memory/conventions/notion-rendering.md` — "Notion content is rendered by the vendored `src/components/notion/PostBody.tsx` + `src/lib/notion/renderer.tsx`, consuming an `ExtendedRecordMap` (from `notion-types`) fetched via `src/lib/notion/api.ts#getPage`. `api.ts` calls Notion's unofficial web endpoints (`loadPageChunk`, `syncRecordValuesMain`, `queryCollection`) directly via `fetch` — there is intentionally no `notion-client` dep. `notion-types` and `notion-utils` ARE deps (same pattern as dinhanhthi.com). Official-API database queries live in `src/lib/notion/db-official.ts` using `@notionhq/client`. If a new Notion block type appears, add a case to `renderer.tsx`'s switch and a component under `src/components/notion/`. Do NOT reintroduce `notion-client` or any `react-notion-x` fork."
       - `docs/memory/decisions/static-build-cutover.md` — "On 2026-05-19, math2it migrated from Vercel-built ISR (`revalidate = 20`) to GitHub-Actions-built prerendered + `vercel deploy --prebuilt`, modeled on dinhanhthi.com. The chief motivations were: removing the `notion-x` submodule (high-maintenance fork of react-notion-x), gaining reproducible builds (Vercel's build env was opaque), and predictable rebuild cadence (every 5 days). We chose standard Next.js prerendering over `output: 'export'` to keep Next Image optimization functional via Vercel's serverless image endpoint."
   - Also append a top-level entry to `MEMORY.md` for each.
   - Verify: each memory file is parseable, the index links resolve.
   - Rollback: n/a — documentation only.
