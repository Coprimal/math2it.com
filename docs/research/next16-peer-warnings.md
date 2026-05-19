# Next 16 Peer Dependency Warnings

**Date:** 2026-05-19
**Captured from:** `yarn install` output after bumping `next@^16.2.6`, `react@^19.0.0`, `react-dom@^19.0.0`, `eslint@^9.0.0`, `eslint-config-next@^16.2.6`, `@types/react@^19.0.0`, `@types/react-dom@^19.0.0`.
**Installed versions resolved:** `next@16.2.6`, `react@19.2.6`, `react-dom@19.2.6`, `eslint@9.39.4`, `eslint-config-next@16.2.6`, `@types/react@19.2.14`, `@types/react-dom@19.2.3`.

---

## Warning 1 — `eslint-plugin-unused-imports` requires `@typescript-eslint/eslint-plugin@^6.0.0`

**Package with unmet peer:** `eslint-plugin-unused-imports@3.0.0`
**Missing peer:** `@typescript-eslint/eslint-plugin@^6.0.0`
**Observed installed version:** `@typescript-eslint/eslint-plugin@5.62.0` (pinned in `devDependencies` as `^5.59.11`)

**Root cause:** `eslint-plugin-unused-imports@3.x` requires `@typescript-eslint/eslint-plugin@^6`, but the project currently pins `@typescript-eslint/eslint-plugin` at `^5.59.11`.

