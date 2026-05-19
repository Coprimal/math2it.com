# Phase 3: Vendor the notion-x renderer & components into `src/`

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

Goal: physically move the renderer + block components currently under `notion-x/src/` into `src/components/notion/` and `src/lib/notion/`, **without rewriting them against a different data shape**. The data shape (`ExtendedRecordMap`, `Block`) is unchanged — `notion-types` and `notion-utils` stay as deps. The only edits are:

- Update import paths (`'@notion-x/...'` / `'../../notion-x/...'` → relative paths within `src/`).
- Replace any `import { NotionAPI } from 'notion-client'` / `import notionX from '...'` with the new `src/lib/notion/api.ts` from Phase 2.
- Replace any `import … from 'notion-x/src/lib/db'` with `src/lib/notion/api.ts` (for unofficial calls) or `src/lib/notion/db-official.ts` (for official calls).

The `notion-x/` directory remains on disk during this phase as a reference; it's deleted in Phase 7 once nothing imports from it.

## Progress

| Status  | Task                                                                                       |
| ------- | ------------------------------------------------------------------------------------------ |
| ⬜ TODO | 3.1 Vendor `notion-x/src/lib/{helpers,context,renderer,next,utils,map-*}.ts` → `src/lib/notion/` |
| ⬜ TODO | 3.2 Vendor `notion-x/src/style/notion-x.scss` → `src/app/styles/notion.scss`               |
| ⬜ TODO | 3.3 Vendor `notion-x/src/components/*` → `src/components/notion/*`                          |
| ⬜ TODO | 3.4 Vendor `notion-x/src/post-types/*` → `src/components/notion/post-types/*`              |
| ⬜ TODO | 3.5 Vendor `notion-x/src/icons/*` (only used ones) → `src/components/icons/*`              |
| ⬜ TODO | 3.6 Sweep import paths in all vendored files; remove `notion-client` references            |
| ⬜ TODO | 3.7 Compile + smoke test of vendored renderer in a `_debug` route                          |

Process per task: `git mv` (preserves git blame) wherever possible, then mass-rewrite imports with a small sed/codemod script. Do NOT manually rewrite component bodies — the goal is a 1:1 vendor with import-path edits only.

## Tasks

1. **Vendor the `lib/` files.**
   - Files / moves:
     - `notion-x/src/lib/helpers.ts` → `src/lib/notion/helpers.ts`
     - `notion-x/src/lib/context.tsx` → `src/lib/notion/context.tsx`
     - `notion-x/src/lib/renderer.tsx` → `src/lib/notion/renderer.tsx`
     - `notion-x/src/lib/next.tsx` → `src/lib/notion/next.tsx`
     - `notion-x/src/lib/utils.ts` → `src/lib/notion/utils.ts`
     - `notion-x/src/lib/map-image-url.ts` → `src/lib/notion/map-image-url.ts`
     - `notion-x/src/lib/map-page-url.ts` → `src/lib/notion/map-page-url.ts`
     - **Do NOT** move `notion-x/src/lib/notionx.ts` — its function surface is already replaced by Phase 2's `src/lib/notion/api.ts`. Any caller of `notionX.getPage(...)` should switch to `getPage(...)` from `src/lib/notion/api.ts` (handled in task 3.6).
     - **Do NOT** move `notion-x/src/lib/db.ts` — split per Phase 2 task 4 + 5.
   - Inside the moved files, rewrite imports: `'./helpers'`, `'./context'`, etc. stay; cross-file references like `'./notionx'` become `'./api'`; `'./db'` becomes `'./db-official'` or `'./api'` as appropriate. Keep all `'notion-types'` and `'notion-utils'` imports intact.
   - Verify: `yarn tsc --noEmit` passes once the destination directories have valid relative imports. `! grep -rn "from 'notion-client'" src/lib/notion/` returns no matches.
   - Rollback: `git checkout -- 'notion-x/' 'src/lib/notion/'`.

2. **Vendor the stylesheet.**
   - Files: `notion-x/src/style/notion-x.scss` → `src/app/styles/notion.scss`. Update `src/app/layout.tsx` import to `import '@/src/app/styles/notion.scss'` (or whichever import alias math2it uses; check `tsconfig.json` paths).
   - Verify: `yarn build` succeeds; visual smoke test on home + a single post shows the same styling as before.
   - Rollback: revert the move and the layout import.

