# Next 14 → 16 Upgrade Notes for math2it

**Date:** 2026-05-19  
**Author:** Phase 0 research task 0.1  
**Scope:** Breaking changes that apply when upgrading math2it from Next.js 14.2.35 / React 18.3.1 / ESLint 8.42.0 to Next.js 16 / React 19 / ESLint 9.

---

## 1. Versions Targeted

| Package | Current (math2it) | Target |
|---|---|---|
| `next` | 14.2.35 | **16.2.6** (latest stable as of 2026-05-19) |
| `react` / `react-dom` | 18.3.1 | **19.x** (Next 16.2.6 requires `^19.0.0`) |
| `eslint` | 8.42.0 | **^9.0.0** |
| `eslint-config-next` | 14.2.3 | **16.2.6** (requires ESLint `>=9.0.0`) |

**Next.js 16.2.6** was released on 2026-05-07 and is a stable maintenance release (security + bug-fix backports). The first Next.js 16 stable was **16.0.0** released on 2025-10-21.

**React version:** Next 16 ships with React 19.2 canary in the App Router. The `peerDependencies` in `next@16.2.6` state `"react": "^18.2.0 || ^19.0.0"`. The App Router in practice runs on React 19.2.

**ESLint:** `eslint-config-next@16.2.6` requires `eslint >= 9.0.0`. ESLint 9 introduced the new flat-config format; `@next/eslint-plugin-next` now defaults to flat config (see Section 4).

---

## 2. Async Dynamic APIs (Next 15+ — REQUIRED change)

### What changed

`params`, `searchParams`, `cookies()`, `headers()`, and `draftMode()` are now **asynchronous** from Next.js 15 onward. In Next.js 16 the temporary synchronous compatibility shim was **fully removed** — synchronous access now throws at runtime.

### Before / After for a math2it dynamic route

`src/app/bai-viet/[slug]/page.tsx` currently uses:

```tsx
// BEFORE (Next 14 — synchronous, works today)
type Params = { slug: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const slug = params.slug || ''   // sync access
  // ...
}

export default async function SinglePostPage({ params }: { params: Params }) {
  const slug = params.slug || ''   // sync access
  // ...
}
```

After the upgrade it must become:

```tsx
// AFTER (Next 16 — async)
type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params    // await the promise
  // ...
}

export default async function SinglePostPage({ params }: { params: Params }) {
  const { slug } = await params    // await the promise
  // ...
}
```

For optional catch-all routes the slug type becomes `Promise<{ slug?: string[] }>`.

**`generateStaticParams` is NOT affected** — it returns static data and does not receive `params` as a promise.

### math2it files that need this change

Every file that destructures `params` or `searchParams` directly in a page, layout, or `generateMetadata` function:

| File | What uses params/searchParams |
|---|---|
| `src/app/bai-viet/[slug]/page.tsx` | `params.slug` in `generateMetadata` + default export |
| `src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx` | `params?.slug?.[1]` in `generateMetadata` + default export |
| `src/app/(post-list)/chu-de/[[...slug]]/page.tsx` | `params.slug[0]`, `params?.slug?.[2]` in `generateMetadata` + default export |
| `src/app/(post-list)/chuyen-muc/[[...slug]]/page.tsx` | `params.slug[0]`, `params?.slug?.[2]` in `generateMetadata` + default export |
| `src/app/(post-list)/tac-gia/[[...slug]]/page.tsx` | `params.slug[0]`, `params?.slug?.[2]` in `generateMetadata` + default export |
| `src/app/(post-list)/tuyen-chon/[[...slug]]/page.tsx` | `params?.slug?.[1]` in `generateMetadata` + default export |

None of these files currently call `cookies()`, `headers()`, or `draftMode()` from `next/headers`, so those APIs are not in scope for math2it.

The codemod (task 0.3) should handle the majority of these mechanically; task 0.4 covers any misses.

---

## 3. `fetch()` Caching Default Flip (Next 15)

### What changed

In Next.js 14, `fetch()` inside Server Components was **cached by default** (equivalent to `{ cache: 'force-cache' }`). In **Next.js 15** the default was flipped to **no cache** (equivalent to `{ cache: 'no-store' }`). This persists in Next.js 16.

To restore the old behaviour, you must opt in explicitly:

```js
// Opt a single fetch call into build-time caching
const data = await fetch('https://api.example.com/data', { cache: 'force-cache' })

// Opt every fetch in a layout/page into caching (segment-level)
export const fetchCache = 'default-cache'
```

GET route handlers are also no longer cached by default; to opt in, add:

