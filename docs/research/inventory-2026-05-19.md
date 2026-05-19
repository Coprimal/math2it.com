# Inventory: Routes, revalidate values, generateStaticParams shapes, and notion-x imports

**Task:** Phase 1, task 1.2 of the math2it static-build refactor.
**Date:** 2026-05-19
**Branch:** dev
**HEAD SHA:** 7e235d03450280d6efdb8ce6a66dc3860599aaa5

---

## Section 1: Pages

| Route path (URL) | File path | `revalidate` value | `generateStaticParams` present? | `dynamicParams` value | Notes |
|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | 20 | No | absent | Static metadata; uses `getCategories()` (sync); no `notFound()`. Has `generateMetadata` via inline `metadata` export. |
| `/bai-viet/[slug]` | `src/app/bai-viet/[slug]/page.tsx` | 20 | Yes — iterates all posts from `getPosts()`, maps to `{ slug }` | absent | Uses `notFound()`, has `generateMetadata`, calls `getPage()` from `@notion-x/src/lib/notionx`. |
| `/(post-list)/chu-de/[[...slug]]` | `src/app/(post-list)/chu-de/[[...slug]]/page.tsx` | 20 | Yes — iterates all tags, then paginates each tag's posts into `{ slug: [tagSlug] }` or `{ slug: [tagSlug, 'trang', N] }` | absent | Uses `notFound()` and `redirect()`; has `generateMetadata`; imports `Tag` and `OptionalCatchAllParams` from `@notion-x/src/interface`. |
| `/(post-list)/chuyen-muc/[[...slug]]` | `src/app/(post-list)/chuyen-muc/[[...slug]]/page.tsx` | 20 | Yes — iterates predefined categories (sync `getCategories()`), paginates each category's posts | absent | Uses `notFound()` and `redirect()`; has `generateMetadata`. |
| `/(post-list)/tac-gia/[[...slug]]` | `src/app/(post-list)/tac-gia/[[...slug]]/page.tsx` | 20 | Yes — iterates all authors from `getAuthors()`, paginates each author's posts | absent | Uses `notFound()` and `redirect()`; has `generateMetadata`. |
| `/(post-list)/tat-ca-bai-viet/[[...slug]]` | `src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx` | 20 | Yes — no slug dimension; paginates all posts into `{ slug: [] }` or `{ slug: ['trang', N] }` | absent | Uses `notFound()` and `redirect()`; has `generateMetadata`. |
| `/(post-list)/tuyen-chon/[[...slug]]` | `src/app/(post-list)/tuyen-chon/[[...slug]]/page.tsx` | 20 | Yes — no slug dimension; paginates "selected" posts | absent | Uses `notFound()` and `redirect()`; has `generateMetadata`. |
| `/(single-page)/gioi-thieu` | `src/app/(single-page)/gioi-thieu/page.tsx` | 20 | No | absent | Uses `notionX.getPage(process.env.ABOUT_PAGE)`; uses `notFound()`. Static metadata via inline `metadata` export. |
| `/(single-page)/huong-dan-viet-bai` | `src/app/(single-page)/huong-dan-viet-bai/page.tsx` | 20 | No | absent | Uses `notionX.getPage(process.env.WRITING_GUIDELINES_PAGE)`; uses `notFound()`. Static metadata. |
| `/(single-page)/viet-bai-tren-math2it` | `src/app/(single-page)/viet-bai-tren-math2it/page.tsx` | absent (static) | No | absent | Uses `notionX.getPage(process.env.WRITE_WITH_US_PAGE)`; uses `notFound()`. Static metadata. No `revalidate` export. |

**Summary:** 10 page files total. 9 of 10 have `revalidate = 20`; 1 (`viet-bai-tren-math2it`) has no `revalidate` (effectively static). After Phase 6, all `revalidate` exports should be removed. 6 of 10 export `generateStaticParams`. No file sets `dynamicParams`.

---

## Section 2: Layouts and special files

| File type | Path | Notes |
|---|---|---|
| `layout.tsx` | `src/app/layout.tsx` | Root layout; `revalidate = 20`; imports `@notion-x/src/style/notion-x.scss`; sets up Nav, Footer, Google Analytics scripts. Has inline `metadata` export for robots. |
| `not-found.tsx` | `src/app/not-found.tsx` | Root 404 page; no notion-x imports; static `metadata` export. |
| `loading.tsx` | `src/app/(post-list)/chu-de/[[...slug]]/loading.tsx` | Renders `<SkeletonPostListPage />`. |
| `loading.tsx` | `src/app/(post-list)/chuyen-muc/[[...slug]]/loading.tsx` | Renders `<SkeletonPostListPage />`. |
| `loading.tsx` | `src/app/(post-list)/tac-gia/[[...slug]]/loading.tsx` | Renders `<SkeletonPostListPage />`. |
| `loading.tsx` | `src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/loading.tsx` | Renders `<SkeletonPostListPage />`. |
| `loading.tsx` | `src/app/(post-list)/tuyen-chon/[[...slug]]/loading.tsx` | Renders `<SkeletonPostListPage />`. |
| `loading.tsx` | `src/app/(single-page)/gioi-thieu/loading.tsx` | Renders `<SkeletonPost hideCategories hideTags />`. |
| `loading.tsx` | `src/app/(single-page)/huong-dan-viet-bai/loading.tsx` | Renders `<SkeletonPost />`. |
| `loading.tsx` | `src/app/(single-page)/viet-bai-tren-math2it/loading.tsx` | Renders `<SkeletonPost />`. |
| `loading.tsx` | `src/app/bai-viet/[slug]/loading.tsx` | Renders `<SkeletonPost />`. |

