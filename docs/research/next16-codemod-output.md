# Next Codemod Output — Task 0.3

**Date:** 2026-05-19
**Task:** Phase 0, task 0.3 — Run official @next/codemod for async dynamic APIs

## Invocation

```
npx --yes @next/codemod@latest next-async-request-api /Users/thi/git/math2it.com/src --force
```

`@next/codemod@latest` resolved to `@next/codemod@16.2.6`.

## Output

```
WARNING: Git directory is not clean. Forcibly continuing.
Executing command: jscodeshift --parser=tsx --ignore-pattern=**/node_modules/** --ignore-pattern=**/.next/** --extensions=tsx,ts,jsx,js --transform /Users/thi/.npm/_npx/04c93779852ad6b7/node_modules/@next/codemod/transforms/next-async-request-api.js /Users/thi/git/math2it.com/src
Processing 46 files... 
Spawning 9 workers...
Sending 6 files to free worker...
Sending 6 files to free worker...
Sending 6 files to free worker...
Sending 6 files to free worker...
Sending 6 files to free worker...
Sending 6 files to free worker...
Sending 6 files to free worker...
Sending 4 files to free worker...
All done. 
Results: 
0 errors
40 unmodified
0 skipped
6 ok
Time elapsed: 1.867seconds
```

## Files Modified (6)

```
src/app/(post-list)/chu-de/[[...slug]]/page.tsx          | 8 +++++---
src/app/(post-list)/chuyen-muc/[[...slug]]/page.tsx      | 6 ++++--
src/app/(post-list)/tac-gia/[[...slug]]/page.tsx         | 6 ++++--
src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx | 6 ++++--
src/app/(post-list)/tuyen-chon/[[...slug]]/page.tsx      | 6 ++++--
src/app/bai-viet/[slug]/page.tsx                         | 6 ++++--
6 files changed, 25 insertions(+), 13 deletions(-)}
```

## Codemod Transform Applied

The `next-async-request-api` transform rewrote every dynamic-route page/generateMetadata function from the destructuring pattern to a `props`-based pattern with `await props.params`:

**Before:**
```tsx
export async function generateMetadata({ params }: SomePropsType): Promise<Metadata> {
  const slug = params.slug || ''
  // ...
}
export default async function Page({ params }: SomePropsType) {
  // ...
}
```

**After:**
```tsx
export async function generateMetadata(props: SomePropsType): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug || ''
  // ...
}
export default async function Page(props: SomePropsType) {
  const params = await props.params;
  // ...
}
```

## Notes for Task 0.4

The codemod transformed the function bodies correctly. However, the shared TypeScript interfaces `DynamicSegmentParamsProps` and `OptionalCatchAllProps` in `notion-x/src/interface.ts` still have `params` typed as sync types (`{ slug: string }` / `{ slug: string[] }`). Task 0.4 must update those interfaces to `Promise<{ slug: string }>` / `Promise<{ slug?: string[] }>` to make TypeScript satisfied.