```js
export const dynamic = 'force-static'
```

### math2it impact

**`src/` directory** — a grep for `fetch(` across `src/` returned **zero results**. All data fetching in `src/` goes through the abstraction layer in `@app/lib/fetcher` and `@notion-x` — it does not use `fetch()` directly.

**`notion-x/src/` directory** — the following files contain direct `fetch()` calls:

| File | Lines | Context | Cache impact |
|---|---|---|---|
| `notion-x/src/lib/db.ts` | 79, 119, 189, 213, 244, 285, 483, 535 | Unofficial Notion API calls inside server functions that are called from `generateStaticParams` / page server components at build time | **HIGH** — these are build-time fetches; losing the default cache means each call hits the Notion API on every build. Requires `{ cache: 'force-cache' }` or `fetchCache = 'default-cache'` segment config. |
| `notion-x/src/components/SearchModal.tsx` | 306 | Client-side search request to `/api/search-notion` at runtime | **LOW** — this is a browser-side fetch inside a Client Component; no change needed. |

**Action required (task 0.5):** After the upgrade, audit `notion-x/src/lib/db.ts` and add `{ cache: 'force-cache' }` to the fetch calls that are invoked during `generateStaticParams` / page rendering. SearchModal is client-side and unaffected.

---

## 4. Other Breaking Changes from Next.js 15 → 16 That Affect math2it

Sources: official upgrade guides at `https://nextjs.org/docs/app/guides/upgrading/version-15` and `https://nextjs.org/docs/app/guides/upgrading/version-16`.

### 4.1 `runtime` config — `experimental-edge` removed (Next 15)

The route-segment `runtime` value `"experimental-edge"` is removed; only `"edge"` is valid.

**math2it:** no files in `src/app/` currently export `runtime`. Not applicable.

### 4.2 `@next/font` package removed (Next 15)

The separate `@next/font` package was removed; `next/font` (built-in) is the replacement.

**math2it:** `package.json` does not list `@next/font`. Not applicable.

### 4.3 `experimental.bundlePagesExternals` renamed (Next 15)

Renamed to top-level `bundlePagesRouterDependencies`.

**math2it:** `next.config.mjs` does not use either key. Not applicable.

### 4.4 `experimental.serverComponentsExternalPackages` renamed (Next 15)

Renamed to top-level `serverExternalPackages`.

**math2it:** `next.config.mjs` does not use this key. Not applicable.

### 4.5 `experimental.scrollRestoration` removed (Next 16 / removed in 15)

`next.config.mjs` **currently contains**:

```js
experimental: {
  scrollRestoration: true,
  esmExternals: false
}
```

`scrollRestoration` is no longer a valid `experimental` key in Next 15+. It will produce a config warning or error at build time. **Action required (task 0.2):** Remove `experimental.scrollRestoration`.

In Next 16, scroll-behavior override is replaced by a `data-scroll-behavior="smooth"` attribute on the `<html>` element (opt-in). Since math2it relied on `scrollRestoration: true` for SPA navigation, check whether `data-scroll-behavior="smooth"` is needed in `src/app/layout.tsx`.

### 4.6 `experimental.esmExternals` — status in Next 16

`esmExternals: false` was used as a workaround for ESM compatibility issues (see comment in `next.config.mjs`). The `esmExternals` experimental option was removed in Next 15. The underlying issue it worked around (ESM externals handling) changed architecture in Next 15 with Turbopack; the workaround is no longer needed. **Action required (task 0.2):** Remove `experimental.esmExternals`. If any ESM package (e.g. `react-medium-image-zoom`) starts failing after removal, investigate Turbopack resolver aliases instead.

### 4.7 Turbopack now default bundler (Next 16 — behavior change)

Starting with Next 16, `next build` uses Turbopack by default. If a `webpack` config is found, the build **fails** to prevent misconfiguration.

**math2it:** `next.config.mjs` does not define a `webpack` key. This means Turbopack will be used automatically. All the Turbopack-incompatible experimental options (`scrollRestoration`, `esmExternals`) must be removed first (see 4.5, 4.6). The `trailingSlash: true` option is supported by Turbopack.

To opt out of Turbopack if needed (e.g. during incremental migration): `next build --webpack`.

### 4.8 `experimental.turbopack` moved to top-level `turbopack` (Next 16)

If any turbopack config exists under `experimental.turbopack` (none in math2it), it must move to the top-level `turbopack` key.

**math2it:** not applicable.

### 4.9 `next lint` command removed (Next 16 — REQUIRED)

