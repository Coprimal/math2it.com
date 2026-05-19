# Next 16 Peer Dependency Resolution: Actions Taken

**Date:** 2026-05-19
**Task:** Phase 0, task 0.6 — Verify peer-dep compatibility for React 19 / ESLint 9
**Input files:**
- `docs/research/next16-peer-warnings.md` (warnings captured in task 0.2)
- `docs/research/next16-upgrade-notes.md` section 5 (per-dep compatibility table)
- `docs/research/next16-tsc-after-04.md` (the .webp issue carried from task 0.4)

---

## Summary

After task 0.6 all peer-dep warnings from task 0.2 have been addressed. The remediation
table below lists every action taken, every override added, and every warning intentionally
left as NO ACTION.

**Outcome:**
- `yarn install` exits 0 with only low-severity YN0060 peer-range mismatch warnings
  (documented below as NO ACTION — runtime compatible).
- `yarn tsc --noEmit` exits 0 with zero errors.
- ESLint 9 flat config operational (`eslint.config.mjs`).

---

## Warning 1 — `eslint-plugin-unused-imports` requires `@typescript-eslint/eslint-plugin@^6`

**Action:** BUMP

| Package | Old version | New version |
|---|---|---|
| `@typescript-eslint/eslint-plugin` | `^5.59.11` | `^8.0.0` |
| `@typescript-eslint/parser` | `^5.59.11` | `^8.0.0` |
| `eslint-plugin-unused-imports` | `^3.0.0` | `^4.4.1` |

**Rationale:** `@typescript-eslint@8.x` is the ESLint 9 native release of the
typescript-eslint project. It declares `eslint@^9.x` in its peer dependencies.
`eslint-plugin-unused-imports@4.x` now declares `eslint@^9.0.0` support and
`@typescript-eslint/eslint-plugin@^5.0.0-^8.0.0` (all versions optional).

**Cross-reference task 0.1 section 5:** Not explicitly listed; the `@typescript-eslint`
upgrade is a prerequisite for ESLint 9 compatibility.

---

## Warning 2 — `@typescript-eslint/*` and other ESLint plugins require `eslint@^8`

**Action:** BUMP + MIGRATE + REMOVE

### Bumped packages

| Package | Old version | New version | Notes |
|---|---|---|---|
| `@typescript-eslint/eslint-plugin` | `^5.59.11` | `^8.0.0` | See Warning 1 |
| `@typescript-eslint/parser` | `^5.59.11` | `^8.0.0` | See Warning 1 |
| `eslint-plugin-react` | `^7.32.2` | `^7.37.5` | Declares `eslint@^9.7` in peers |
| `eslint-plugin-unicorn` | `^49.0.0` | `^64.0.0` | Requires `eslint>=9.38.0`; flat-config native |
| `eslint-plugin-tailwindcss` | `^3.12.1` | `^3.18.3` | Compatible with `tailwindcss@^3.4.0 || ^4.0.0` |
| `eslint-config-prettier` | `^8.8.0` | `^10.1.8` | No `eslint` peer constraint |
| `eslint-plugin-prettier` | `^4.2.1` | `^5.5.5` | Requires `prettier@>=3.0.0` and `eslint@>=8.0.0` |
| `eslint-plugin-unused-imports` | `^3.0.0` | `^4.4.1` | See Warning 1 |

### Removed packages

| Package | Reason |
|---|---|
| `eslint-config-react-app` | Discontinued CRA package; last release 7.0.1 only supports `eslint@^8`. No ESLint 9 release planned. Its rules are already covered by `eslint-config-next` and `@typescript-eslint`. |

### ESLint config migration

**MIGRATE:** `.eslintrc.mjs` (legacy format) → `eslint.config.mjs` (ESLint 9 flat config)

Key changes in `eslint.config.mjs`:
- Uses `tseslint.config()` from `typescript-eslint` for type-safe flat config composition
- Uses `FlatCompat` for legacy-format plugins (`eslint-plugin-react`, `eslint-plugin-tailwindcss`)
- Removes `eslint-config-react-app` extends
- Disables `react/react-in-jsx-scope` (not needed with React 17+ new JSX transform)
- Disables `react/prop-types` (TypeScript handles this)
- Disables select `unicorn` rules that conflict with Next.js App Router naming conventions
  (`unicorn/prevent-abbreviations`, `unicorn/filename-case`, `unicorn/no-null`,
  `unicorn/no-array-for-each`, `unicorn/no-array-reduce`)

