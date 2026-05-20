---
name: static-build-cutover
description: 2026-05-19 migration from Vercel ISR to GitHub Actions prebuilt static deploy
metadata:
  type: fact
  importance: 4
  source: phase-9-cutover
  tags: [decision, architecture, migration]
---

On 2026-05-19, math2it migrated from Vercel-built ISR (`revalidate = 20`) to GitHub-Actions-built prerendered + `vercel deploy --prebuilt`, modeled on dinhanhthi.com.

**Motivations:**
- Remove the `notion-x` submodule (high-maintenance fork of react-notion-x)
- Reproducible builds (Vercel's build env was opaque)
- Predictable rebuild cadence (every 5 days via cron)

**Key decision:** Standard Next.js prerendering over `output: 'export'` to keep Next Image optimization functional via Vercel's serverless image endpoint.

**What changed:**
- `notion-x` submodule removed; components vendored into `src/components/notion/` and `src/lib/notion/`
- `notion-client` removed; unofficial Notion API calls done directly via `fetch` in `api.ts`
- ISR (`revalidate`) removed from all pages
- `dynamicParams = false` on all dynamic routes
- Pagefind replaced runtime Notion search API
- GitHub Actions workflow handles build + deploy

See also: [[build-pipeline]], [[notion-rendering]]
