# Phase 2: Internalize Notion data layer (`src/lib/notion`)

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

Goal: stand up a self-contained data layer under `src/lib/notion/` that **drops the `notion-client` npm package** but **keeps `notion-types` and `notion-utils`** and **keeps `@notionhq/client`**. The replacement for `notion-client`'s `NotionAPI` class is a small hand-rolled `fetch`-based helper that talks directly to Notion's unofficial web endpoints — ported from `/Users/thi/git/dinhanhthi.com/src/lib/notion/db.ts`.

At the end of this phase, `src/lib/notion/api.ts` exports the same function surface that the current `notion-x/src/lib/notionx.ts` + `notion-x/src/lib/db.ts` export (`getPage`, `getBlocks`, `getUnofficialDatabase`, `searchNotionPersonal`, etc.), so the existing notion-x components (to be vendored in Phase 3) can be re-pointed to it with a one-line import change. The rendering data shape is unchanged — still `ExtendedRecordMap` from `notion-types`.

## Progress

| Status  | Task                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| ✅ DONE | 2.1 Add `src/types/notion.ts` (re-export domain types from notion-x/interface.ts) |
| ✅ DONE | 2.2 Add `src/lib/notion/api.ts` — `notionFetch` + `loadPageChunk`/`syncRecordValuesMain` |
| ✅ DONE | 2.3 Add `getPage` + `getBlocks` with v3→v2 normalize and pending-blocks loop      |
| ✅ DONE | 2.4 Add `queryCollection` + `getUnofficialDatabase` + `searchNotionPersonal`      |
| ✅ DONE | 2.5 Add `src/lib/notion/db-official.ts` (official `@notionhq/client` queries)     |
| ✅ DONE | 2.6 Side-by-side parity test: new `getPage` vs `notion-client`'s `NotionAPI`      |

## Tasks

1. **Re-export domain types at `src/types/notion.ts`.**
   - Files: new `src/types/notion.ts`. Copy interfaces currently in `notion-x/src/interface.ts`: `Post`, `Category`, `Tag`, `Author`, `OptionalCatchAllParams`, `OptionalCatchAllProps`, `DynamicSegmentParamsProps`, `PostType`, `PostTypeOpts`. Re-export `Block`, `ExtendedRecordMap`, `PreviewImage`, `Decoration`, `CollectionInstance` from `notion-types` so the rest of the codebase imports them from one place.
   - Verify: `yarn tsc --noEmit` passes; `! grep -rn "from 'notion-types'" src/ scripts/` after Phase 4 ideally returns no matches outside `src/types/notion.ts` (centralized).
   - Rollback: `rm src/types/notion.ts`.