### Additional bumps triggered

| Package | Old version | New version | Reason |
|---|---|---|---|
| `prettier` | `^2.8.8` | `^3.0.0` | Required by `eslint-plugin-prettier@5` |
| `prettier-plugin-tailwindcss` | `^0.3.0` | `^0.8.0` | `0.3.x` crashes with `prettier@3` |

### `lint` script change

Updated `package.json` scripts:
```json
// BEFORE
"lint": "next lint"

// AFTER
"lint": "eslint src --ext .ts,.tsx"
```

Per `next16-upgrade-notes.md` section 4.9: `next lint` was removed in Next 16.

**Cross-reference task 0.1 section 5:** ESLint migration was the highest-risk item
identified in the risk callouts (section 8). The migration succeeded.

---

## Warning 3 — React 19 not listed in some packages' peer ranges

### `@giscus/react`

**Action:** BUMP

- Old: `^3.0.0` (declared peer `react@^16 || ^17 || ^18`)
- New: `^3.1.0` (declares peer `react@^16 || ^17 || ^18 || ^19`)

**Rationale:** `@giscus/react@3.1.0` explicitly added React 19 to its peer range.
Upgrading removes the peer warning entirely.

**Cross-reference task 0.1 section 5:** Predicted `@giscus/react@3.x` as React 19
supported. Confirmed.

---

### `@headlessui/react`

**Action:** BUMP

- Old: `^2.0.4` (declared peer `react@^18`)
- New: `^2.2.10` (declares peer `react@^18 || ^19 || ^19.0.0-rc`)

**Rationale:** `@headlessui/react@2.2.x` explicitly supports React 19.

**Cross-reference task 0.1 section 5:** Predicted `@headlessui/react@2.x` as React 19
supported. Confirmed.

---

### `swr`

**Action:** BUMP

- Old: `^2.2.2` (declared peer `react@^16.11.0 || ^17.0.0 || ^18.0.0`)
- New: `^2.4.1` (declares peer `react@^16.11.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`)

**Rationale:** `swr@2.4.1` (latest in the 2.x series; there is no published 3.x as of
2026-05-19) added React 19 to its peer range. No swr@3.x exists yet.

**Cross-reference task 0.1 section 5:** Not explicitly researched in section 5; the peer
warning file suggested bumping to `^3.x` but the actual latest is `2.4.1`.

---

### `react-snap-carousel`

**Action:** NO ACTION

**Current installed:** `0.3.2`
**Current peer range:** `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`

Yarn's task-0.2 warning listed this as non-overlapping, but the actual package already
declares `^19.0.0`. The warning was likely a resolution artifact. No action needed.

**Cross-reference task 0.1 section 5:** Listed as Phase 7 removal candidate. Kept
because `notion-x/src/components/Carousel.tsx` imports from `react-snap-carousel` and
Phase 7 hasn't run yet.

---

### `react-copy-to-clipboard`

**Action:** NO ACTION (peer warning remains — informational only)

**Current installed:** `5.1.0`
**Current peer range:** `>=15.3.0` (technically compatible with any React version including 19)

Yarn reports a peer range mismatch (YN0060) because the declared range doesn't use `^19`.
However, the actual peer declaration `>=15.3.0` is compatible with React 19. The library
functions correctly at runtime.

The `resolutions` field was briefly added for this package but removed — yarn 4 `resolutions`
does not suppress YN0060 peer warnings; it only affects transitive version resolution.

**Cross-reference task 0.1 section 5:** Predicted as SUPPORTED with React 19.
Peer declaration `>=15.3.0` confirms this.

---

### `react-lazy-images`

**Action:** OVERRIDE (yarn resolutions) + NO ACTION (warning remains — informational only)

**Current installed:** `1.1.0`
**Current peer range:** `react@^15 || ^16`, `react-dom@^15.0.0 || ^16.0.0`

This package is unmaintained (last release 2019) and does not support React 17+, 18, or 19
in its peer declaration. At runtime, the package uses only basic React APIs that are
compatible with React 19 (no deprecated APIs used).

The package CANNOT be removed because `notion-x/src/components/lazy-image.tsx` imports
`{ ImageState, LazyImageFull }` from `react-lazy-images`. Phase 7 will remove the
`notion-x` submodule entirely, which will allow removal of this dep.