**Files NOT present in `src/app/`:** `error.tsx`, `template.tsx`, `default.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`, `twitter-image.tsx`, `route.ts` (at root).

---

## Section 3: API routes

| Path | HTTP methods | What it does | Caller(s) in src/ |
|---|---|---|---|
| `/api/search-notion` | `POST`, `OPTIONS` | Proxies a full-text search against the Notion unofficial API (`searchNotionPersonal`), filters by published status, and returns a parsed `SearchResult[]` array with highlighted snippets. | `src/app/components/nav/NavSearch.tsx` (passes URL `"/api/search-notion"` to the `<SearchModal>` component). |

Confirmed: only one API route exists.

---

## Section 4: notion-x / notion-client / notion-types / notion-utils / react-notion-x imports

All import-statement lines in `src/` referencing these packages. Grouped by importing file.

### `src/app/api/search-notion/route.ts` (3 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `SearchResult` |
| `@notion-x/src/lib/db` | `searchNotionPersonal` |
| `@notion-x/src/lib/helpers` | `makeSlugText` |

### `src/app/bai-viet/[slug]/page.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/lib/helpers` | `getJoinedRichText` |
| `@notion-x/src/lib/notionx` | `getPage` |

### `src/app/(post-list)/chu-de/[[...slug]]/page.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `OptionalCatchAllParams`, `Tag` |
| `@notion-x/src/lib/helpers` | `getStartCursorForCurrentPage` |

### `src/app/(post-list)/chuyen-muc/[[...slug]]/page.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `OptionalCatchAllParams` |
| `@notion-x/src/lib/helpers` | `getStartCursorForCurrentPage` |

### `src/app/(post-list)/tac-gia/[[...slug]]/page.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `OptionalCatchAllParams` |
| `@notion-x/src/lib/helpers` | `getStartCursorForCurrentPage` |

### `src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `OptionalCatchAllParams` |
| `@notion-x/src/lib/helpers` | `getStartCursorForCurrentPage` |

### `src/app/(post-list)/tuyen-chon/[[...slug]]/page.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `OptionalCatchAllParams` |
| `@notion-x/src/lib/helpers` | `getStartCursorForCurrentPage` |

### `src/app/(single-page)/gioi-thieu/page.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/lib/notionx` | `notionX` |

### `src/app/(single-page)/huong-dan-viet-bai/page.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/lib/notionx` | `notionX` |

### `src/app/(single-page)/viet-bai-tren-math2it/page.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/lib/notionx` | `notionX` |

### `src/app/components/AlertHomePage.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/icons/AiOutlineAlert` | default (`AiOutlineAlert`) |

### `src/app/components/Footer.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/icons/TbExternalLink` | default (`TbExternalLink`) |

### `src/app/components/PostHeader.tsx` (8 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/DateComponent` | default (`DateComponent`) |
| `@notion-x/src/components/PostHeaderTopics` | default (`PostHeaderTopics`) |
| `@notion-x/src/components/SimpleImage` | default (`SimpleImage`) |
| `@notion-x/src/components/image-placeholders` | `ImagePlaceholderPostHeader` |
| `@notion-x/src/icons/AiOutlineClockCircle` | default (`AiOutlineClockCircle`) |
| `@notion-x/src/interface` | `Author` |
| `@notion-x/src/lib/context` | `useNotionContext` |
| `@notion-x/src/lib/hooks` | `usePostDateStatus` |
| `notion-types` | `ExtendedRecordMap` |
| `notion-utils` | `getTextContent` |

### `src/app/components/PostListForHome.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/PostsList` | default (`PostList`), `PostType`, `PostTypeOpts` |
| `@notion-x/src/interface` | `Post` |

### `src/app/components/PostListForHomeSection.tsx` (3 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/PostsList` | `PostType`, `PostTypeOpts` |
| `@notion-x/src/components/SkeletonPostList` | default (`SkeletonPostList`) |
| `@notion-x/src/icons/MdKeyboardDoubleArrowRight` | default (`MdKeyboardDoubleArrowRight`) |

