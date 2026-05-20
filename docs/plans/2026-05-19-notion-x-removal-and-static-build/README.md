---
auto: true
---

# Plan: Remove `notion-x` submodule and switch to GitHub-Actions-built static site

**Mode:** hard
**Created:** 2026-05-19
**Status:** IN PROGRESS

## Overview

Three things in one project, sequenced for bisectability:

1. **Phase 0 — Framework upgrade.** Bump **Next 14.2 → Next 16**, **React 18 → React 19**, **ESLint 8 → 9** while the existing notion-x stack is still in place. Standalone PR so any framework regression is bisectable separately.
2. **Phases 1-7 — Notion-x removal.** Eliminate the `notion-x` git submodule and the `notion-client` npm package by **vendoring** the renderer + block components from `notion-x` directly into `src/`, and **replacing** `notion-client` with a small in-repo unofficial-Notion-API `fetch` helper (lifted from dinhanhthi's `src/lib/notion/db.ts`). **Keep** `notion-types` and `notion-utils` — the rendering data shape (`ExtendedRecordMap`, `Block`) does not change.
3. **Phases 8-9 — Static-build deploy.** Switch deployment from Vercel-built ISR (`revalidate = 20`) to fully prerendered pages built by GitHub Actions and shipped prebuilt to Vercel (`vercel pull` → `vercel build` → `vercel deploy --prebuilt`), refreshed every 5 days via cron. Same deployment mechanism as [/Users/thi/git/dinhanhthi.com](/Users/thi/git/dinhanhthi.com) — math2it's existing visual style preserved verbatim.

## Not Building

- **No** Pages Router. App Router only (math2it is already there).
- No design/style changes. `src/app/globals.scss`, the Tailwind palette and animations in `tailwind.config.ts`, post-card layout, navbar, and footer markup remain pixel-identical.
- No CMS or host swap — Notion + Vercel are kept.
- No new content features. Pure deploy + dependency refactor.
- No Notion content migration. Existing Notion pages are not modified.
- **No rewrite of the renderer against `BlockObjectResponse[]`** — dinhanhthi did NOT do that; they kept the `ExtendedRecordMap` shape and just hand-rolled the unofficial-API fetch in place of `notion-client`. We do the same.
- `@notionhq/client`, **`notion-types`**, **`notion-utils`**, `katex`, `@matejmazur/react-katex`, `mermaid`, `prismjs`, `react-syntax-highlighter`, `@giscus/react`, `sharp`, `next-sitemap` are all kept.

## Approach

Mirror dinhanhthi.com's mechanism *but not its style*:

1. **Vendor** the notion-x renderer + block components into `src/components/notion/` essentially as-is. The data shape (`ExtendedRecordMap`, `Block`, `Decoration`) stays the same — `notion-types` and `notion-utils` remain dependencies. Only import paths change.
2. **Replace `notion-client`** with a new `src/lib/notion/api.ts` that calls Notion's unofficial web API directly via `fetch` — `loadPageChunk`, `syncRecordValuesMain`, `queryCollection`, `search`. Port the `normalizeRecordMap` v3→v2 normalizer and the iterative pending-blocks loop from dinhanhthi's `src/lib/notion/db.ts`. No `NotionAPI` class import; no `notion-client` dep.
3. Use **standard Next.js prerendering** with `generateStaticParams` + `export const dynamicParams = false`, NOT `output: 'export'`. Matches dinhanhthi exactly. Keeps Next Image optimization, keeps the option of edge functions, keeps Vercel's CDN behavior.
4. Build & deploy from GitHub Actions: `vercel pull` → `vercel build` → `vercel deploy --prebuilt`. Cron `0 0 */5 * *`. Vercel's own build is suppressed by setting "Ignored Build Step" to `exit 0` in the project's git settings.
5. Search: drop `/api/search-notion`, replace with **Pagefind**. `postbuild` runs `pagefind --site .next --output-path public/pagefind`. New `NavSearch` mounts `pagefind.js` dynamically and matches the existing modal look.

### Attack angles (hard mode)

| Angle              | Outcome                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency failure | Notion API outage during a scheduled build → previous Vercel deployment stays live (Vercel keeps the last good deployment when `vercel deploy` fails). Build retries on next cron or `workflow_dispatch`.                                                                                                                                                                                                                                     |
| Scale explosion    | At 10× current post count, bottleneck is per-post `blocks.children.list` during `generateStaticParams`. Mitigations: per-block memoization with `p-memoize` (already a dep), bounded-concurrency block fetcher, `.next/cache` GH-cache layer, and `staticPageGenerationTimeout: 600` (copied from dinhanhthi). If still over GH's 45-min budget, fan out the build into per-section workflows or move `dynamicParams: true` for the long tail. |
| Rollback cost      | All work happens on `dev`. `main` keeps the old SSR/ISR Vercel deploy as long as Phases 7-8 haven't merged. Phase 7 (submodule removal) and Phase 8-task-3 (disable Vercel auto-build) are points of no return for `dev` but `main` is still revertable via `git revert` of the dev → main merge until Phase 8 lands there.                                                                                                                   |
| Premise collapse   | Most fragile assumption: Notion's unofficial endpoints (`loadPageChunk`, `syncRecordValuesMain`, `queryCollection`) remain stable. They are undocumented; Notion has changed the recordMap format from v2 → v3 in the past (dinhanhthi's `normalizeRecordMap` handles this). Phase 2 ports that normalizer and adds defensive logging. If Notion breaks the API again, the breakage surface is now a small file we own — fixable in hours.                                                                                                                                                                                                                                |

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