2. **`notionFetch` core + the two block endpoints in `src/lib/notion/api.ts`.**
   - Files: new `src/lib/notion/api.ts`. Port from `/Users/thi/git/dinhanhthi.com/src/lib/notion/db.ts`:
     - The `notionFetch<T>(endpoint, body)` helper. Reads `process.env.NOTION_API_WEB` (default `https://www.notion.so/api/v3`), `process.env.NOTION_TOKEN_V2`, `process.env.NOTION_ACTIVE_USER`. POSTs JSON, includes cookies via `headers: { Cookie: 'token_v2=…', 'x-notion-active-user-header': '…' }`. Throws with status + body on non-2xx so failures are loud.
     - `normalizeRecordMap(recordMap)` — the v3→v2 unwrap from dinhanhthi's file, ported verbatim with attribution comment.
     - Two thin endpoint wrappers: `loadPageChunk(pageId)` and `syncRecordValuesMain(blockIds)` (the latter replaces notion-client's `getBlocks`).
   - Verify: with `.env.local` populated, a one-shot script `npx tsx -r dotenv/config -e "import('./src/lib/notion/api.ts').then(m => m.loadPageChunk(process.env.ABOUT_PAGE!).then(r => console.log(Object.keys(r.recordMap.block).length)))"` prints a positive integer.
   - Rollback: `rm src/lib/notion/api.ts`.

3. **`getPage` + `getBlocks` with the pending-blocks loop.**
   - Files: extend `src/lib/notion/api.ts`. Port from dinhanhthi:
     - `getPageRaw(pageId)` — wraps `loadPageChunk` and normalizes.
     - `getBlocksByIds(blockIds)` — wraps `syncRecordValuesMain` and normalizes.
     - `getPage(pageId): Promise<ExtendedRecordMap>` — calls `getPageRaw`, then loops up to 10× calling `getBlocksByIds(pendingBlockIds)` (using `getPageContentBlockIds` from `notion-utils`) until no missing blocks remain. Wrap with `pMemoize` keyed on `pageId`. Return shape matches `notion-client`'s `getPage` so vendored renderer components don't notice the swap.
     - `getBlocks(blockIds): Promise<{ recordMap: { block } }>` — the public wrapper used by notion-x's `Mermaid.tsx` (lazy children fetch) — matches the old `NotionAPI#getBlocks` signature.
   - Verify: a one-shot fetches a known-large post, prints `Object.keys(recordMap.block).length` and `JSON.stringify(recordMap.block[someKnownBlockId]).slice(0, 80)`. Output must look like a valid notion v2 recordMap (entries shaped `{ value: { id, type, properties, … } }`).
   - Rollback: revert `src/lib/notion/api.ts` to the state from task 2.2.

4. **`queryCollection` + `getUnofficialDatabase` + `searchNotionPersonal`.**
   - Files: extend `src/lib/notion/api.ts`. Port from dinhanhthi where applicable, or write new based on notion-x source:
     - `queryCollection({ collectionId, collectionViewId, query, loader })` — POSTs to `${NOTION_API_WEB}/queryCollection`. Returns `{ recordMap: CollectionInstance, result }` normalized.
     - `getUnofficialDatabase(collectionId, collectionViewId)` — wraps `queryCollection` with default loader paging up to N rows; matches the signature the current `notion-x/src/lib/db.ts#getUnofficialDatabase` exports.
     - `searchNotionPersonal({ query, ancestorId })` — POSTs to `${NOTION_API_WEB}/search` with the same body shape notion-x sends; returns `{ results, recordMap }`. Used only by the OLD `/api/search-notion` route — once Pagefind lands in Phase 5, this can be deleted, but it stays during the transition so the old route keeps working.
   - Verify: a one-shot script calls `getUnofficialDatabase(process.env.AUTHOR_COLLECTION_ID!, process.env.AUTHOR_VIEW_ID!)` and prints the row count — must match the number of authors visible in the live site.
   - Rollback: revert `src/lib/notion/api.ts` to the state from task 2.3.

5. **Official-API queries in `src/lib/notion/db-official.ts`.**
   - Files: new `src/lib/notion/db-official.ts`. Move what `notion-x/src/lib/db.ts` does with `@notionhq/client`:
     - `notion` — singleton `new Client({ auth: process.env.NOTION_TOKEN })`.
     - `queryDatabase(databaseId, params)` — auto-paginates via `start_cursor`/`has_more`, `pMemoize`, exponential backoff on rate-limit / 5xx (max 5 retries).
     - `retrieveDatabase(databaseId)` — memoized.
   - Verify: `npx tsx -r dotenv/config -e "import('./src/lib/notion/db-official.ts').then(m => m.queryDatabase(process.env.NOTION_DB_POSTS!, {page_size: 1}).then(r => console.log(r.results.length)))"` prints `1`.
   - Rollback: `rm src/lib/notion/db-official.ts`.

6. **Parity test: new `getPage` vs `notion-client`'s `NotionAPI#getPage`.**
   - Files: new `scripts/parity-getpage.ts` (temporary; deleted at end of Phase 4). For 10 representative post IDs, fetch with BOTH the OLD `notionX.getPage(id)` (from `notion-x/src/lib/notionx.ts`) AND the NEW `getPage(id)` (from `src/lib/notion/api.ts`). Deep-compare `recordMap.block` keysets and a few sampled value fields (`type`, `properties.title`, `content`). Print "OK" or a list of differing block IDs and fields.
   - Output: print full report; also save to `docs/research/parity-getpage-2026-05-19.md`.
   - Verify: every post in the sample reports "OK" or only trivially differing fields (e.g., `last_edited_time` being a few ms different is fine — both sides hit the same Notion endpoint).
   - Rollback: `rm scripts/parity-getpage.ts`.