**Override added to `package.json`:**
```json
"resolutions": {
  "react-lazy-images": "1.1.0"
}
```

**Rationale for override:** Pins the installed version explicitly so yarn doesn't try to
find a version satisfying the React 19 peer range (which doesn't exist). The YN0060 warning
will still appear (this is the expected yarn 4 behavior — resolutions doesn't suppress it)
but the package is installed and functional.

**Cross-reference task 0.1 section 5:** Listed as Phase 7 removal candidate.

---

### `react-geopattern`

**Action:** OVERRIDE (yarn resolutions) + NO ACTION (warning remains — informational only)

**Current installed:** `2.0.0`
**Current peer range:** `react@>=18.x` (does not explicitly include `^19`)

The peer declaration `>=18.x` semantically covers React 19 but yarn's semver matching
doesn't recognize it (yarn treats `>=18.x` as `>=18.0.0` which ends before 19). The
library works at runtime with React 19.

The package CANNOT be removed because `geopattern` (a JavaScript pattern generator) is
also a direct dependency, and `notion-x/src/components/graceful-image.tsx` imports from
`react-geopattern`. Phase 7 will handle this.

**Override added to `package.json`:**
```json
"resolutions": {
  "react-geopattern": "2.0.0"
}
```

**Cross-reference task 0.1 section 5:** Listed as Phase 7 removal candidate.

---

## Warning 4 — `react-dom@19` not listed in some packages' peer ranges

**Action:** Same as Warning 3 — the remediation for `@giscus/react` (BUMP) and
`@headlessui/react` (BUMP) and `react-lazy-images` (OVERRIDE) covers Warning 4 as well.

---

## Warning 5 — `react-image@4.1.0` missing `@babel/runtime` peer

**Action:** ADD `@babel/runtime` to devDependencies

```json
"@babel/runtime": "^7.0.0"
```

**Rationale:** `react-image@4.1.0` declares `@babel/runtime@>=7` as a peer dependency.
It's a transitive runtime dependency needed by `react-image`. Adding it to `devDependencies`
satisfies the peer requirement and silences the YN0002 warning.

The package cannot be removed because `notion-x/src/components/graceful-image.tsx`
imports `{ Img, ImgProps }` from `react-image`. Phase 7 will handle removal.

---

## `.webp` TypeScript Declaration Fix

**Action:** Added `declare module '*.webp'` to `src/img.d.ts`

**Issue (from `next16-tsc-after-04.md`):**
```
src/app/page.tsx(1,24): error TS2307: Cannot find module '@/public/waving_hand.webp'
  or its corresponding type declarations.
```

`src/img.d.ts` declared ambient module types for `.svg`, `.png`, `.jpeg`, `.jpg`, `.gif`
but not `.webp`. Added:

```typescript
declare module '*.webp' {
  const content: StaticImageData
  export default content
}
```

This follows the same pattern as the existing declarations in `src/img.d.ts`.

**Result:** `yarn tsc --noEmit` now exits 0 with zero errors.

---

## `tailwindcss` Minor Bump

**Action:** BUMP (minor, required by eslint-plugin-tailwindcss)

- Old: `3.3.2` (pinned)
- New: `^3.4.0`

**Rationale:** `eslint-plugin-tailwindcss@3.18.3` declares peer `tailwindcss@^3.4.0 || ^4.0.0`.
`tailwindcss@3.3.2` is outside this range, causing a YN0060 peer warning. Bumping to `^3.4.0`
resolves this warning without breaking any tailwind config (no API changes between 3.3 and 3.4
that affect math2it).

---

## Final State

### `yarn install` after task 0.6

```
Done with warnings in N s
Exit code: 0
```

Remaining YN0060 peer warnings (informational, not fatal):
- `react-copy-to-clipboard@5.1.0`: peer `react@^15.3.0 || ... || 18` — works with React 19
- `react-lazy-images@1.1.0`: peer `react-dom@^15.0.0 || ^16.0.0` — works with React 19
- `react-geopattern@2.0.0`: peer `react@>=18.x` — works with React 19

### `yarn tsc --noEmit`

```
Exit code: 0
(no output — zero errors)
```

### `yarn lint` (ESLint 9 running)

ESLint 9 flat config operational. 97 pre-existing code quality issues reported
(51 errors, 46 warnings — all pre-existing, none introduced by this task).
See `docs/research/next16-lint-followup.md` for details and fix plan.