3. **Vendor block components.**
   - Files: every file under `notion-x/src/components/*.tsx` → `src/components/notion/<same-name>.tsx`. The list per the Phase 1 inventory includes (non-exhaustive): `PostBody.tsx`, `PostToc.tsx`, `PostsList.tsx`, `Pagination.tsx`, `SkeletonPostList.tsx`, `PostHeaderTopics.tsx`, `BlockEquation.tsx`, `BlockInlineEquation.tsx`, `Mermaid.tsx`, `ImageComponent.tsx`, `SimpleImage.tsx`, plus all the smaller block-type components and image-placeholders.
   - DO NOT touch the JSX/TSX bodies. Only rewrite imports:
     - `from '../lib/...'` → `from '../../lib/notion/...'`
     - `from '../icons/...'` → `from '../icons/...'` (icons get moved in task 3.5 — once both moves are done, paths resolve)
     - `from '../interface'` → `from '../../types/notion'`
     - Anything importing `notion-client` directly (e.g., from inside `Mermaid.tsx` to lazy-load child blocks): replace with the matching function from `src/lib/notion/api.ts`.
   - Verify: `yarn tsc --noEmit` passes; `! grep -rn "from 'notion-client'" src/components/notion/` returns no matches.
   - Rollback: revert the moves.

4. **Vendor `post-types/`.**
   - Files: every file under `notion-x/src/post-types/*` → `src/components/notion/post-types/<same-name>.tsx`. Same import-rewrite rules as task 3.3.
   - Verify: `yarn tsc --noEmit` passes.
   - Rollback: revert the moves.

5. **Vendor used icons.**
   - Approach: do NOT move every file under `notion-x/src/icons/` — only the ones actually imported from `src/` (per Phase 1 inventory). Each icon is a tiny SVG React component; copying only what we use trims dead code.
   - Files: for each icon imported in `src/` (e.g., `FiSearch`, `TbExternalLink`, and any in the vendored components from tasks 3.3 + 3.4), copy `notion-x/src/icons/<Icon>.tsx` → `src/components/icons/<Icon>.tsx`. Re-export from a barrel `src/components/icons/index.ts` if convenient.
   - Verify: `yarn tsc --noEmit` passes; the navbar search icon and other icons render visually unchanged.
   - Rollback: revert the moves.

6. **Sweep import paths across `src/`.**
   - Files: edit every file under `src/` that still imports from `notion-x` paths (per Phase 1 inventory):
     - `from '../../notion-x/src/lib/notionx'` / `from '@notion-x/...notionx'` → `from '@/src/lib/notion/api'`
     - `from '../../notion-x/src/lib/db'` → `from '@/src/lib/notion/api'` or `'@/src/lib/notion/db-official'` based on what's used
     - `from '../../notion-x/src/lib/helpers'` → `from '@/src/lib/notion/helpers'`
     - `from '../../notion-x/src/components/<X>'` → `from '@/src/components/notion/<X>'`
     - `from '../../notion-x/src/interface'` → `from '@/src/types/notion'`
   - Best done with a small one-shot codemod: `grep -rl 'notion-x/src' src/ | xargs sed -i.bak -E 's|\.\./\.\./notion-x/src/lib/notionx|@/src/lib/notion/api|g; s|\.\./\.\./notion-x/src/lib/db|@/src/lib/notion/api|g; s|\.\./\.\./notion-x/src/lib/helpers|@/src/lib/notion/helpers|g; s|\.\./\.\./notion-x/src/interface|@/src/types/notion|g; s|\.\./\.\./notion-x/src/components/|@/src/components/notion/|g'` (verify path aliases first; adjust if math2it uses `~/` or no alias).
   - Hand-edit the few files where the substitution didn't cleanly resolve (e.g., the api.ts split where some callers need `db-official` instead of `api`).
   - Verify: `! grep -rn 'notion-x/src' src/ scripts/` returns no matches.
   - Rollback: restore `.bak` files; `find src/ -name '*.bak' -delete` only after success.

7. **Compile + smoke test via a temporary `_debug` route.**
   - Files: temporary `src/app/_debug/notion/page.tsx` (excluded from sitemap, deleted at the end of Phase 4) that renders `<NotionRenderer recordMap={await getPage('<known-page-id>')} />` from the vendored components.
   - Verify: `yarn build` succeeds; `yarn start`; visit `/_debug/notion/`; a representative post renders with math, code, mermaid, images, callouts, toc — visually identical to the live site.
   - Rollback: `rm -rf src/app/_debug/`.
