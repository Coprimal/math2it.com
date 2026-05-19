# TSC Errors After Task 0.4

**Date:** 2026-05-19
**Task:** Phase 0, task 0.4 — Hand-fix params / searchParams async access

## Result

After task 0.4, `yarn tsc --noEmit` exits with 1 remaining error **unrelated to params**.

## Params-related errors — RESOLVED

All TS18048 / TS2349 errors from the `Promise<...>`-wrapped params types were fixed
in task 0.4 by creating `src/types/notion.ts` and updating the 6 dynamic route pages.

## Remaining error (NOT params-related)

```
src/app/page.tsx(1,24): error TS2307: Cannot find module '@/public/waving_hand.webp'
  or its corresponding type declarations.
```

**Root cause:** `src/img.d.ts` declares wildcard module types for `.svg`, `.png`,
`.jpeg`, `.jpg`, and `.gif` — but NOT for `.webp`. The file
`/public/waving_hand.webp` exists on disk; Next.js can import it at runtime, but
TypeScript has no ambient declaration for `*.webp`.

**Pre-existing:** This error predates task 0.4. `git diff HEAD -- src/app/page.tsx`
shows no changes to that file. The import was committed before Phase 0 began.

**Domain:** React 19 / peer-dep churn and general type hygiene — task 0.6 domain.
Or, a trivial one-line fix: add `declare module '*.webp' { ... }` to `src/img.d.ts`.
Either way, it is NOT a params-type problem.

## Action

Task 0.4 is complete. The `.webp` declaration gap should be addressed in task 0.6
(peer-dep compatibility pass) or as a standalone pre-task-0.6 fix.
