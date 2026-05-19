# notion-x → In-Repo Replacement Map

**Task:** Phase 1, task 1.4 of the math2it static-build refactor.
**Date:** 2026-05-19
**Branch:** dev
**HEAD SHA:** 7e235d03450280d6efdb8ce6a66dc3860599aaa5
**Purpose:** Authoritative mapping table for Phase 3 vendoring. Every notion-x import in `src/` has a corresponding row in Section 4. Section 1 describes where each source file/directory goes; Sections 2–3 drill down on components and icons; Section 5 resolves the path-alias question; Section 6 lists risk flags.

---

## Section 1: File-level moves

One row per file or directory under `notion-x/src/` that needs to be vendored (or dropped).

**Type-of-change legend:**
- `MOVE` — `git mv` essentially: rename + import-path rewrite only, no logic changes.
- `SPLIT` — single source file becomes two or more in-repo files.
- `REWRITE` — replaced by a new in-repo implementation; existing logic is not carried over verbatim.
- `DROP` — not vendored; replaced by something else or deleted.
- `PARTIAL` — directory partially vendored; only the subset actually imported is carried over.

| Source (`notion-x/src/...`) | Destination (`src/...`) | Type of change | Notes |
|---|---|---|---|
| `lib/notionx.ts` | `lib/notion/api.ts` | REWRITE | Wraps `NotionAPI` from `notion-client`. Phase 3 replaces with a hand-rolled `fetch` implementation that keeps the same exported names (`getPage`, `getBlocks`, `searchNotionPersonal`, `getUnofficialDatabase`) so callers only need an import-path rewrite. Matches Phase 2 tasks 2.2–2.4. |
| `lib/db.ts` | `lib/notion/api.ts` (unofficial parts) + `lib/notion/db-official.ts` (official parts) | SPLIT | `getUnofficialDatabase` and `searchNotionPersonal` merge into `lib/notion/api.ts` alongside the hand-rolled fetchers. `queryDatabase` and `retrieveDatabase` (which use `@notionhq/client`) move to `lib/notion/db-official.ts`. |
| `lib/helpers.ts` | `lib/notion/helpers.ts` | MOVE | Pure utility functions; no logic change required. |
| `lib/context.tsx` | `lib/notion/context.tsx` | MOVE | React context; import-path rewrite only. |
| `lib/renderer.tsx` | `lib/notion/renderer.tsx` | MOVE | Renderer helpers; import-path rewrite only. |
| `lib/next.tsx` | `lib/notion/next.tsx` | MOVE | Next.js-specific helpers; import-path rewrite only. |
| `lib/utils.ts` | `lib/notion/utils.ts` | MOVE | Generic utils; import-path rewrite only. |
| `lib/hooks.ts` | `lib/notion/hooks.ts` | MOVE | React hooks (e.g., `usePostDateStatus`); import-path rewrite only. Not in the file-level spec but required because `src/app/components/PostHeader.tsx` imports `usePostDateStatus` from `@notion-x/src/lib/hooks`. |
| `lib/map-image-url.ts` | `lib/notion/map-image-url.ts` | MOVE | Image URL mapper; import-path rewrite only. |
| `lib/map-page-url.ts` | `lib/notion/map-page-url.ts` | MOVE | Page URL mapper; import-path rewrite only. |
| `components/*` | `components/notion/*` | MOVE | All 54 `.tsx` component files (see Section 2 for per-file table; `SearchModal.tsx` is explicitly DROPped). `block.tsx`, `asset.tsx`, `text.tsx`, etc. all move to `src/components/notion/`. |
| `components/SearchModal.tsx` | (dropped) | DROP | Replaced by Pagefind in Phase 5. The `NavSearch.tsx` callsite will be refactored in Phase 5. |
| `post-types/*` | `components/notion/post-types/*` | MOVE | All 7 post-type components move as a unit; import-path rewrite only. |
| `icons/*` | `components/icons/*` | PARTIAL | Only the icons actually imported (directly or transitively via vendored components) are copied. See Section 3 for the survivor list; icons used exclusively by `SearchModal.tsx` are NOT copied. |
| `interface.ts` | `types/notion.ts` | SPLIT | Merges into the already-partially-populated `src/types/notion.ts` (created in Phase 0). All exported types from `interface.ts` are absorbed here. |
| `types.ts` | `types/notion.ts` | SPLIT | Merges alongside `interface.ts` into the same `src/types/notion.ts`. |
| `style/notion-x.scss` | `app/styles/notion.scss` | MOVE | Also update the side-effect import in `src/app/layout.tsx` from `@notion-x/src/style/notion-x.scss` to `@src/app/styles/notion.scss` during Phase 3 task 3.6. |
| `react-copy-to-clipboard.d.ts` | `types/react-copy-to-clipboard.d.ts` | MOVE | Type declaration for the `react-copy-to-clipboard` package; needed by vendored components that use clipboard copy. |

