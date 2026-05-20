---
name: notion-rendering
description: Notion content rendered by vendored components, no notion-client or react-notion-x
metadata:
  type: preference
  importance: 5
  source: phase-9-cutover
  tags: [notion, rendering, convention]
  sync_to_claude_md: true
---

Notion content is rendered by vendored components in `src/components/notion/PostBody.tsx` + `src/lib/notion/renderer.tsx`, consuming an `ExtendedRecordMap` (from `notion-types`) fetched via `src/lib/notion/api.ts#getPage`.

`api.ts` calls Notion's unofficial web endpoints (`loadPageChunk`, `syncRecordValuesMain`, `queryCollection`) directly via `fetch`. There is intentionally no `notion-client` dependency.

`notion-types` and `notion-utils` ARE dependencies (same pattern as dinhanhthi.com).

Official-API database queries live in `src/lib/notion/db-official.ts` using `@notionhq/client`.

**Adding new block types:** Add a case to `renderer.tsx`'s switch and a component under `src/components/notion/`.

**MUST NOT** reintroduce `notion-client` or any `react-notion-x` fork.

See also: [[build-pipeline]], [[static-build-cutover]]
