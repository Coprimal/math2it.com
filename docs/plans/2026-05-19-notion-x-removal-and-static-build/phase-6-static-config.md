# Phase 6: Static config (remove ISR, tailwind/next.config cleanup)

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

Goal: convert every page from ISR (`revalidate = 20`) to fully prerendered, lock `generateStaticParams` to `dynamicParams = false`, and clean up `next.config.mjs` / `tailwind.config.ts` to stop scanning `notion-x/`.

Reminder: we are NOT setting `output: 'export'`. Standard Next prerendering, deployed prebuilt to Vercel — same as dinhanhthi.

## Progress

| Status  | Task                                                                          |
| ------- | ----------------------------------------------------------------------------- |
| ✅ DONE | 6.1 Remove every `export const revalidate = …` from `src/app/`                 |
| ✅ DONE | 6.2 Add `export const dynamicParams = false` to every dynamic route            |
| ✅ DONE | 6.3 Edit `next.config.mjs`: add `staticPageGenerationTimeout: 600`, keep image config |
| ✅ DONE | 6.4 Edit `tailwind.config.ts` content paths: remove `notion-x/**`              |

## Tasks

1. **Remove every `export const revalidate = …` from `src/app/`.**
   - Files: edit every page under `src/app/` that has `export const revalidate = 20` (per Phase 1 task 2 inventory). Delete the line. Do NOT replace with `revalidate = false` — just delete.
   - Verify: `! grep -rn 'export const revalidate' src/app/` returns no matches. `yarn build` succeeds and the build summary shows pages as "○ (Static)" or "● (SSG)" — no "ƒ (Dynamic)" except `/api/og` if we later add one (not in this plan).
   - Rollback: `git checkout 'src/app/'` (then re-apply the bits you DO want to keep).

2. **Lock dynamic routes to `dynamicParams = false`.**
   - Files: each dynamic route under `src/app/` — `bai-viet/[slug]/page.tsx`, `(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx`, `(post-list)/chu-de/[[...slug]]/page.tsx`, `(post-list)/chuyen-muc/[[...slug]]/page.tsx`, `(post-list)/tac-gia/[[...slug]]/page.tsx`, `(post-list)/tuyen-chon/[[...slug]]/page.tsx`. Add:
     ```ts
     export const dynamicParams = false
     ```
     This ensures Next throws a 404 for any param `generateStaticParams` did not return — required for a fully prebuilt deploy.
   - Verify: visiting an unknown slug in `yarn start` returns the project's `not-found.tsx`, not a server-rendered 500.
   - Rollback: `git checkout 'src/app/'` for the affected files.

3. **Edit `next.config.mjs`.**
   - Files: edit `/Users/thi/git/math2it.com/next.config.mjs`. Concrete changes:
     - **Do NOT** uncomment `output: 'export'`. Leave it commented (or remove the comment line altogether).
     - Keep `trailingSlash: true`, `poweredByHeader: false`, `transpilePackages: ['react-syntax-highlighter']`, the `experimental.scrollRestoration` flag.
     - Remove `experimental.esmExternals: false` — it was a workaround for `react-medium-image-zoom`; we use `@fisch0920/medium-zoom` which doesn't need it.
     - Keep `images.remotePatterns` as-is (Next Image optimization still works because we're NOT in `output: 'export'`).
     - Add `staticPageGenerationTimeout: 600` (10-minute per-page budget — matches dinhanhthi).
     - Keep the existing `headers` function (X-Robots-Tag for previews).
   - Verify: `yarn build` succeeds; no warnings about unsupported options.
   - Rollback: `git checkout next.config.mjs`.

4. **Edit `tailwind.config.ts`.**
   - Files: edit `/Users/thi/git/math2it.com/tailwind.config.ts`. Remove `'./notion-x/**/*.{ts,tsx}'` (or similar) from the `content` array. Add `'./src/components/notion/**/*.{ts,tsx}'`. Confirm `src/components/**/*.{ts,tsx}` already covers the new files; otherwise extend explicitly.
   - Verify: `yarn build` succeeds; no classes get JIT-purged from the new components (visual smoke test on `/`, a single post, and the search modal).
   - Rollback: `git checkout tailwind.config.ts`.
