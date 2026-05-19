# ESLint 9 Lint Follow-up

**Date:** 2026-05-19
**Task:** Phase 0, task 0.6 — Peer-dep compatibility pass

## Status

ESLint 9 flat config is fully operational (`yarn lint` runs ESLint 9.39.4).
The config was migrated from `.eslintrc.mjs` (legacy format) to `eslint.config.mjs` (flat config).

**ESLint config runs without fatal errors. The remaining issues are pre-existing code quality
issues in `src/app/`, not configuration problems.**

## Issues Not Fixed in Task 0.6

Running `yarn lint` (`eslint src --ext .ts,.tsx`) produces **97 problems (51 errors, 46 warnings)**
as of task 0.6 completion. These are pre-existing code issues, not introduced by the framework upgrade.

### Category breakdown

| Rule | Count | Nature |
|---|---|---|
| `unicorn/no-negated-condition` | ~5 | Pre-existing: negated `if` conditions |
| `unicorn/explicit-length-check` | ~5 | Pre-existing: `!arr.length` instead of `arr.length === 0` |
| `unicorn/prefer-string-replace-all` | ~3 | Pre-existing: `replace()` instead of `replaceAll()` |
| `prettier/prettier` | ~46 | Pre-existing: import ordering conflicts between prettier-plugin-sort-imports and actual import order |
| `react-hooks/error-boundaries` | ~5 | Pre-existing: JSX inside try/catch blocks (valid pattern for async Server Components) |
| `@typescript-eslint/no-empty-object-type` | ~2 | Pre-existing: `{}` type usage |

### Prettier import ordering conflicts

The `prettier/prettier` warnings about import order (e.g., "Insert OptionalCatchAllProps...") stem from
a conflict between `@trivago/prettier-plugin-sort-imports` and `prettier-plugin-organize-imports`.
Both plugins attempt to sort imports and produce conflicting orderings. This predates the upgrade.

**Fix plan:** Remove one of the two import-sorting prettier plugins (likely keep
`prettier-plugin-organize-imports` and remove `@trivago/prettier-plugin-sort-imports`, or vice versa).
This is a Phase 7 cleanup item.

### `react-hooks/error-boundaries` false positives

The rule flags JSX inside `try/catch` blocks in async Server Components (e.g., `gioi-thieu/page.tsx`).
This is a valid pattern in Next.js App Router async Server Components — the server renders
synchronously on the server and errors are handled differently. The rule is appropriate for
client components but is a false positive here.

**Fix plan:** Add a `// eslint-disable-next-line react-hooks/error-boundaries` comment or
configure the rule to be a warning rather than error for Server Component patterns. Phase 7 item.

### `unicorn` rule strictness

`unicorn/no-negated-condition` and `unicorn/explicit-length-check` fire on patterns that are
idiomatic in the codebase (`!arr.length`, `if (!x)`). These rules make the code more verbose.

**Fix plan:** Either disable these unicorn rules globally in the ESLint config, or run
`yarn lint --fix` to auto-fix what can be auto-fixed. Phase 7 item.

## Changes Made in Task 0.6 for ESLint

1. Created `eslint.config.mjs` (flat config format, replaces `.eslintrc.mjs`)
2. Bumped `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to `^8.0.0`
3. Bumped `eslint-plugin-unicorn` to `^64.0.0` (requires ESLint >= 9.38.0)
4. Bumped `eslint-plugin-react` to `^7.37.5` (supports ESLint 9.7+)
5. Bumped `eslint-plugin-tailwindcss` to `^3.18.3`
6. Bumped `eslint-config-prettier` to `^10.1.8`
7. Bumped `eslint-plugin-prettier` to `^5.5.5` (requires prettier@>=3)
8. Bumped `eslint-plugin-unused-imports` to `^4.4.1` (supports ESLint 9)
9. Bumped `prettier` to `^3.0.0` (required by eslint-plugin-prettier@5)
10. Bumped `prettier-plugin-tailwindcss` to `^0.8.0` (compatible with prettier@3)
11. Removed `eslint-config-react-app` (discontinued, not ESLint 9 compatible)
12. Updated `lint` script from `next lint` to `eslint src --ext .ts,.tsx`
    (per `next16-upgrade-notes.md` section 4.9: `next lint` removed in Next 16)
