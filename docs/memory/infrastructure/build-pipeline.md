---
name: build-pipeline
description: math2it builds in GitHub Actions, Vercel serves prebuilt output only
metadata:
  type: fact
  importance: 5
  source: phase-9-cutover
  tags: [infrastructure, vercel, github-actions, deploy]
---

math2it builds in GitHub Actions; Vercel only serves prebuilt output.

- Workflow: `.github/workflows/deploy-vercel.yml`
- Cron: `0 0 */5 * *` (every 5 days, day-of-month divisible by 5)
- Push triggers: `main` (production), `dev` (preview)
- Manual trigger: `gh workflow run deploy-vercel.yml --ref main`
- Vercel auto-build is disabled via "Ignored Build Step" = `exit 0`

**Required GitHub secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

All Notion env vars live in **Vercel project settings** (not GitHub secrets). `vercel pull` fetches them at build time.

Build pipeline: `yarn install --immutable` → `yarn rebuild sharp` → `vercel pull` → `vercel build` → `vercel deploy --prebuilt --archive=tgz`

See also: [[notion-rendering]], [[static-build-cutover]]
