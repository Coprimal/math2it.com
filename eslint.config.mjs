// ESLint flat config (ESLint 9 format)
// Migrated from .eslintrc.mjs as part of Phase 0 framework upgrade (task 0.6)
// References:
//   - https://eslint.org/docs/latest/use/configure/migration-guide
//   - https://typescript-eslint.io/getting-started/
//   - https://nextjs.org/docs/app/api-reference/config/eslint

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import eslintJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigNext from 'eslint-config-next'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import unicornPlugin from 'eslint-plugin-unicorn'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// FlatCompat is used for legacy-format plugins that don't yet export flat config
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslintJs.configs.recommended,
})

export default tseslint.config(
  // Base JS recommended rules
  eslintJs.configs.recommended,

  // TypeScript ESLint recommended rules (flat config native in @typescript-eslint@8)
  ...tseslint.configs.recommended,

  // Next.js core-web-vitals (flat config native in eslint-config-next@16)
  ...eslintConfigNext,

  // React plugin via FlatCompat (eslint-plugin-react@7 is still legacy-format)
  ...compat.extends('plugin:react/recommended'),

  // Tailwindcss plugin via FlatCompat (eslint-plugin-tailwindcss@3 is legacy-format)
  ...compat.extends('plugin:tailwindcss/recommended'),

  // Unicorn plugin (flat config native in eslint-plugin-unicorn@64)
  unicornPlugin.configs['flat/recommended'],

  // prettier must be last to override formatting rules
  prettierConfig,

  // Project-specific overrides
  {
    plugins: {
      prettier: prettierPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'import/no-unresolved': 'off',
      'jsx-a11y/accessible-emoji': 'off',
      'jsx-a11y/iframe-has-title': 'off',
      'no-const-assign': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-irregular-whitespace': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'off', // delegate to @typescript-eslint/no-unused-vars
      'prefer-const': 'warn',
      'prettier/prettier': 'warn',
      quotes: ['warn', 'single'],
      'spaced-comment': ['warn', 'always'],
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/enforces-negative-arbitrary-values': 'off',
      'tailwindcss/classnames-order': 'off',
      'max-len': [
        'warn',
        {
          code: 100,
          tabWidth: 2,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // React 17+ new JSX transform — no need to import React for JSX
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Unicorn rules that conflict with Next.js App Router API naming conventions
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: ['next-env.d.ts', 'graphql/**/*.ts', '.next/**', 'node_modules/**'],
  },
)