### `src/app/components/SkeletonPostListPage.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/SkeletonPostList` | default (`SkeletonPostList`) |

### `src/app/components/nav/Nav.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `Category` |

### `src/app/components/nav/NavSearch.tsx` (2 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/SearchModal` | default (`SearchModal`) |
| `@notion-x/src/icons/FiSearch` | default (`FiSearch`) |

### `src/app/components/nav/NavTopicsDropdown.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/icons/FiChevronDown` | default (`FiChevronDown`) |

### `src/app/lib/config.ts` (3 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/PostsList` | `PostTypeOpts` |
| `@notion-x/src/interface` | `Category` |
| `@notion-x/src/lib/context` | `BlockOptionsContextType` |

### `src/app/lib/fetcher.ts` (4 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `Author`, `Category`, `ImageType`, `NotionSorts`, `Post`, `Tag` |
| `@notion-x/src/lib/db` | `getUnofficialDatabase`, `queryDatabase`, `retrieveDatabase` |
| `@notion-x/src/lib/helpers` | `defaultBlurData`, `getJoinedRichText`, `makeSlugText` |
| `notion-types` | `CollectionInstance` |

### `src/app/lib/helpers.ts` (3 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/interface` | `Author`, `Category`, `Post`, `Tag` |
| `@notion-x/src/lib/helpers` | `idToUuid`, `makeSlugText`, `mapTag` |
| `notion-types` | `Block` |

### `src/app/page.tsx` (1 import)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/ImageComponent` | default (`ImageComponent`) |

### `src/app/layout.tsx` (1 import — side-effect)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/style/notion-x.scss` | (side-effect import, no named symbols) |

### `src/app/templates/PageOfPostsListTemplate.tsx` (4 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/ImageComponent` | default (`ImageComponent`) |
| `@notion-x/src/components/Pagination` | default (`Pagination`) |
| `@notion-x/src/components/PostsList` | default (`PostList`), `PostTypeOpts` |
| `@notion-x/src/interface` | `Post` |

### `src/app/templates/SinglePostTemplate.tsx` (7 imports)

| Import source | Specific symbols imported |
|---|---|
| `@notion-x/src/components/PostBody` | default (`PostBody`) |
| `@notion-x/src/components/PostToc` | default (`PostToc`) |
| `@notion-x/src/interface` | `Author`, `Post` |
| `@notion-x/src/lib/context` | `BlockOptionsContextType` |
| `@notion-x/src/lib/helpers` | `idToUuid` |
| `../../../notion-x/src/components/PostsList` | default (`PostList`) — **relative path import** (duplicate of `@notion-x/...PostsList`; likely a leftover that should be unified) |
| `notion-types` | `ExtendedRecordMap`, `PageBlock` |
| `notion-utils` | `getPageTableOfContents` |

---

### Import count summary

- **Total notion-x imports in src/:** 57 import-statement lines (`@notion-x/...` + 1 relative `../../../notion-x/...` + 1 style side-effect = 59 lines match `grep "notion-x"` in import context; raw `grep -rn notion-x src/ | wc -l` = 62, difference accounts for 3 comment lines in `src/types/notion.ts`).
- **Total notion-client imports in src/:** 0 (target after Phase 7: 0)
- **Total notion-types imports in src/:** 5 (`notion-types` used in `PostHeader.tsx`, `fetcher.ts`, `helpers.ts`, `SinglePostTemplate.tsx` ×2 symbols) — kept after Phase 7.
- **Total notion-utils imports in src/:** 3 (`notion-utils` used in `PostHeader.tsx`, `SinglePostTemplate.tsx` ×1 each, and `helpers.ts` via `getPageTableOfContents` in `SinglePostTemplate.tsx`) — kept after Phase 7.
- **Total react-notion-x imports in src/:** 0 (target after Phase 7: 0)

---

## Section 5: Cross-check vs Phase 1 task 4 (replacement map)

All 57 notion-x import lines in `src/` (comprising `@notion-x/src/components/*`, `@notion-x/src/icons/*`, `@notion-x/src/interface`, `@notion-x/src/lib/*`, `@notion-x/src/style/*`, and one relative `../../../notion-x/src/components/PostsList`) will need to be remapped during Phase 3 (vendoring). Task 1.4 will produce the per-import mapping table — the replacement targets are defined in the Phase 1 spec (components → `src/components/notion/*`, lib files → `src/lib/notion/<same-name>.ts`, interface/types → `src/types/notion.ts`, icons → `src/components/icons/*`, style → `src/app/styles/notion.scss`, `SearchModal` dropped for Pagefind). This inventory is the authoritative source list for that mapping work.

---

## Section 6: Snapshot metadata

- **Git branch at time of inventory:** dev
- **Git HEAD SHA at time of inventory:** `7e235d03450280d6efdb8ce6a66dc3860599aaa5`
- **Date:** 2026-05-19
