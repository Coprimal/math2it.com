# Phase 7: Remove `notion-x` submodule + drop `notion-client`

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

Goal: delete the submodule from disk, drop it from git, and uninstall **only** `notion-client`. **Keep** `notion-types` and `notion-utils` — they're still imported by the vendored renderer (same pattern dinhanhthi follows). This is the **point of no return** on `dev` — once merged, the project can't build against the old submodule code.

Pre-flight: confirm Phase 4 task 5 (no remaining `notion-x/` paths, no `notion-client` imports) passed.

## Progress

| Status  | Task                                                                       |
| ------- | -------------------------------------------------------------------------- |
| ✅ DONE | 7.1 Verify zero `notion-x/` paths + zero `notion-client` imports          |
| ✅ DONE | 7.2 Remove the `notion-x` git submodule cleanly                            |
| ✅ DONE | 7.3 Uninstall `notion-client`; keep `notion-types` + `notion-utils`; audit other deps |

## Tasks

1. **Final pre-flight: zero references to the submodule and the dropped package.**
   - Files: run, all must exit 0 (no matches):
     - `! grep -rn 'notion-x/' src/ scripts/ next.config.mjs tailwind.config.ts package.json`
     - `! grep -rn -E "from 'notion-client'" src/ scripts/`
     - `! grep -rn 'react-notion-x' src/ scripts/ package.json`
   - Allowed (should still appear): `from 'notion-types'`, `from 'notion-utils'`, `from '@notionhq/client'`. Run `grep -rn "from 'notion-types'" src/ | wc -l` and `grep -rn "from 'notion-utils'" src/ | wc -l` and record the non-zero counts in `docs/research/post-vendor-imports.md` as a sanity check.
   - Verify: the three forbidden greps return no matches; the two expected greps return positive counts.
   - Rollback: n/a — verification only. If a forbidden grep fails, fix the offending file before proceeding.

2. **Remove the `notion-x` git submodule.**
   - Files / commands:
     - `git submodule deinit -f notion-x`
     - `git rm -rf notion-x` (also stages the deletion and updates `.gitmodules`)
     - `rm -rf .git/modules/notion-x`
     - If `.gitmodules` is now empty, `git rm -f .gitmodules`; otherwise commit the trimmed version.
     - Remove the `getlib` script from `package.json` (`"getlib": "git submodule update --recursive --remote"`).
   - Verify: `git status` shows `notion-x/` removed and `.gitmodules` removed/updated; `yarn install && yarn build` still succeeds.
   - Rollback: `git restore --staged --worktree .gitmodules notion-x` then `git submodule update --init --recursive`.

3. **Uninstall `notion-client` (only) and audit other dead deps.**
   - Files / commands:
     - `yarn remove notion-client` — single package removed.
     - **DO NOT** remove: `notion-types`, `notion-utils`, `@notionhq/client`, `katex`, `@matejmazur/react-katex`, `mermaid`, `prismjs`, `react-syntax-highlighter`, `@giscus/react`, `sharp`, `p-memoize`, `open-graph-scraper`, `react-copy-to-clipboard`, `@fisch0920/medium-zoom`, `next-sitemap`, `lodash`, `moment`, `classnames`, `slugify`, `got`, `react-fast-compare`, `@headlessui/react`.
     - Audit dead deps that were ONLY pulled in for notion-x (not used by the vendored code): `react-snap-carousel`, `swr`, `react-image`, `react-lazy-images`, `geopattern`, `react-geopattern`. For each: `grep -rn '<dep-name>' src/`. Remove only the ones with zero matches.
   - Verify: `yarn install` produces a clean lockfile; `yarn build` succeeds; bundle size before/after recorded in `docs/research/bundle-size-2026-05-19.md`.
   - Rollback: `git checkout package.json yarn.lock && yarn install`.