## Progress

| Status  | Phase                                                            | File                                                         | Tasks   |
| ------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ------- |
| ✅ DONE | Phase 0: Framework upgrade (Next 14 → 16, React 18 → 19)         | [phase-0-framework-upgrade.md](./phase-0-framework-upgrade.md) | 7 tasks |
| ✅ DONE | Phase 1: Baseline & block-type audit                             | [phase-1-baseline.md](./phase-1-baseline.md)                 | 4 tasks |
| ✅ DONE | Phase 2: Internalize Notion data layer (`src/lib/notion`)        | [phase-2-data-layer.md](./phase-2-data-layer.md)             | 6 tasks |
| ✅ DONE | Phase 3: Block renderer & components (`src/components/notion`)    | [phase-3-renderer.md](./phase-3-renderer.md)                 | 7 tasks |
| ✅ DONE | Phase 4: Swap page templates to new renderer                     | [phase-4-templates.md](./phase-4-templates.md)               | 5 tasks |
| ✅ DONE | Phase 5: Search via Pagefind                                     | [phase-5-search.md](./phase-5-search.md)                     | 3 tasks |
| ✅ DONE | Phase 6: Static config (remove ISR, tailwind/next.config cleanup) | [phase-6-static-config.md](./phase-6-static-config.md)       | 4 tasks |
| 🔄 IN PROGRESS | Phase 7: Remove `notion-x` submodule + drop deps                 | [phase-7-remove-submodule.md](./phase-7-remove-submodule.md) | 3 tasks |
| ⬜ TODO | Phase 8: GitHub Actions workflow + Vercel project settings       | [phase-8-github-actions.md](./phase-8-github-actions.md)     | 4 tasks |
| ⬜ TODO | Phase 9: Verification, cutover, and docs                         | [phase-9-cutover.md](./phase-9-cutover.md)                   | 4 tasks |

## Assumptions

- **Standard Next.js prerendering** is the target, not `output: 'export'`. Basis: dinhanhthi's `.github/workflows/deploy-vercel.yml` uses `vercel build` + `vercel deploy --prebuilt` and `next.config.mjs` has no `output: 'export'`.
- **Vercel project already exists** for math2it (or will be created once via `vercel link`). `vercel pull` requires `.vercel/project.json`. Basis: existing site already deploys to Vercel.
- **`notion-types` and `notion-utils` stay as deps.** dinhanhthi.com's `package.json` keeps them; verified by grepping `src/` for `from 'notion-types'` and `from 'notion-utils'`. They are used pervasively for type-safety (`Block`, `ExtendedRecordMap`, `PreviewImage`, `Decoration`) and helpers (`parsePageId`, `getBlockTitle`, `getPageContentBlockIds`, `getPageTableOfContents`, `formatDate`, `normalizeUrl`, `uuidToId`).
- **Only `notion-client` is removed.** Its `NotionAPI` class is replaced by a hand-rolled `fetch`-based helper inside `src/lib/notion/api.ts` calling `https://www.notion.so/api/v3/{loadPageChunk,syncRecordValuesMain,queryCollection,search}`. Logic is ported verbatim from `/Users/thi/git/dinhanhthi.com/src/lib/notion/db.ts`.
- **The rendering data shape does NOT change.** Pages are still rendered from `ExtendedRecordMap` / `Block` (notion-types). The existing notion-x renderer can be vendored into `src/components/notion/` essentially as-is — only import paths are rewritten.
- **Yarn 4 stays** — no migration to pnpm. The dinhanhthi GH workflow uses pnpm, but the pattern (cache + `--frozen-lockfile` + global Vercel CLI) ports cleanly. Basis: `packageManager: yarn@4.1.1` in `package.json`.
- **Framework: Next 14 → Next 16, React 18 → React 19, ESLint 8 → 9** in Phase 0, BEFORE any notion-x work. Done as its own PR so a framework regression is bisectable separately from the renderer vendoring. The static-build mechanism does not strictly require Next 16 (dinhanhthi runs Next 15.5), but going to 16 is a single step from where we land.
- **Node 20 → Node 22** if Next 16 requires it (decided in Phase 0 task 0.2). If so, `engines.node` in `package.json` AND the GH Actions `node-version` in Phase 8 task 1 both bump.
- **Authors via the unofficial collection API.** `getUnofficialDatabase(AUTHOR_COLLECTION_ID)` currently goes through `notion-client`. After the refactor it goes through the new `queryCollection` helper in `src/lib/notion/api.ts` — same endpoint, no package dep.
- **Personal search** (`searchNotionPersonal`) is no longer needed — Pagefind replaces it.
- **Notion env vars** can move to (or already live in) the Vercel project's Environment Variables (production + preview), accessed at build time via `vercel pull`. Basis: dinhanhthi pattern.