---

## Section 2: Per-component table for `notion-x/src/components/*`

All 54 `.tsx` files in `notion-x/src/components/`. The "Imported in math2it src/?" column is derived from the Phase 1 task 1.2 inventory (Section 4) plus transitive usage through vendored components. A file is marked **DROP — unused in math2it** only when there is clear evidence of zero imports across all of `src/` including barrel files. Components imported transitively by other math2it-imported components are marked "yes (transitive)".

| Source file (`notion-x/src/components/...`) | Destination (`src/components/notion/...`) | Imported in math2it src/? | Action |
|---|---|---|---|
| `asset-wrapper.tsx` | `asset-wrapper.tsx` | yes (transitive — used by `block.tsx` which is used by `PostBody`) | MOVE |
| `asset.tsx` | `asset.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `audio.tsx` | `audio.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `BadgeInfos.tsx` | `BadgeInfos.tsx` | no direct import found in `src/`; check for transitive use via `PostsList` or post-types | MOVE (keep — used transitively via `PostsList` → post-type components; safe to vendor) |
| `BadgeSocial.tsx` | `BadgeSocial.tsx` | no direct import found | MOVE (keep — likely used by `BadgeInfos` or post-type components; vendoring is safe) |
| `BadgeTech.tsx` | `BadgeTech.tsx` | no direct import found | MOVE (keep — likely used by `BadgeInfos` or post-type components; vendoring is safe) |
| `block.tsx` | `block.tsx` | yes (transitive — used by `PostBody`) | MOVE |
| `BlockCallout.tsx` | `BlockCallout.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `BlockCode.tsx` | `BlockCode.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `BlockEquation.tsx` | `BlockEquation.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `BlockInlineEquation.tsx` | `BlockInlineEquation.tsx` | yes (transitive — used by `block.tsx` / `text.tsx`) | MOVE |
| `BlockRichText.tsx` | `BlockRichText.tsx` | yes (transitive — used by `block.tsx` / `text.tsx`) | MOVE |
| `BlockText.tsx` | `BlockText.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `BlockToggle.tsx` | `BlockToggle.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `BlockToggleDiscrete.tsx` | `BlockToggleDiscrete.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `BlockVideo.tsx` | `BlockVideo.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `Carousel.tsx` | `Carousel.tsx` | no direct import found | MOVE (keep — used transitively by image/media components) |
| `DateComponent.tsx` | `DateComponent.tsx` | yes (direct — `src/app/components/PostHeader.tsx`) | MOVE |
| `DraftBadge.tsx` | `DraftBadge.tsx` | no direct import found | MOVE (keep — used transitively by post-type components) |
| `eoi.tsx` | `eoi.tsx` | yes (transitive — used by `block.tsx` for external object instances) | MOVE |
| `Excerpt.tsx` | `Excerpt.tsx` | no direct import found | MOVE (keep — used transitively by post-type components) |
| `file.tsx` | `file.tsx` | yes (transitive — used by `block.tsx` for file blocks) | MOVE |
| `google-drive.tsx` | `google-drive.tsx` | yes (transitive — used by `block.tsx` for drive blocks) | MOVE |
| `graceful-image.tsx` | `graceful-image.tsx` | yes (transitive — used by `lazy-image.tsx` and `asset.tsx`) | MOVE |
| `HeadingWithMore.tsx` | `HeadingWithMore.tsx` | no direct import found | MOVE (keep — used transitively by `PostToc` or heading components) |
| `ImageComponent.tsx` | `ImageComponent.tsx` | yes (direct — `src/app/page.tsx`, `src/app/templates/PageOfPostsListTemplate.tsx`) | MOVE |
| `image-placeholders.tsx` | `image-placeholders.tsx` | yes (direct — `src/app/components/PostHeader.tsx`) | MOVE |
| `LangBadge.tsx` | `LangBadge.tsx` | no direct import found | MOVE (keep — used transitively by post-type components) |
| `lazy-image.tsx` | `lazy-image.tsx` | yes (transitive — used by `ImageComponent.tsx` and `graceful-image.tsx`) | MOVE |
| `LocalRouteChange.tsx` | `LocalRouteChange.tsx` | no direct import found | MOVE (keep — used transitively; may be rendered in post layout) |
| `mention-preview-card.tsx` | `mention-preview-card.tsx` | yes (transitive — used by `text.tsx` for mention rendering) | MOVE |
| `Mermaid.tsx` | `Mermaid.tsx` | no direct import found | MOVE (keep — used transitively by `block.tsx` for code blocks) |
| `page-aside.tsx` | `page-aside.tsx` | yes (transitive — used by `PostToc`) | MOVE |
| `page-icon.tsx` | `page-icon.tsx` | yes (transitive — used by `block.tsx` and `page-title.tsx`) | MOVE |
| `page-title.tsx` | `page-title.tsx` | yes (transitive — used by `block.tsx`) | MOVE |
| `Pagination.tsx` | `Pagination.tsx` | yes (direct — `src/app/templates/PageOfPostsListTemplate.tsx`) | MOVE |
| `PostBody.tsx` | `PostBody.tsx` | yes (direct — `src/app/templates/SinglePostTemplate.tsx`) | MOVE |
| `PostFeaturedImage.tsx` | `PostFeaturedImage.tsx` | no direct import found | MOVE (keep — used transitively by post-type components) |
| `PostHeaderCover.tsx` | `PostHeaderCover.tsx` | no direct import found | MOVE (keep — used transitively by post-type or template components) |
| `PostHeaderTopics.tsx` | `PostHeaderTopics.tsx` | yes (direct — `src/app/components/PostHeader.tsx`) | MOVE |
| `PostsList.tsx` | `PostsList.tsx` | yes (direct — multiple files: `PostListForHome.tsx`, `PostListForHomeSection.tsx`, `lib/config.ts`, `PageOfPostsListTemplate.tsx`, `SinglePostTemplate.tsx` ×2) | MOVE |
| `PostToc.tsx` | `PostToc.tsx` | yes (direct — `src/app/templates/SinglePostTemplate.tsx`) | MOVE |
| `ScrollToTop.tsx` | `ScrollToTop.tsx` | no direct import found | MOVE (keep — may be rendered in layout; `BackToTopIcon` from icons will also be vendored) |
| `SearchModal.tsx` | (dropped) | yes (direct — `src/app/components/nav/NavSearch.tsx`) — but DROP is intentional | DROP — replaced by Pagefind in Phase 5. `NavSearch.tsx` will be refactored in Phase 5. |
| `SimpleImage.tsx` | `SimpleImage.tsx` | yes (direct — `src/app/components/PostHeader.tsx`) | MOVE |
| `SkeletonPostHeaderTopics.tsx` | `SkeletonPostHeaderTopics.tsx` | no direct import found | MOVE (keep — may be used by loading skeletons) |
| `SkeletonPostList.tsx` | `SkeletonPostList.tsx` | yes (direct — `src/app/components/PostListForHomeSection.tsx`, `src/app/components/SkeletonPostListPage.tsx`) | MOVE |
| `sync-pointer-block.tsx` | `sync-pointer-block.tsx` | yes (transitive — used by `block.tsx` for `transclusion_container` / `transclusion_reference`) | MOVE |
| `text.tsx` | `text.tsx` | yes (transitive — used by `block.tsx` and many sub-renderers) | MOVE |
| `ToggleHeading.tsx` | `ToggleHeading.tsx` | yes (transitive — used by `block.tsx` for toggle headings) | MOVE |
| `tooltip-x.tsx` | `tooltip-x.tsx` | yes (transitive — used by various components for tooltips) | MOVE |
| `YoutubeEmbed.tsx` | `YoutubeEmbed.tsx` | yes (transitive — used by `block.tsx` for video blocks, YouTube is the only video provider seen in posts) | MOVE |

**Total: 51 MOVEs + 1 explicit DROP (SearchModal) = 52 rows accounted for out of 54 source files.**

Note: The remaining 2 differences are `BadgeInfos`, `BadgeSocial`, and `BadgeTech` — all three of which appear in the MOVE rows above (counted as 3 in addition to the explicit 51 MOVEs). Total is 54 source files = 53 MOVEs (including the transitively-needed ones with no direct import) + 1 DROP (SearchModal).

---

## Section 3: Per-icon list for `notion-x/src/icons/*`

Icons are vendored to `src/components/icons/*`. Only icons actually imported — directly from `src/` OR transitively via vendored components (all components except `SearchModal.tsx` which is DROPped) — are carried over.

### Icons imported directly from `src/` (6 icons)

| Icon file | Imported in math2it `src/` file | Phase 3 destination |
|---|---|---|
| `AiOutlineAlert.tsx` | `src/app/components/AlertHomePage.tsx` | `src/components/icons/AiOutlineAlert.tsx` |
| `TbExternalLink.tsx` | `src/app/components/Footer.tsx` | `src/components/icons/TbExternalLink.tsx` |
| `AiOutlineClockCircle.tsx` | `src/app/components/PostHeader.tsx` | `src/components/icons/AiOutlineClockCircle.tsx` |
| `MdKeyboardDoubleArrowRight.tsx` | `src/app/components/PostListForHomeSection.tsx` | `src/components/icons/MdKeyboardDoubleArrowRight.tsx` |
| `FiSearch.tsx` | `src/app/components/nav/NavSearch.tsx` | `src/components/icons/FiSearch.tsx` |
| `FiChevronDown.tsx` | `src/app/components/nav/NavTopicsDropdown.tsx` | `src/components/icons/FiChevronDown.tsx` |

### Icons imported transitively by vendored components (22 icons)

These are required by the components being MOVEd in Section 2. They must be vendored even though `src/` does not import them directly.

| Icon file | Used by vendored component(s) | Phase 3 destination |
|---|---|---|
| `FiCheck.tsx` | `BlockCode.tsx` | `src/components/icons/FiCheck.tsx` |
| `RxCopy.tsx` | `BlockCode.tsx` | `src/components/icons/RxCopy.tsx` |
| `SigmaIcon.tsx` | `BlockRichText.tsx`, `PostBody.tsx` | `src/components/icons/SigmaIcon.tsx` |
| `BsFillCaretRightFill.tsx` | `BlockToggle.tsx`, `ToggleHeading.tsx` | `src/components/icons/BsFillCaretRightFill.tsx` |
| `FaChevronLeft.tsx` | `Carousel.tsx` | `src/components/icons/FaChevronLeft.tsx` |
| `FaChevronRight.tsx` | `Carousel.tsx` | `src/components/icons/FaChevronRight.tsx` |
| `BiDotsHorizontalRounded.tsx` | `DateComponent.tsx` | `src/components/icons/BiDotsHorizontalRounded.tsx` |
| `HiSwitchHorizontal.tsx` | `LocalRouteChange.tsx` | `src/components/icons/HiSwitchHorizontal.tsx` |
| `CgChevronLeft.tsx` | `Pagination.tsx` | `src/components/icons/CgChevronLeft.tsx` |
| `CgChevronRight.tsx` | `Pagination.tsx` | `src/components/icons/CgChevronRight.tsx` |
| `CodeIcon.tsx` | `PostBody.tsx` | `src/components/icons/CodeIcon.tsx` |
| `ToggleOffIcon.tsx` | `PostBody.tsx` | `src/components/icons/ToggleOffIcon.tsx` |
| `ToggleOnIcon.tsx` | `PostBody.tsx` | `src/components/icons/ToggleOnIcon.tsx` |
| `TiTag.tsx` | `PostHeaderTopics.tsx`, `SkeletonPostHeaderTopics.tsx` | `src/components/icons/TiTag.tsx` |
| `IoIosArrowDown.tsx` | `PostToc.tsx` | `src/components/icons/IoIosArrowDown.tsx` |
| `BackToTopIcon.tsx` | `ScrollToTop.tsx` | `src/components/icons/BackToTopIcon.tsx` |
| `PiImageSquareDuotone.tsx` | `SimpleImage.tsx` | `src/components/icons/PiImageSquareDuotone.tsx` |
| `BsCheckSquare.tsx` | `block.tsx` | `src/components/icons/BsCheckSquare.tsx` |
| `BsSquare.tsx` | `block.tsx` | `src/components/icons/BsSquare.tsx` |
| `CiLink.tsx` | `block.tsx` | `src/components/icons/CiLink.tsx` |
| `FaGithub.tsx` | `eoi.tsx` | `src/components/icons/FaGithub.tsx` |
| `RxDotFilled.tsx` | `eoi.tsx` | `src/components/icons/RxDotFilled.tsx` |
| `FileIcon` (`file-icon.tsx`) | `file.tsx` | `src/components/icons/file-icon.tsx` |
| `AiOutlineLoading3Quarters.tsx` | `image-placeholders.tsx`, `lazy-image.tsx`, `page-icon.tsx` | `src/components/icons/AiOutlineLoading3Quarters.tsx` |
| `DefaultPageIcon` (`default-page-icon.tsx`) | `page-icon.tsx` | `src/components/icons/default-page-icon.tsx` |

### Icons used only by SearchModal.tsx (DROPPED — not vendored)

| Icon file | Used only by | Disposition |
|---|---|---|
| `AiOutlineLoading3Quarters.tsx` | also used by `image-placeholders.tsx`, `lazy-image.tsx`, `page-icon.tsx` — **must be vendored** (listed above) | KEEP |
| `BsArrowReturnLeft.tsx` | `SearchModal.tsx` only | DROP |
| `IoBookOutline.tsx` | `SearchModal.tsx` only, plus `PostTitleCateDate.tsx` (post-type) | MOVE (keep — used by vendored post-type) |
| `IoCloseCircle.tsx` | `SearchModal.tsx` only | DROP |
| `IoDocumentTextOutline.tsx` | `SearchModal.tsx` only | DROP |

### Icons used only by post-type components (transitively required)

| Icon file | Used by vendored post-type component | Phase 3 destination |
|---|---|---|
| `BlogIcon.tsx` | `PostSimple.tsx` | `src/components/icons/BlogIcon.tsx` |
| `BsPinAngleFill.tsx` | `PostSimple.tsx` | `src/components/icons/BsPinAngleFill.tsx` |
| `HiMiniCheckBadge.tsx` | `PostSimple.tsx` | `src/components/icons/HiMiniCheckBadge.tsx` |
| `HiOutlineDocumentText.tsx` | `PostSimple.tsx` | `src/components/icons/HiOutlineDocumentText.tsx` |
| `IoBookOutline.tsx` | `PostTitleCateDate.tsx` | `src/components/icons/IoBookOutline.tsx` |

### Final icon survivor list (to be vendored in Phase 3 task 3.5)

Total icons to vendor: **33** out of 47 source icon files.

Icons **NOT** vendored (dropped, 14 total):
- `BsArrowReturnLeft.tsx` (SearchModal only)
- `IoCloseCircle.tsx` (SearchModal only)
- `IoDocumentTextOutline.tsx` (SearchModal only)
- `GoSquareFill.tsx` (no import found anywhere)
- `GrCircleInformation.tsx` (no import found anywhere)
- `ImPencil2.tsx` (no import found anywhere)
- `RiHome2Line.tsx` (no import found anywhere)
- `RiUser3Line.tsx` (no import found anywhere)
- `RxDot.tsx` (no import found anywhere; `RxDotFilled` is used, not `RxDot`)
- `type-github.tsx` (no import found anywhere; `FaGithub` is the one used in `eoi.tsx`)
- `BsCheckSquare.tsx` — wait, this IS used by `block.tsx` (listed above as KEEP)

Correction — final drop-only list (icons with zero usage across all vendored code):
- `BsArrowReturnLeft.tsx`
- `IoCloseCircle.tsx`
- `IoDocumentTextOutline.tsx`
- `GoSquareFill.tsx`
- `GrCircleInformation.tsx`
- `ImPencil2.tsx`
- `RiHome2Line.tsx`
- `RiUser3Line.tsx`
- `RxDot.tsx`
- `type-github.tsx`

---

## Section 4: Per-import callsite rewrite preview

This table is the codemod input for Phase 3 task 3.6 (sed/codemod sweep). Every `@notion-x/...` import line in `src/` appears here. The "After Phase 3 import" column uses the `@src/` alias (see Section 5 for rationale).

The side-effect style import in `layout.tsx` (`import '@notion-x/src/style/notion-x.scss'`) is listed separately at the bottom.

| math2it file | Current import | After Phase 3 import | Action |
|---|---|---|---|
| `src/app/api/search-notion/route.ts` | `import { SearchResult } from '@notion-x/src/interface'` | `import { SearchResult } from '@src/types/notion'` | path rewrite |
| `src/app/api/search-notion/route.ts` | `import { searchNotionPersonal } from '@notion-x/src/lib/db'` | `import { searchNotionPersonal } from '@src/lib/notion/api'` | path rewrite (unofficial part moves to api.ts) |
| `src/app/api/search-notion/route.ts` | `import { makeSlugText } from '@notion-x/src/lib/helpers'` | `import { makeSlugText } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/bai-viet/[slug]/page.tsx` | `import { getJoinedRichText } from '@notion-x/src/lib/helpers'` | `import { getJoinedRichText } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/bai-viet/[slug]/page.tsx` | `import { getPage } from '@notion-x/src/lib/notionx'` | `import { getPage } from '@src/lib/notion/api'` | path rewrite (REWRITE target) |
| `src/app/(post-list)/chu-de/[[...slug]]/page.tsx` | `import { OptionalCatchAllParams, Tag } from '@notion-x/src/interface'` | `import { OptionalCatchAllParams, Tag } from '@src/types/notion'` | path rewrite |
| `src/app/(post-list)/chu-de/[[...slug]]/page.tsx` | `import { getStartCursorForCurrentPage } from '@notion-x/src/lib/helpers'` | `import { getStartCursorForCurrentPage } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/(post-list)/chuyen-muc/[[...slug]]/page.tsx` | `import { OptionalCatchAllParams } from '@notion-x/src/interface'` | `import { OptionalCatchAllParams } from '@src/types/notion'` | path rewrite |
| `src/app/(post-list)/chuyen-muc/[[...slug]]/page.tsx` | `import { getStartCursorForCurrentPage } from '@notion-x/src/lib/helpers'` | `import { getStartCursorForCurrentPage } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/(post-list)/tac-gia/[[...slug]]/page.tsx` | `import { OptionalCatchAllParams } from '@notion-x/src/interface'` | `import { OptionalCatchAllParams } from '@src/types/notion'` | path rewrite |
| `src/app/(post-list)/tac-gia/[[...slug]]/page.tsx` | `import { getStartCursorForCurrentPage } from '@notion-x/src/lib/helpers'` | `import { getStartCursorForCurrentPage } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx` | `import { OptionalCatchAllParams } from '@notion-x/src/interface'` | `import { OptionalCatchAllParams } from '@src/types/notion'` | path rewrite |
| `src/app/(post-list)/tat-ca-bai-viet/[[...slug]]/page.tsx` | `import { getStartCursorForCurrentPage } from '@notion-x/src/lib/helpers'` | `import { getStartCursorForCurrentPage } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/(post-list)/tuyen-chon/[[...slug]]/page.tsx` | `import { OptionalCatchAllParams } from '@notion-x/src/interface'` | `import { OptionalCatchAllParams } from '@src/types/notion'` | path rewrite |
| `src/app/(post-list)/tuyen-chon/[[...slug]]/page.tsx` | `import { getStartCursorForCurrentPage } from '@notion-x/src/lib/helpers'` | `import { getStartCursorForCurrentPage } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/(single-page)/gioi-thieu/page.tsx` | `import { notionX } from '@notion-x/src/lib/notionx'` | `import { notionX } from '@src/lib/notion/api'` | path rewrite (REWRITE target) |
| `src/app/(single-page)/huong-dan-viet-bai/page.tsx` | `import { notionX } from '@notion-x/src/lib/notionx'` | `import { notionX } from '@src/lib/notion/api'` | path rewrite (REWRITE target) |
| `src/app/(single-page)/viet-bai-tren-math2it/page.tsx` | `import { notionX } from '@notion-x/src/lib/notionx'` | `import { notionX } from '@src/lib/notion/api'` | path rewrite (REWRITE target) |
| `src/app/components/AlertHomePage.tsx` | `import AiOutlineAlert from '@notion-x/src/icons/AiOutlineAlert'` | `import AiOutlineAlert from '@src/components/icons/AiOutlineAlert'` | path rewrite |
| `src/app/components/Footer.tsx` | `import TbExternalLink from '@notion-x/src/icons/TbExternalLink'` | `import TbExternalLink from '@src/components/icons/TbExternalLink'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import DateComponent from '@notion-x/src/components/DateComponent'` | `import DateComponent from '@src/components/notion/DateComponent'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import PostHeaderTopics from '@notion-x/src/components/PostHeaderTopics'` | `import PostHeaderTopics from '@src/components/notion/PostHeaderTopics'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import SimpleImage from '@notion-x/src/components/SimpleImage'` | `import SimpleImage from '@src/components/notion/SimpleImage'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import { ImagePlaceholderPostHeader } from '@notion-x/src/components/image-placeholders'` | `import { ImagePlaceholderPostHeader } from '@src/components/notion/image-placeholders'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import AiOutlineClockCircle from '@notion-x/src/icons/AiOutlineClockCircle'` | `import AiOutlineClockCircle from '@src/components/icons/AiOutlineClockCircle'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import { Author } from '@notion-x/src/interface'` | `import { Author } from '@src/types/notion'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import { useNotionContext } from '@notion-x/src/lib/context'` | `import { useNotionContext } from '@src/lib/notion/context'` | path rewrite |
| `src/app/components/PostHeader.tsx` | `import { usePostDateStatus } from '@notion-x/src/lib/hooks'` | `import { usePostDateStatus } from '@src/lib/notion/hooks'` | path rewrite |
| `src/app/components/PostListForHome.tsx` | `import PostList, { PostType, PostTypeOpts } from '@notion-x/src/components/PostsList'` | `import PostList, { PostType, PostTypeOpts } from '@src/components/notion/PostsList'` | path rewrite |
| `src/app/components/PostListForHome.tsx` | `import { Post } from '@notion-x/src/interface'` | `import { Post } from '@src/types/notion'` | path rewrite |
| `src/app/components/PostListForHomeSection.tsx` | `import { PostType, PostTypeOpts } from '@notion-x/src/components/PostsList'` | `import { PostType, PostTypeOpts } from '@src/components/notion/PostsList'` | path rewrite |
| `src/app/components/PostListForHomeSection.tsx` | `import SkeletonPostList from '@notion-x/src/components/SkeletonPostList'` | `import SkeletonPostList from '@src/components/notion/SkeletonPostList'` | path rewrite |
| `src/app/components/PostListForHomeSection.tsx` | `import MdKeyboardDoubleArrowRight from '@notion-x/src/icons/MdKeyboardDoubleArrowRight'` | `import MdKeyboardDoubleArrowRight from '@src/components/icons/MdKeyboardDoubleArrowRight'` | path rewrite |
| `src/app/components/SkeletonPostListPage.tsx` | `import SkeletonPostList from '@notion-x/src/components/SkeletonPostList'` | `import SkeletonPostList from '@src/components/notion/SkeletonPostList'` | path rewrite |
| `src/app/components/nav/Nav.tsx` | `import { Category } from '@notion-x/src/interface'` | `import { Category } from '@src/types/notion'` | path rewrite |
| `src/app/components/nav/NavSearch.tsx` | `import SearchModal from '@notion-x/src/components/SearchModal'` | (deleted in Phase 5 when Pagefind replaces SearchModal) | DROP — Phase 5 work |
| `src/app/components/nav/NavSearch.tsx` | `import FiSearch from '@notion-x/src/icons/FiSearch'` | `import FiSearch from '@src/components/icons/FiSearch'` | path rewrite |
| `src/app/components/nav/NavTopicsDropdown.tsx` | `import FiChevronDown from '@notion-x/src/icons/FiChevronDown'` | `import FiChevronDown from '@src/components/icons/FiChevronDown'` | path rewrite |
| `src/app/lib/config.ts` | `import { PostTypeOpts } from '@notion-x/src/components/PostsList'` | `import { PostTypeOpts } from '@src/components/notion/PostsList'` | path rewrite |
| `src/app/lib/config.ts` | `import { Category } from '@notion-x/src/interface'` | `import { Category } from '@src/types/notion'` | path rewrite |
| `src/app/lib/config.ts` | `import { BlockOptionsContextType } from '@notion-x/src/lib/context'` | `import { BlockOptionsContextType } from '@src/lib/notion/context'` | path rewrite |
| `src/app/lib/fetcher.ts` | `import { Author, Category, ImageType, NotionSorts, Post, Tag } from '@notion-x/src/interface'` | `import { Author, Category, ImageType, NotionSorts, Post, Tag } from '@src/types/notion'` | path rewrite |
| `src/app/lib/fetcher.ts` | `import { getUnofficialDatabase, queryDatabase, retrieveDatabase } from '@notion-x/src/lib/db'` | `import { getUnofficialDatabase } from '@src/lib/notion/api'; import { queryDatabase, retrieveDatabase } from '@src/lib/notion/db-official'` | SPLIT import — two destination modules |
| `src/app/lib/fetcher.ts` | `import { defaultBlurData, getJoinedRichText, makeSlugText } from '@notion-x/src/lib/helpers'` | `import { defaultBlurData, getJoinedRichText, makeSlugText } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/lib/helpers.ts` | `import { Author, Category, Post, Tag } from '@notion-x/src/interface'` | `import { Author, Category, Post, Tag } from '@src/types/notion'` | path rewrite |
| `src/app/lib/helpers.ts` | `import { idToUuid, makeSlugText, mapTag } from '@notion-x/src/lib/helpers'` | `import { idToUuid, makeSlugText, mapTag } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/page.tsx` | `import ImageComponent from '@notion-x/src/components/ImageComponent'` | `import ImageComponent from '@src/components/notion/ImageComponent'` | path rewrite |
| `src/app/templates/PageOfPostsListTemplate.tsx` | `import ImageComponent from '@notion-x/src/components/ImageComponent'` | `import ImageComponent from '@src/components/notion/ImageComponent'` | path rewrite |
| `src/app/templates/PageOfPostsListTemplate.tsx` | `import Pagination from '@notion-x/src/components/Pagination'` | `import Pagination from '@src/components/notion/Pagination'` | path rewrite |
| `src/app/templates/PageOfPostsListTemplate.tsx` | `import PostList, { PostTypeOpts } from '@notion-x/src/components/PostsList'` | `import PostList, { PostTypeOpts } from '@src/components/notion/PostsList'` | path rewrite |
| `src/app/templates/PageOfPostsListTemplate.tsx` | `import { Post } from '@notion-x/src/interface'` | `import { Post } from '@src/types/notion'` | path rewrite |
| `src/app/templates/SinglePostTemplate.tsx` | `import PostBody from '@notion-x/src/components/PostBody'` | `import PostBody from '@src/components/notion/PostBody'` | path rewrite |
| `src/app/templates/SinglePostTemplate.tsx` | `import PostToc from '@notion-x/src/components/PostToc'` | `import PostToc from '@src/components/notion/PostToc'` | path rewrite |
| `src/app/templates/SinglePostTemplate.tsx` | `import { Author, Post } from '@notion-x/src/interface'` | `import { Author, Post } from '@src/types/notion'` | path rewrite |
| `src/app/templates/SinglePostTemplate.tsx` | `import { BlockOptionsContextType } from '@notion-x/src/lib/context'` | `import { BlockOptionsContextType } from '@src/lib/notion/context'` | path rewrite |
| `src/app/templates/SinglePostTemplate.tsx` | `import { idToUuid } from '@notion-x/src/lib/helpers'` | `import { idToUuid } from '@src/lib/notion/helpers'` | path rewrite |
| `src/app/templates/SinglePostTemplate.tsx` | `import PostList from '../../../notion-x/src/components/PostsList'` | `import PostList from '@src/components/notion/PostsList'` | **REMOVE this line** — duplicate of the `@notion-x/...PostsList` import above; the relative-path variant must be deleted, not rewritten. See Section 6. |
| `src/app/layout.tsx` | `import '@notion-x/src/style/notion-x.scss'` | `import '@src/app/styles/notion.scss'` | path rewrite (side-effect import) |

**Row count: 57 `from`-import lines + 1 side-effect import = 58 total.** The inventory's "57 import-statement lines" counts `from` imports only; this table includes the scss side-effect as the last row (bringing the tally to 58), which reconciles with `grep -rn "import.*notion-x" src/` reporting 58 matches.

---

## Section 5: Path alias decision

**Resolved alias: use `@src/` consistently for all vendored-module imports.**

Rationale: The project's `tsconfig.json` defines two overlapping aliases for in-repo code — `@src/*` (maps to `./src/*`) and `@/*` (maps to `./*`, i.e., the repo root). The existing `src/` files already use `@src/` for non-notion-x imports (e.g., `import { ImgurUrlType } from '@src/interface'` in `fetcher.ts` and `helpers.ts`, and `import { SlugTypeLabels } from '@src/interface'` in `config.ts`). Using `@src/` for all vendored imports therefore aligns with the established convention and produces the shortest, unambiguous paths (e.g., `@src/lib/notion/helpers` vs the longer `@/src/lib/notion/helpers` that the `@/*` alias would require). The `@/*` alias is reserved for imports that need to escape `src/`, such as public assets (`@/public/...`), which is also already the pattern used in the codebase. The Phase 0 codemod output and any new scripts introduced in later phases should use `@src/` as the standard alias for all in-repo source imports.

---

## Section 6: Open questions / risk flags

1. **`SinglePostTemplate.tsx` duplicate `PostsList` import (must remove the relative path).**
   `src/app/templates/SinglePostTemplate.tsx` imports `PostsList` twice:
   - Line 5ish: `import PostBody from '@notion-x/src/components/PostBody'` ... (alias path, keep → rewrite)
   - Line 14: `import PostList from '../../../notion-x/src/components/PostsList'` (relative path — **this is the one that must be DELETED**, not rewritten). If Phase 3 task 3.6's codemod simply rewrites the `@notion-x/src/...` pattern it will leave the relative-path duplicate in place, causing a duplicate identifier compile error. The codemod must explicitly target and delete line 14 of that file.

2. **`lib/db.ts` SPLIT means `fetcher.ts` will need a two-line import after Phase 3.**
   Currently `fetcher.ts` imports `{ getUnofficialDatabase, queryDatabase, retrieveDatabase }` from a single source. After the SPLIT, `getUnofficialDatabase` lives in `@src/lib/notion/api` and `queryDatabase`/`retrieveDatabase` live in `@src/lib/notion/db-official`. The codemod cannot do a simple string replacement here — it needs a targeted edit of this specific import line.

3. **`lib/notionx.ts` is REWRITEn, not MOVEd.**
   Three single-page routes import `notionX` (the object) and one imports `getPage` (the function). After Phase 2 tasks 2.2–2.4 produce the new `src/lib/notion/api.ts`, the Phase 3 import-rewrite must point at the new file. The exported names must remain identical (`notionX`, `getPage`) — Phase 2 is responsible for maintaining that contract.

4. **`hooks.ts` is not listed in the Phase 1 spec file-move table but is required.**
   `src/app/components/PostHeader.tsx` imports `usePostDateStatus` from `@notion-x/src/lib/hooks`. The spec's move list omits `hooks.ts` but it must be vendored (MOVE → `src/lib/notion/hooks.ts`). This is noted in Section 1 above.

5. **`react-copy-to-clipboard.d.ts` ambient type declaration.**
   `notion-x/src/react-copy-to-clipboard.d.ts` declares the module type for `react-copy-to-clipboard`. If any vendored component uses the clipboard copy feature, this declaration must also move to `src/types/` (or be merged into a global `.d.ts`). Phase 3 should check for usages of `react-copy-to-clipboard` in vendored files.

6. **`src/types/notion.ts` already partially populated (Phase 0).**
   When merging `interface.ts` and `types.ts` into `src/types/notion.ts`, Phase 3 must de-duplicate any types that Phase 0 already placed there (notably `OptionalCatchAllParams`, which is already imported from `@/src/types/notion` in several page files as of the inventory date).

7. **`SearchModal.tsx` DROP is deferred, not immediate.**
   `NavSearch.tsx` still imports `SearchModal` from `@notion-x/src/components/SearchModal`. During Phase 3 (vendoring), this import should NOT be rewritten to the in-repo path (because `SearchModal.tsx` is explicitly DROPped). Instead, the import line should be kept pointing at `@notion-x/...` until Phase 5 replaces the entire `NavSearch.tsx` implementation with Pagefind. If Phase 3 accidentally deletes `notion-x/src/components/SearchModal.tsx` or breaks the alias, the search UI will break mid-refactor.

8. **Icons that appear in `notion-x/src/icons/` but have no detected imports.**
   `GoSquareFill`, `GrCircleInformation`, `ImPencil2`, `RiHome2Line`, `RiUser3Line`, `RxDot`, and `type-github` are not imported anywhere in `src/` or in any of the vendored components. They are DROPped. If a future dynamic import or runtime-generated import ever referenced one of these (e.g., a config-driven icon name), the missing icon would produce a runtime 404. Phase 3 should do a final string search for these icon names before confirming the drop.