**Action required (task 0.6):** Bump `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to `^7` or `^8` (both are ESLint 9 compatible). Also check `eslint-plugin-unused-imports` for a version that works with `@typescript-eslint/eslint-plugin@^8`.

---

## Warning 2 — `@typescript-eslint/*` and other ESLint plugins require `eslint@^8` (old versions)

**Packages with unmet peer:** `@typescript-eslint/eslint-plugin@5.62.0`, `@typescript-eslint/parser@5.62.0`, `eslint-plugin-react@7.33.2`, `eslint-config-react-app@7.0.1`, `eslint-plugin-unused-imports@3.0.0`
**Missing peer:** `eslint >= 8.x` (their declared peer ranges do not include `eslint@9`)
**Observed installed version:** `eslint@9.39.4`

**Details:**
- `@typescript-eslint/eslint-plugin@5.62.0` and `@typescript-eslint/parser@5.62.0` declare peer `eslint@^6.0.0 || ^7.0.0 || ^8.0.0` — does not include `^9`.
- `eslint-plugin-react@7.33.2` declares peer `eslint@^3 || ^4 || ^5 || ^6 || ^7 || ^8` — does not include `^9`.
- `eslint-config-react-app@7.0.1` declares peer `eslint@^8.0.0` — does not include `^9`.
- `eslint-plugin-unused-imports@3.0.0` declares peer `eslint@^8.0.0` — does not include `^9`.

Transitive packages also affected: `@typescript-eslint/utils@5.62.0`, `@typescript-eslint/experimental-utils@5.62.0`, `@babel/eslint-parser@7.22.15`, `eslint-plugin-flowtype@8.0.3`, `eslint-plugin-import@2.28.1`, `eslint-plugin-jest@25.7.0`, `eslint-plugin-jsx-a11y@6.7.1`, `eslint-plugin-react-hooks@4.6.0`, `eslint-plugin-testing-library@5.11.1`.

**Action required (task 0.6):**
1. Bump `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` from `^5.x` to `^8.x` (the `^8.x` releases of `@typescript-eslint` require and support `eslint@^9`).
2. Migrate ESLint configuration from `.eslintrc` legacy format to `eslint.config.js` flat config (ESLint 9 default — see Section 4.14 of `next16-upgrade-notes.md`).
3. Audit and upgrade `eslint-plugin-react`, `eslint-plugin-unicorn`, `eslint-plugin-tailwindcss`, `eslint-plugin-unused-imports` to ESLint 9 compatible releases.
4. Consider removing `eslint-config-react-app` (discontinued, CRA-oriented, not updated for ESLint 9).

---

## Warning 3 — React 19 not listed in some packages' peer ranges

**Package with unmet peer:** Multiple packages peer-requiring `react@^18` or earlier
**Missing peer:** `react` version compatible with `19.2.6`
**Observed installed version:** `react@19.2.6`

**Packages with non-overlapping ranges (direct dependencies):**
- `@giscus/react@3.0.0` — declares `react@^16 || ^17 || ^18` (does not include `^19`)
- `@headlessui/react@2.0.4` — declares `react@^18` (does not include `^19`)
- `react-copy-to-clipboard@5.1.0` — declares `react@^15.3.0 || 16 || 17 || 18` (does not include `^19`)
- `react-geopattern@2.0.0` — declares `react@^18.0.0` (does not include `^19`)
- `react-lazy-images@1.1.0` — declares `react@^15 || ^16` (does not include `^19`)
- `react-snap-carousel@0.3.2` — declares `react@^16.8.0 || ^17.0.0 || ^18.0.0` (does not include `^19`)
- `swr@2.2.4` — declares `react@^16.11.0 || ^17.0.0 || ^18.0.0` (does not include `^19`)

**Transitive packages affected:**
- `@react-aria/ssr@3.9.4`, `@react-stately/utils@3.10.1`, `@react-aria/utils@3.24.1`, `@react-types/shared@3.23.1` (via `@headlessui/react`)
- `@react-aria/focus@3.17.1`, `@react-aria/interactions@3.21.3`, `@tanstack/react-virtual@3.5.0` (via `@headlessui/react`)
- `react-intersection-observer@6.4.2`, `use-sync-external-store@1.2.0`

**Severity:** Peer-range mismatch only — these are warnings, not hard failures. Yarn resolved the install successfully. The packages are expected to be functionally compatible with React 19 at runtime (see task 0.1 Section 5 research).

**Action required (task 0.6):**
- `@giscus/react` — check for `^3.1.x` or later that explicitly lists React 19. If none, add a `resolutions` entry.
- `@headlessui/react` — upgrade to `^2.1.x` or `^2.2.x` which officially supports React 19.
- `react-copy-to-clipboard` — peer range is overly conservative; library works with React 19 (see task 0.1 research). Add to `resolutions` or upgrade.
- `react-geopattern`, `react-lazy-images`, `react-snap-carousel` — these are likely dead/removal candidates (task 0.6 / Phase 7); mark for removal audit.
- `swr` — upgrade to `swr@^3.x` which declares React 19 support.

---

## Warning 4 — `react-dom@19` not listed in some packages' peer ranges

**Package with unmet peer:** Multiple packages peer-requiring `react-dom@^18` or earlier
**Missing peer:** `react-dom` version compatible with `19.2.6`
**Observed installed version:** `react-dom@19.2.6`

**Packages with non-overlapping ranges (direct dependencies):**
- `@giscus/react@3.0.0` — declares `react-dom@^16 || ^17 || ^18`
- `@headlessui/react@2.0.4` — declares `react-dom@^18`
- `react-lazy-images@1.1.0` — declares `react-dom@^15 || ^16`

**Transitive packages affected:**
- `@tanstack/react-virtual@3.5.0` (via `@headlessui/react`) — declares `react-dom@^16.8.0 || ^17.0.0 || ^18.0.0`

**Severity:** Same as Warning 3 — peer-range mismatch only; install succeeded. Covered by same remediation plan as Warning 3 (task 0.6).

---

## Warning 5 — `react-image` missing `@babel/runtime` peer

**Package with unmet peer:** `react-image@4.1.0` (pulled in via `math2it-nextjs@workspace:.` direct dependency)
**Missing peer:** `@babel/runtime` (not declared in the root `package.json`)
**Observed installed version:** Not installed (not in `dependencies` or `devDependencies`)

**Note:** Yarn reported `YN0002: math2it-nextjs@workspace:. doesn't provide @babel/runtime (pc0491), requested by react-image`. The `@babel/runtime` package is a transitive runtime dependency required by `react-image`.

**Action required (task 0.6):** Either add `@babel/runtime` to `devDependencies` to silence this warning, or remove `react-image` entirely (it is a candidate for removal in Phase 7 — see task 0.6 list of dead deps).

---

## Summary Table

| Warning | Package | Missing Peer | Installed Version | Severity | Task |
|---|---|---|---|---|---|
| 1 | `eslint-plugin-unused-imports@3.0.0` | `@typescript-eslint/eslint-plugin@^6` | `5.62.0` | Medium | 0.6 |
| 2 | `@typescript-eslint/*@5.x`, `eslint-plugin-react@7.x`, `eslint-config-react-app@7.x`, etc. | `eslint@^8` (old ranges) | `9.39.4` | Medium — ESLint lint may fail if flat config not set up | 0.6 (ESLint migration) |
| 3 | `@giscus/react`, `@headlessui/react`, `react-copy-to-clipboard`, `react-geopattern`, `react-lazy-images`, `react-snap-carousel`, `swr` | `react@^19` | `19.2.6` | Low — runtime compatible; peer range outdated | 0.6 |
| 4 | `@giscus/react`, `@headlessui/react`, `react-lazy-images` | `react-dom@^19` | `19.2.6` | Low — runtime compatible; peer range outdated | 0.6 |
| 5 | `react-image@4.1.0` | `@babel/runtime` | not installed | Low — add to deps or remove `react-image` | 0.6 |
