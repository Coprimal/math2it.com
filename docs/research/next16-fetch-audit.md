# Next 16 `fetch()` Caching Audit

**Date:** 2026-05-19
**Task:** Phase 0, task 0.5
**Scope:** Audit direct `fetch()` usage across `src/`, `notion-x/src/`, and `scripts/` to assess Next 15+ caching-default impact.

---

## Summary

**Result: no changes required to `src/`.** A recursive grep for `fetch(` across `src/` found zero matches. All data fetching in `src/` goes through the abstraction layer in `@app/lib/fetcher` and `@notion-x`; there are no direct `fetch()` calls. No source files were modified by this task.

---

## 1. Direct `fetch` calls found in `src/` — Decision table

| File | Line | Context | Decision | Reason |
|------|------|---------|----------|--------|
| *(none)* | — | — | — | Zero `fetch(` matches found in `src/` |

Grepped with: `grep -rn "fetch(" src/`

---

## 2. Direct `fetch` calls in `notion-x/src/` (out of scope)

> **Note:** `notion-x` is a git submodule. It will be removed in Phase 7; a vendored replacement with its own caching policy will be introduced in Phase 2. These calls are listed here for awareness only. No changes were made to `notion-x/` in this task.

| File | Line | Function / Context | Cache impact |
|------|------|-------------------|--------------|
| `notion-x/src/lib/db.ts` | 79 | `getUnofficialDatabaseImpl` — unofficial Notion API `queryCollection` endpoint; called at build time from `generateStaticParams` / page server components | HIGH — build-time; loses default cache in Next 15+. Needs `{ cache: 'force-cache' }` when vendored in Phase 2 |
| `notion-x/src/lib/db.ts` | 119 | `queryDatabaseImpl` — official Notion API `databases/{id}/query`; called at build time | HIGH — same as above |
| `notion-x/src/lib/db.ts` | 189 | `retrieveDatabaseImpl` — official Notion API `databases/{id}` retrieve; called at build time | HIGH |
| `notion-x/src/lib/db.ts` | 213 | `retrievePageImpl` — official Notion API `pages/{id}` retrieve; called at build time | HIGH |
| `notion-x/src/lib/db.ts` | 244 | `retrieveBlockChildren` — official Notion API `blocks/{id}/children`; called at build time | HIGH |
| `notion-x/src/lib/db.ts` | 285 | `getCustomEmojiBlock` — unofficial Notion API `syncRecordValuesSpace`; called at build time for custom emoji resolution | HIGH |
| `notion-x/src/lib/db.ts` | 483 | `searchNotion` (unofficial Notion web search API) — called at runtime from the `/api/search-notion` route handler | LOW — runtime/request-time search; no caching desired |
| `notion-x/src/lib/db.ts` | 535 | `searchNotionPersonal` — personal Notion site search API; called at runtime from `/api/search-notion` | LOW — runtime/request-time search; no caching desired |
| `notion-x/src/components/SearchModal.tsx` | 306 | `fetcher` helper inside `SearchModal` — browser-side fetch inside a Client Component, called on user search input | NONE — client-side runtime; Next.js fetch caching does not apply |

**Action required in Phase 2** when vendoring `notion-x/src/lib/db.ts`: add `{ cache: 'force-cache' }` to the six build-time calls (lines 79, 119, 189, 213, 244, 285). The two search calls (lines 483, 535) must remain uncached.

---

## 3. Direct `fetch` calls in `scripts/` (out of scope — non-Next runtime)

> **Note:** Files in `scripts/` are standalone CLI tools (e.g. `ud_images.ts`) that run outside the Next.js runtime via `ts-node` / `tsx`. The Next.js `fetch()` caching instrumentation does not apply here. No changes required.

| File | Line | Function | Notes |
|------|------|---------|-------|
| `scripts/ud_images.ts` | 386 | `getNotionPage` — Notion API `pages/{id}` | CLI; no Next cache context |
| `scripts/ud_images.ts` | 409 | `getNotionDatabase` — Notion API `databases/{id}/query` | CLI; no Next cache context |
| `scripts/ud_images.ts` | 520 | `getNotionBlocks` — Notion API `blocks/{id}/children` | CLI; no Next cache context |

---

## 4. Decision rationale per `src/` call

**No calls to justify.** The `src/` directory contains zero direct uses of the JavaScript built-in `fetch()`. All data fetching in the application is routed through the `@notion-x` abstraction layer (imported from the `notion-x` submodule), which internally uses its own `fetch()` wrappers (audited above in section 2). Because none of those wrappers are imported directly into `src/` as raw `fetch` calls, there is nothing to change in `src/` for this task.

The fetch-caching risk for the build-time Notion API calls (section 2, lines 79, 119, 189, 213, 244, 285 of `db.ts`) is real and HIGH. However, `notion-x/` is an out-of-scope submodule in Phase 0 — Phase 7 removes it and Phase 2 introduces a vendored replacement where the `{ cache: 'force-cache' }` annotations must be applied. The present task (0.5) scope is limited to `src/`; the submodule is flagged for Phase 2 action.

---

## 5. TypeScript check results

After this task (no `src/` changes were made), `yarn tsc --noEmit` produces exactly one pre-existing error:

```
src/app/page.tsx(1,24): error TS2307: Cannot find module '@/public/waving_hand.webp' or its corresponding type declarations.
```

This is the `.webp` module declaration error carried over from task 0.4 and is the only acceptable error per the task specification. No new TypeScript errors were introduced.

---

## 6. Files modified by this task

None. Zero `fetch(` calls were found in `src/`; no source files required editing.

**Created:**
- `docs/research/next16-fetch-audit.md` (this file)