The `next lint` CLI command is removed in Next 16. The `lint` script in `package.json` is currently:

```json
"lint": "next lint"
```

**Action required (task 0.2):** Replace with a direct ESLint invocation, e.g.:

```json
"lint": "eslint src --ext .ts,.tsx"
```

A codemod is available: `yarn dlx @next/codemod@canary next-lint-to-eslint-cli .`

### 4.10 `serverRuntimeConfig` and `publicRuntimeConfig` removed (Next 16)

These top-level `next.config` keys are removed.

**math2it:** `next.config.mjs` does not use either. Not applicable.

### 4.11 `devIndicators` options removed (Next 16)

`appIsrStatus`, `buildActivity`, `buildActivityPosition` removed from `devIndicators`.

**math2it:** `next.config.mjs` does not set `devIndicators`. Not applicable.

### 4.12 `next/image` behaviour changes (Next 16 — may affect math2it)

The following defaults changed in Next 16:

| Property | Old default | New default | math2it impact |
|---|---|---|---|
| `images.minimumCacheTTL` | 60 s | 14400 s (4 h) | Low risk — longer cache is fine for math2it images |
| `images.imageSizes` | includes `16` | `16` removed | Low risk — 16 px images are not commonly used on math2it |
| `images.qualities` | all values | `[75]` | Low — math2it does not pass an explicit `quality` prop; default 75 is acceptable |
| `images.maximumRedirects` | unlimited | 3 | Low risk unless some Notion-hosted images redirect more than 3 times |
| Local images with query strings | allowed | require `images.localPatterns` | **Not applicable** — math2it uses `remotePatterns` for external hosts |

`math2it`'s `next.config.mjs` already uses `images.remotePatterns`, not the deprecated `images.domains`. No change needed there.

### 4.13 Parallel routes `default.js` now required (Next 16)

Builds fail if a parallel route slot lacks a `default.js` file.

**math2it:** No parallel routes (`@slot` directories) exist in `src/app/`. Not applicable.

### 4.14 ESLint flat config now default (Next 16 — REQUIRED)

`@next/eslint-plugin-next` defaults to ESLint flat config format (aligned with ESLint 9). The existing `.eslintrc.*` format is legacy.

**math2it's current ESLint setup** uses:
- `eslint@8.42.0` with `.eslintrc` format (legacy)
- Multiple plugins: `@typescript-eslint`, `eslint-plugin-prettier`, `eslint-plugin-tailwindcss`, `eslint-plugin-unicorn`, `eslint-plugin-unused-imports`

**Action required (task 0.2):** Upgrade to `eslint@^9.0.0` and migrate configuration from `.eslintrc.*` to `eslint.config.js` (flat config). All listed plugins must have ESLint 9 compatible versions. See the [ESLint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide).

### 4.15 Minimum Node.js version: 20.9.0 (Next 16)

See Section 6.

### 4.16 `middleware.ts` deprecated, renamed `proxy.ts` (Next 16)

**math2it:** No `middleware.ts` exists in the repo. Not applicable.

---

## 5. React 19 Peer-Dep Compatibility for math2it Dependencies

React 19 introduced changes that affect third-party packages (notably: `forwardRef` is no longer needed for refs, `useActionState` replaces `useFormState`, ref-as-prop is now standard). Most actively maintained packages already support React 19 by the time of this research.

| Dependency | Version in math2it | React 19 status | Notes |
|---|---|---|---|
| `@matejmazur/react-katex` | 3.1.3 | **SUPPORTED** | peerDependency is `"react": ">=16"` — covers React 19 with no override needed. |
| `@giscus/react` | ^3.0.0 | **SUPPORTED** | peerDependency is `"react": "^16 \|\| ^17 \|\| ^18 \|\| ^19"` — explicitly lists React 19. |
| `@headlessui/react` | ^2.0.4 | **SUPPORTED** | peerDependency is `"react": "^18 \|\| ^19 \|\| ^19.0.0-rc"` — explicitly lists React 19. |
| `@fisch0920/medium-zoom` | ^1.0.7 | **SUPPORTED** | Vanilla JavaScript library (forked `medium-zoom`); no React peer dependency at all. |
| `react-tooltip` | ^5.28.0 | **SUPPORTED** | peerDependency is `"react": ">=16.14.0"` and devDependency uses `"react": "19.0.0"` — tested with React 19. |
| `react-syntax-highlighter` | 15.5.0 | **PEER-WARNING-ONLY** | peerDependency is `"react": ">= 0.14.0"` — technically compatible but the pinned version `15.5.0` predates React 19 testing. A peer warning may appear from npm/yarn; the library functions correctly. Use `resolutions` in `package.json` if needed. |
| `react-copy-to-clipboard` | ^5.1.0 | **SUPPORTED** | peerDependency is `"react": ">=15.3.0"` and devDependency uses `"react": "^19.2.4"` — actively tested with React 19. |
| `react-fast-compare` | ^3.2.2 | **SUPPORTED** | No React peerDependency declared (pure utility function); works with any React version including 19. |

