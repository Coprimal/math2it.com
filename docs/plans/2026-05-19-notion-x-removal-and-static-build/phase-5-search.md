# Phase 5: Search via Pagefind

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

Goal: replace the runtime `/api/search-notion` route + notion-x's `SearchModal` with **Pagefind**. After `next build`, a `postbuild` script crawls `.next/` to produce a static index served from `/pagefind/`. The new `<NavSearch/>` dynamically imports `pagefind.js` on-demand.

## Progress

| Status  | Task                                                                |
| ------- | ------------------------------------------------------------------- |
| ✅ DONE | 5.1 Add `pagefind` dev dep + `postbuild` script + exclusions         |
| ✅ DONE | 5.2 Implement new `<NavSearch/>` consuming `pagefind.js`            |
| ✅ DONE | 5.3 Delete `src/app/api/search-notion/` and old `SearchModal` usage |

## Tasks

1. **Add Pagefind and the postbuild hook.**
   - Files:
     - Edit `package.json`: add `"pagefind": "^1.5.0"` to `devDependencies`. Add script `"postbuild": "next-sitemap && npx pagefind --site .next --output-path public/pagefind"` (math2it already runs `next-sitemap` in postbuild — keep that, chain Pagefind after).
     - Edit `src/app/layout.tsx` (or whichever component renders the navbar/footer): add `data-pagefind-ignore` to elements that should not appear in search results (navbar, footer, related-posts sidebar, comments section). For pages that should NOT be indexed at all (e.g., `(single-page)/viet-bai-tren-math2it/`), add `data-pagefind-ignore="all"` on the root `<main>` of that route.
     - Optionally create `public/pagefind/pagefind.config.json` with `glob` excludes for `_next/` static asset HTML if any leak in.
   - Verify: `yarn build` produces `public/pagefind/pagefind.js` and a `fragment/`, `index/` directory. Total index size noted in `docs/research/pagefind-baseline-2026-05-19.md`.
   - Rollback: remove the `pagefind` dep and the `postbuild` Pagefind segment; `rm -rf public/pagefind`.

2. **New `<NavSearch/>` consuming Pagefind.**
   - Files: edit `src/app/components/nav/NavSearch.tsx`. Drop the `<SearchModal url="/api/search-notion" />` usage. Implement a new modal triggered by Ctrl+K (and the existing keyboard hook). On open, lazy-import the Pagefind script:
     ```ts
     // @ts-expect-error — Pagefind ships its own runtime types
     const pagefind = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js')
     ```
     Debounce input by 300ms. Call `pagefind.search(query)` → map the first 20 results to a list with title + excerpt + URL. Match the EXISTING math2it modal markup and classes — only the data plumbing changes.
   - Verify: `yarn dev`, press Ctrl+K, type a known post title; result list appears and clicking navigates to the right URL. `yarn build && yarn start` to confirm Pagefind works in the production build.
   - Rollback: `git checkout src/app/components/nav/NavSearch.tsx`.

3. **Delete the runtime search route + dead notion-x search code paths.**
   - Files:
     - `rm -rf src/app/api/search-notion/`.
     - Confirm `src/app/lib/fetcher.ts` no longer references `searchNotionPersonal` (it shouldn't after Phase 4 task 2).
     - Grep `src/` for `SearchModal` — every usage should be replaced by the new `NavSearch` modal.
   - Verify: `yarn build` succeeds; `! grep -rn 'search-notion\|SearchModal\|searchNotionPersonal' src/` returns no matches; the production site at `yarn start` has working search.
   - Rollback: `git checkout src/app/api/search-notion/`.
