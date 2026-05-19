# Phase 8: GitHub Actions workflow + Vercel project settings

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

Goal: port dinhanhthi's `deploy-vercel.yml` to math2it (yarn 4 instead of pnpm), set the schedule to every 5 days, and configure the Vercel project to STOP auto-building so the GH Actions workflow is the single source of truth.

## Progress

| Status  | Task                                                                                  |
| ------- | ------------------------------------------------------------------------------------- |
| ⬜ TODO | 8.1 Create `.github/workflows/deploy-vercel.yml` (yarn 4 + 5-day cron)                |
| ⬜ TODO | 8.2 Add `vercel.json` (framework: nextjs, minimal)                                    |
| ⬜ TODO | 8.3 Configure Vercel project: secrets + env vars + "Ignored Build Step"               |
| ⬜ TODO | 8.4 Dry-run on `dev` via `workflow_dispatch` and verify Vercel preview deploy succeeds |

## Tasks

1. **Create `.github/workflows/deploy-vercel.yml` adapted for yarn 4.**
   - Files: new `.github/workflows/deploy-vercel.yml`. Base structure mirrors [dinhanhthi.com's deploy-vercel.yml](/Users/thi/git/dinhanhthi.com/.github/workflows/deploy-vercel.yml) with these adaptations:
     - Cron: `0 0 */5 * *` (every 5 days).
     - Push triggers: `main`, `dev`.
     - `workflow_dispatch` allowed.
     - Concurrency group: `deploy-${{ github.ref }}` with `cancel-in-progress: true`.
     - Node 22 (matches dinhanhthi).
     - Setup yarn 4 via `corepack enable && corepack prepare yarn@4.1.1 --activate`.
     - Cache `~/.yarn/berry/cache` keyed on `hashFiles('**/yarn.lock')`.
     - Cache `.next/cache` keyed on `hashFiles('**/yarn.lock', '**/*.ts', '**/*.tsx')`.
     - `yarn install --immutable`.
     - **Rebuild sharp**: `yarn rebuild sharp` (matches dinhanhthi's `pnpm rebuild sharp`).
     - Determine env identically: `main` → ENV_MODE=prod + `--prod` to vercel; else → ENV_MODE=dev + preview.
     - `yarn dlx vercel@latest pull --yes --environment=<production|preview> --token=$VERCEL_TOKEN`.
     - Verify `.vercel/` directory exists (same defensive check as dinhanhthi).
     - `yarn dlx vercel@latest build $VERCEL_ARGS --token=$VERCEL_TOKEN`.
     - `yarn dlx vercel@latest deploy --prebuilt --archive=tgz $VERCEL_ARGS --token=$VERCEL_TOKEN`.
     - `timeout-minutes: 45`.
     - Env passed to build step: `ENV_MODE`, `NEXT_PUBLIC_ENV_MODE`. All Notion secrets come from `vercel pull` (NOT from GitHub secrets).
   - Verify: `actionlint .github/workflows/deploy-vercel.yml` (or `gh workflow view`) shows no syntax errors. Push to `dev` and confirm the workflow appears in the Actions tab.
   - Rollback: `rm .github/workflows/deploy-vercel.yml`.

2. **Add `vercel.json`.**
   - Files: new `/Users/thi/git/math2it.com/vercel.json`:
     ```json
     {
       "$schema": "https://openapi.vercel.sh/vercel.json",
       "framework": "nextjs"
     }
     ```
     Matches dinhanhthi. No build command. Vercel infers Next.js so `vercel build` does the right thing.
   - Verify: `cat vercel.json` matches expected; `vercel build --debug` locally completes without warnings about an unspecified framework.
   - Rollback: `rm vercel.json`.

3. **Configure the Vercel project (one-time manual).**
   - This task is mostly OUT-OF-REPO actions — document them in `docs/research/vercel-setup-2026-05-19.md`:
     - **Link**: If `.vercel/project.json` is not present locally, run `vercel link` once and commit nothing (`.vercel/` is gitignored).
     - **GitHub secrets** (Settings → Secrets and variables → Actions): add `VERCEL_TOKEN` (vercel.com/account/tokens, scoped to the project), `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (both from `.vercel/project.json`).
     - **Vercel project env vars** (Vercel project → Settings → Environment Variables): copy every Notion-related env var from `.env.local` to BOTH Production and Preview environments. Source list per `docs/context/2026-05-19-math2it-static-refactor.json` (NOTION_TOKEN, NOTION_DB_POSTS, NEXT_PUBLIC_ID_SLUG, …).
     - **Disable Vercel's auto-build** (Vercel project → Settings → Git → "Ignored Build Step"): set to `exit 0`. This makes Vercel skip its own build on every git push; only `vercel deploy --prebuilt` from GH Actions ships a build.
     - **OR** alternatively disconnect the Git integration entirely (Vercel project → Settings → Git → "Disconnect"). `exit 0` is reversible and easier — prefer it.
   - Verify: a push to `dev` triggers the GH workflow; the Vercel dashboard shows the push but reports "Ignored Build Step" so Vercel doesn't build, and a few minutes later shows a deploy from `vercel deploy --prebuilt`.
   - Rollback: re-enable Vercel auto-build by clearing the "Ignored Build Step" field (or reconnecting Git).

4. **Dry-run on `dev` via `workflow_dispatch`.**
   - Files / commands: open the GitHub Actions tab → "Build and Deploy to Vercel" → "Run workflow" → branch `dev` → run.
   - Verify: workflow completes within 45 minutes; the `vercel deploy --prebuilt` step prints a preview URL; visiting that URL renders the new statically-built site with the math2it style intact, search working, posts rendering. Save the workflow run URL + preview URL to `docs/research/dry-run-2026-05-19.md`.
   - Rollback: if the workflow fails, do NOT merge to `main`. Iterate on `dev` until the dispatch succeeds.