## Risks

- **R1 — Notion unofficial API drift.** Notion has changed the recordMap shape (v2 → v3) before. Mitigation: port dinhanhthi's `normalizeRecordMap` v3→v2 normalizer (already battle-tested in production there). Add explicit version logging so a future drift is loud, not silent.
- **R2 — Visual regression from vendoring.** Even though we move components mostly as-is, broken import paths or accidental Tailwind class purging can cause subtle diffs. Mitigation: side-by-side screenshot diff of the top 10 most-trafficked posts before merging to `main` (Phase 9 task 2).
- **R3 — Build-time blow-up.** Re-fetching every page from Notion every 5 days could exceed GH Actions' 45-min budget. Mitigation: `p-memoize`, bounded-concurrency block fetcher, `.next/cache` GH-cache layer, `staticPageGenerationTimeout: 600`.
- **R4 — Image optimization on static pages.** We are NOT using `output: 'export'`, so Next Image's on-demand optimizer keeps working via the standard Vercel serverless image endpoint. No change needed. Verified in Phase 6 task 3.
- **R5 — Vercel still tries to build.** Without disabling Vercel's auto-build, every push triggers BOTH the GH workflow AND a Vercel build, racing. Mitigation: Phase 8 task 3 sets "Ignored Build Step" to `exit 0` in Vercel project settings.
- **R6 — Search index size.** Pagefind crawls `.next/` after prerendering; large Notion HTML can grow the index. Mitigation: tag nav/footer with `data-pagefind-ignore` and exclude irrelevant route prefixes.
- **R7 — Sharp on the GH runner.** sharp's prebuilds may need `yarn rebuild sharp` after install on Ubuntu. Mitigation: explicit step in Phase 8 task 1.
- **R8 — Auth tokens for unofficial API.** `loadPageChunk` requires `NOTION_TOKEN_V2` + `NOTION_ACTIVE_USER` cookies in the `fetch` headers (math2it already has these env vars). They periodically expire. Mitigation: document the refresh procedure in Phase 9 memory notes; surface 401s loudly in the new `notionFetch` wrapper.
- **R9 — React 19 peer-dep churn.** `@matejmazur/react-katex` was last released in 2022 and may emit a peer warning under React 19 (it likely still works — KaTeX is a thin wrapper). Mitigation: Phase 0 task 0.6 explicitly verifies each React-touching dep; resolutions added where needed; document overrides in `docs/research/next16-peer-overrides.md`. If react-katex truly breaks, fall back to `react-katex@3.0.1` (drop-in compatible) or render KaTeX manually via `renderToString`.
- **R10 — Next 16 async dynamic APIs.** Every dynamic route (`[slug]`, `[[...slug]]`) and any `cookies()`/`headers()` use must switch to `await params` / `await searchParams`. Mitigation: Phase 0 task 0.3 runs the official `@next/codemod` first; task 0.4 hand-fixes remaining call sites; build warnings surface anything missed.
- **R11 — Fetch caching default flip.** Next 15+ no longer caches `fetch()` by default. Mitigation: Phase 0 task 0.5 audits direct `fetch` calls; explicit `{ cache: 'force-cache' }` added where build-time caching is required. Most calls in math2it go through `notion-client` / `@notionhq/client` which don't use `fetch` directly with Next's wrapper.

## Migration & Rollback (hard mode)

**Overall rollback strategy.** All work happens on the `dev` branch. `main` keeps the old SSR/ISR Vercel deploy until Phases 7-8 merge upward. Phase 7 (submodule removal) and Phase 8 task 3 (disable Vercel auto-build) are the points of no return for `dev`. Until both have merged to `main`, `main` can be reverted via `git revert` of the dev → main merge commit; Vercel's previous successful deployment stays live during the revert.

**Point of no return (production).** Phase 8 task 3 on `main` — once Vercel auto-build is disabled in the Vercel project, the GH Actions workflow MUST be running on `main`. Re-enabling Vercel's auto-build in the UI takes 30 seconds, so the practical blast radius is small, but document the rollback step in Phase 9 task 4.

**Incremental deployment.**
1. **Phase 0 first, as its own PR.** Merge to `dev`, watch the Vercel preview, then merge `dev` → `main` and watch production. This isolates any Next 16 / React 19 regression from the notion-x work that follows.
2. Phases 1-6 are reversible local changes on `dev`. Verify against the `dev` Vercel preview after each phase.
3. Phase 7 (submodule + `notion-client` removal) lands a real breaking change on `dev`. Verify the `dev` preview still deploys.
4. Phase 8 (workflow + Vercel project settings) is added on `dev`. Trigger via `workflow_dispatch` against `dev`; confirm preview deploy succeeds; only then merge `dev` → `main`.
5. After the merge, Phase 9 verifies production. If a regression appears, `git revert` the merge commit AND re-enable Vercel's auto-build in the UI; Vercel's previous successful deployment stays live in the meantime.

## Next Steps

After implementation: `/cf-review` → `/cf-commit`
