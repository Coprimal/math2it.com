# Phase 1: Baseline & block-type audit

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

Goal: lock in a known-good build, inventory the exact surface area we're refactoring, and confirm the renderer can be rewritten against the official Notion API.

## Progress

| Status  | Task                                                              |
| ------- | ----------------------------------------------------------------- |
| ✅ DONE | 1.1 Confirm working build on `dev` branch (baseline)              |
| ✅ DONE | 1.2 Inventory routes, `revalidate` values, notion-x imports        |
| ✅ DONE | 1.3 Block-type audit script over `NOTION_DB_POSTS`                |
| ✅ DONE | 1.4 Map every notion-x import to its planned replacement file     |

## Tasks

1. **Confirm working build on `dev` branch (baseline).**
   - Files: none (run-only). Use existing `.env.local` (Notion tokens must be set).
   - Commands: `git checkout dev`, `yarn install`, `yarn build`.
   - Verify: build completes; record total duration (wall clock), the page count from Next's build summary ("(Static)" + "(SSG)"), and the resulting `.next/` directory size. Save numbers to `docs/research/baseline-2026-05-19.md`.
   - Rollback: n/a — measurement only.

2. **Inventory current routes and dependency surface.**
   - Files: write a new file `docs/research/inventory-2026-05-19.md` containing:
     - Every page file under `src/app/` with its current `export const revalidate = …` value (or "static" if none).
     - Every file in `src/app/` that uses `generateStaticParams` and the function body shape (what it iterates).
     - Every `import … from '@notion-x/…'` and every `import … from '../../notion-x/…'` line in `src/`, grouped by file.
     - Every `import … from 'notion-client' | 'notion-types' | 'notion-utils' | 'react-notion-x'`.
   - Verify: file exists; the count of `notion-x` imports matches the count from `grep -r notion-x src/ | wc -l`.
   - Rollback: `rm docs/research/inventory-2026-05-19.md`.

3. **Confirm notion-x renderer covers all block types used in posts.**
   - Approach: since we are NOT rewriting the renderer (we're vendoring it), the audit is much simpler — we only need to confirm the existing notion-x switch-case handles every block type math2it's posts contain. Use the unofficial API path that notion-x already uses.
   - Files: new `scripts/audit-block-types.ts`. Calls the **already-working** `notion-x/src/lib/notionx.ts#getPage(pageId)` for ~30 representative posts (sampled across categories), traverses the returned `recordMap.block`, accumulates a `Map<blockType, count>`. Crosschecks the set against the list of `case '<type>':` arms in `notion-x/src/components/PostBody.tsx` (and its sub-renderers). Any block type used in posts but missing a case is the only thing to fix in Phase 3.
   - Output: console table + `docs/research/block-types-2026-05-19.md` with two lists: "covered by current notion-x renderer" and "missing — needs a case added during vendoring".
   - Commands: add a one-shot `audit-blocks` script entry; `npx tsx -r dotenv/config scripts/audit-block-types.ts dotenv_config_path=.env.local`.
   - Verify: script completes; "missing" list is either empty or a short list of low-impact types (synced_block, child_database) we explicitly accept rendering as a placeholder.
   - Rollback: `rm scripts/audit-block-types.ts docs/research/block-types-2026-05-19.md`; remove the script entry from `package.json`.

4. **Map every notion-x import to its post-vendor location.**
   - Files: write `docs/research/notionx-replacement-map.md` as a table: `Current import` | `Used in (math2it files)` | `New target path` | `Notes`. Targets:
     - `notion-x/src/components/*` → `src/components/notion/*` (verbatim move with rewritten import paths).
     - `notion-x/src/lib/notionx.ts` (which wraps `NotionAPI` from `notion-client`) → `src/lib/notion/api.ts` (new file, hand-rolled `fetch` to `loadPageChunk`/`syncRecordValuesMain`/`queryCollection`/`search`). The exported function names (`getPage`, `getBlocks`, `searchNotionPersonal`, `getUnofficialDatabase`) stay the same so callers don't need to change beyond the import path.
     - `notion-x/src/lib/db.ts` → split: official-API parts (`queryDatabase`, `retrieveDatabase`) stay using `@notionhq/client` → `src/lib/notion/db-official.ts`; unofficial parts (`getUnofficialDatabase`, `searchNotionPersonal`) move into `src/lib/notion/api.ts`.
     - `notion-x/src/lib/{helpers,context,renderer,next,utils,map-image-url,map-page-url}.ts` → `src/lib/notion/<same-name>.ts`.
     - `notion-x/src/style/notion-x.scss` → `src/app/styles/notion.scss`, imported from `src/app/layout.tsx`.
     - `notion-x/src/icons/*` → `src/components/icons/*` (only ones actually imported — drop the rest).
     - `notion-x/src/interface.ts`, `notion-x/src/types.ts` → `src/types/notion.ts`.
     - `notion-x/src/post-types/*` → `src/components/notion/post-types/*`.
     - `SearchModal` → drop (replaced by Pagefind in Phase 5).
   - Verify: every notion-x import from inventory task 1.2 has a corresponding row in this map.
   - Rollback: `rm docs/research/notionx-replacement-map.md`.