**Summary:** None of the 8 listed packages are BLOCKED. No React 19 incompatibility requires dropping a dependency. `react-syntax-highlighter@15.5.0` may emit a harmless peer warning; if it does, add a `resolutions` entry in `package.json` (yarn 4 style) to suppress it without changing runtime behaviour.

---

## 6. Node.js Version Requirements

**Next.js 16 requires Node.js >= 20.9.0** (per `next@16.2.6` `engines.node` and the official upgrade guide).

math2it's current `package.json`:

```json
"engines": {
  "node": "^20.10.0"
}
```

`^20.10.0` already satisfies `>=20.9.0` — no change needed to `engines.node` for the minimum. **Node.js 18 is no longer supported** by Next 16 (dropped from Next 16 release). Node.js 20 LTS and Node.js 22 LTS are both supported.

**Note for Phase 8:** The planned GitHub Actions workflow will specify `node-version`. At time of writing, Node.js 20 is in active LTS and sufficient. When Node 20 enters maintenance (April 2026) or when Vercel's build image advances, bump `engines.node` to `^22.0.0` and the workflow's `node-version` to `22`. No action required in Phase 0.

---

## 7. Codemod Tool

The official invocation documented in both the Next.js 15 and Next.js 16 upgrade guides (as of 2026-05-19):

```bash
# Using yarn (math2it uses yarn 4)
yarn dlx @next/codemod@canary upgrade latest
```

This command:
1. Updates `next`, `react`, `react-dom`, `eslint-config-next` to latest in `package.json`.
2. Runs applicable codemods for the target version, including:
   - `async-request-api` — converts `params`/`searchParams`/`cookies()`/`headers()`/`draftMode()` access to async.
   - `app-dir-runtime-config-experimental-edge` — replaces `experimental-edge` with `edge`.
   - `next-lint-to-eslint-cli` — replaces `next lint` with a direct ESLint call.
   - Removes `unstable_` prefix from stabilized APIs.
   - Removes `experimental_ppr` route segment config.
   - Updates `turbopack` config location.

After the codemod, run `yarn tsc --noEmit` to confirm TypeScript is satisfied with the new async params types (task 0.3 verify step).

For the `next-lint-to-eslint-cli` sub-codemod it can also be run standalone:

```bash
yarn dlx @next/codemod@canary next-lint-to-eslint-cli .
```

---

## 8. Top-3 Risk Callouts for math2it

- **`experimental.esmExternals: false` removal may resurface ESM import errors.** The `next.config.mjs` comment specifically notes this workaround was added for `react-medium-image-zoom` (and possibly other ESM packages). After removing the key, a Turbopack build may fail with `Module not found` or ESM interop errors for packages that were previously handled by this flag. Mitigation: test `yarn build` immediately after removing `experimental.esmExternals` and before any other changes; if errors appear, add `turbopack.resolveAlias` entries as the Turbopack equivalent.

- **`notion-x/src/lib/db.ts` fetch caching loss will break incremental builds or cause excessive Notion API calls.** The `db.ts` file has 8 `fetch()` calls that hit the (unofficial) Notion API. With the default-no-cache change, every build will hammer the Notion API rather than using cached responses, risking rate-limiting and significantly longer build times. This is the highest-impact correctness risk. Mitigation: add `{ cache: 'force-cache' }` to all Notion API `fetch()` calls in `db.ts` that are called from build-time data paths (task 0.5).

- **ESLint configuration is entirely legacy-format and must be migrated to flat config.** math2it uses ESLint 8 with a `.eslintrc`-based setup that includes six custom plugins. Migrating to ESLint 9 flat config requires rewriting the config file and ensuring all six plugins (`@typescript-eslint`, `eslint-plugin-prettier`, `eslint-plugin-tailwindcss`, `eslint-plugin-unicorn`, `eslint-plugin-unused-imports`, `eslint-plugin-react`) have ESLint 9 compatible releases. If any plugin is not yet ESLint 9 compatible, CI lint will break. Mitigation: verify plugin compatibility before the upgrade commit; use `FlatCompat` as a bridge if any plugin lags behind.
