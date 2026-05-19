# Phase 4: Swap page templates to the new renderer

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

Goal: with the components and data layer vendored (Phases 2-3), make sure every page consumer points at the new locations. Phase 3 task 6 did the bulk codemod; this phase double-checks `src/app/`, rewrites `src/app/lib/fetcher.ts`, and confirms a clean build.

At the end of this phase, NOTHING in `src/` imports from `notion-x/` paths OR from the `notion-client` npm package. `notion-types` and `notion-utils` imports remain — that's intentional.

## Progress

| Status  | Task                                                                              |
| ------- | --------------------------------------------------------------------------------- |
| ⬜ TODO | 4.1 Verify Phase 3's codemod hit every consumer; hand-fix stragglers              |
| ⬜ TODO | 4.2 Rewrite `src/app/lib/fetcher.ts` to use the new `src/lib/notion/` modules    |
| ⬜ TODO | 4.3 Update `SinglePostTemplate.tsx` import paths                                  |
| ⬜ TODO | 4.4 Update list templates + home + (single-page) routes                            |
| ⬜ TODO | 4.5 Compile-check: zero `notion-x/` paths and zero `notion-client` imports         |

## Tasks

1. **Verify the Phase 3 codemod hit every consumer; hand-fix stragglers.**
   - Files: `grep -rn 'notion-x/src' src/ scripts/` — fix each remaining line by hand. Common stragglers: dynamic `import()` paths (sed doesn't always catch them), JSDoc `@see` links, comments referencing `notion-x` (these can stay if they're informational — but no actual imports).
   - Also `grep -rn "from 'notion-client'" src/ scripts/` — must be zero (Phase 2 replaced all of these).
   - Verify: both greps return no matches. `yarn tsc --noEmit` passes.
   - Rollback: re-run Phase 3 task 6 codemod with refined patterns.

2. **Rewrite `src/app/lib/fetcher.ts` against the new modules.**
   - Files: edit `src/app/lib/fetcher.ts`. Replace:
     - `from '../../../notion-x/src/lib/db'` → `from '@/src/lib/notion/api'` (for `getUnofficialDatabase`, `searchNotionPersonal`) and `from '@/src/lib/notion/db-official'` (for `queryDatabase`, `retrieveDatabase`).
     - `from '../../../notion-x/src/lib/notionx'` (which exported `notionX` and `getPage`) → `from '@/src/lib/notion/api'` and rewrite call sites: `notionX.getPage(id)` → `getPage(id)`.
     - `from '../../../notion-x/src/interface'` → `from '@/src/types/notion'`.
   - Keep `transformNotionPostsData` and the rest of the file logic unchanged.
   - Verify: `yarn build` completes; manual smoke test of `/`, `/bai-viet/<known-slug>/`, `/chu-de/<known-tag>/`, `/tac-gia/<known-author>/`, `/chuyen-muc/<known-category>/`, `/tat-ca-bai-viet/`, `/tuyen-chon/` all render correctly.
   - Rollback: `git checkout src/app/lib/fetcher.ts`.

3. **Update `SinglePostTemplate.tsx` import paths.**
   - Files: edit `src/app/templates/SinglePostTemplate.tsx`. Rewrite imports from `notion-x/...` to `@/src/components/notion/...` and `@/src/lib/notion/...`. The data shape (an `ExtendedRecordMap` returned by `getPage`) is unchanged, so the JSX body shouldn't need edits — only the import block.
   - Verify: open 5 representative posts; confirm body, TOC, math, code, images, callouts, Giscus, and OG tags all render correctly.
   - Rollback: `git checkout src/app/templates/SinglePostTemplate.tsx`.

4. **Update list templates + home + (single-page) routes.**
   - Files: edit `src/app/templates/PageOfPostsListTemplate.tsx`, `src/app/page.tsx` (home), and the three `(single-page)` route pages (`gioi-thieu`, `huong-dan-viet-bai`, `viet-bai-tren-math2it`). Same exercise — only import paths change. Calls like `notionX.getPage(ABOUT_PAGE)` become `getPage(ABOUT_PAGE)` from `@/src/lib/notion/api`.
   - Verify: all five list/single-page routes render identically. Pagination still works on `/tat-ca-bai-viet/trang/2/`, `/chu-de/foo/trang/2/`, etc.
   - Rollback: `git checkout src/app/templates/PageOfPostsListTemplate.tsx src/app/page.tsx 'src/app/(single-page)/'`.

5. **Compile-check: zero `notion-x` paths and zero `notion-client` imports.**
   - Files: run:
     - `! grep -rn -E "from '(\.\./)+notion-x|@notion-x" src/ scripts/`
     - `! grep -rn -E "from 'notion-client'" src/ scripts/`
     - `! grep -rn -E "from 'react-notion-x'" src/ scripts/`
   - All three must exit 0. `notion-types` and `notion-utils` imports remain — those are EXPECTED and intentional. `yarn tsc --noEmit` + `yarn build` succeed.
   - Also remove the temporary parity script from Phase 2 task 6: `rm scripts/parity-getpage.ts`. And the `_debug` route from Phase 3 task 7: `rm -rf src/app/_debug/`.
   - Verify: build succeeds; the three greps return no matches.
   - Rollback: n/a — verification only. If a grep fails, finish the migration of the offending file.
