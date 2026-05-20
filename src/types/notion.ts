/**
 * Centralized domain types for the math2it project.
 *
 * Domain interfaces (`Post`, `Category`, `Tag`, `Author`, …) are copied verbatim
 * from `notion-x/src/interface.ts` so that the rest of `src/` can import from a
 * single place rather than reaching into the submodule.
 *
 * Route-param helpers (`OptionalCatchAllProps`, `DynamicSegmentParamsProps`) use
 * `Promise<...>` params to match Next 15/16's async dynamic-route API — this is an
 * intentional deviation from the sync versions in `notion-x/src/interface.ts`.
 * notion-x is a git submodule; edits there would not persist in math2it commits.
 *
 * `notion-types` primitives (`Block`, `ExtendedRecordMap`, …) are re-exported as
 * type-only so the rest of the codebase has a single canonical import point.
 */

import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints'
import type { ImageProps } from 'next/image'
import { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'
import { Block } from 'notion-types'

// ---------------------------------------------------------------------------
// Re-exports from notion-types (type-only — erased at runtime)
// ---------------------------------------------------------------------------

export type {
  Block,
  CollectionInstance,
  Decoration,
  ExtendedRecordMap,
  PreviewImage,
} from 'notion-types'

// ---------------------------------------------------------------------------
// PostType / PostTypeOpts — inlined from notion-x/src/components/PostsList.tsx
// and notion-x/src/post-types/* to avoid importing from the soon-to-be-deleted
// notion-x submodule (Phase 7 drop).
// ---------------------------------------------------------------------------

export type PostType =
  | 'PostTitleCateDate'
  | 'PostCardWhiteBg'
  | 'PostCardWhiteBgBig'
  | 'PostImageBackground'
  | 'PostCardWave'
  | 'PostSimple'
  | 'PostBlogSimple'

export type CommonPostTypeOpts = {
  fontClassName?: string
  newLabel?: string
  updatedLabel?: string
  maxDaysWinthin?: number
  updatedOnLabel?: string
  addedOnLabel?: string
}

export type PostTitleCateDateOpts = {
  hideCategory?: boolean
  hideDate?: boolean
  defaultCategoryBgColor?: string
  defaultCategoryTextColor?: string
  imageProps?: Partial<ImageProps>
} & CommonPostTypeOpts

export type PostCardWhiteBgOpts = {
  hideDate?: boolean
  imageProps?: Partial<ImageProps>
} & CommonPostTypeOpts

export type PostCardWhiteBgBigOpts = {
  hideDate?: boolean
  hideAuthor?: boolean
  hideExcerpt?: boolean
  imageProps?: Partial<ImageProps>
} & CommonPostTypeOpts

export type PostImageBackgroundOpts = {
  imageProps?: Partial<ImageProps>
} & CommonPostTypeOpts

export type PostCardWaveOpts = {
  colorIndex?: number
  humanizeDate?: boolean
  draftLabel?: string
  tooltipDraftLabel?: string
} & CommonPostTypeOpts

export type PostSimpleOpts = {
  hideDate?: boolean
  customIcon?: ReactNode
  draftLabel?: string
  tooltipDraftLabel?: string
  humanizeDate?: boolean
  wellWrittenLabel?: string
  blogLabel?: string
  showPinned?: boolean
  maxDaysWinthin?: number
  autoHideAddedDate?: boolean
  hideOldDate?: boolean
} & CommonPostTypeOpts

export type PostBlogSimpleOpts = {
  colorIndex?: number
  humanizeDate?: boolean
  draftLabel?: string
  tooltipDraftLabel?: string
  autoHideAddedDate?: boolean
  tooltipLanguageLabel?: string
  hideOldDate?: boolean
} & CommonPostTypeOpts

export type PostTypeOpts =
  | PostTitleCateDateOpts
  | PostCardWhiteBgOpts
  | PostCardWhiteBgBigOpts
  | PostImageBackgroundOpts
  | PostCardWaveOpts
  | PostSimpleOpts
  | PostBlogSimpleOpts

// ---------------------------------------------------------------------------
// Route-param helpers
//
// These use Promise<...> to match Next 15/16's async dynamic-route API.
// The inner shapes match the originals in notion-x/src/interface.ts:
//   - OptionalCatchAllProps:   { params: Promise<{ slug?: string[] }> }
//   - DynamicSegmentParamsProps: { params: Promise<{ slug: string }> }
// ---------------------------------------------------------------------------

export interface OptionalCatchAllProps {
  params: Promise<{ slug?: string[] }>
}

export type OptionalCatchAllParams = { slug: string[] }

export interface DynamicSegmentParamsProps {
  params: Promise<{ slug: string }>
}

// ---------------------------------------------------------------------------
// Domain types — copied verbatim from notion-x/src/interface.ts
// ---------------------------------------------------------------------------

export type ImageType = {
  sourceUrl?: string | null
  sizes?: string
  altText?: string
  blurDataURL?: string
  width?: number
  height?: number
  staticImageData?: StaticImageData // for default featured images
  imgur?: string // image uploaded to imgur
} | null

export type Language = 'vi' | 'en' | 'fr'

export type PostHeaderType = {
  id?: string
  title: string
  description?: string
  rawTitle?: any
  featuredImage?: ImageType
  date?: string // the same as last modified date (or finalModified)
  createdDate?: string // used to display "updated" badge
  categories?: Category[]
  tags?: Tag[]
  authors?: Author[]
  selected?: boolean
  isPublished?: boolean
  bookCover?: ImageType
  isDraft?: boolean // is this post a draft?
  isPage?: boolean // is this post a page?
  // icon?: {
  //   emoji?: string
  //   img?: ImageType
  // }
  icon?: string
  pageCover?: string
  coverPosition?: number
  wellWritten?: boolean
  pinned?: boolean
  discrete?: boolean
  blog?: boolean
  hide?: boolean
  language?: Language // which language of the current post, default is 'en'
  vi?: string // slug of the Vietnamese version of the current post
  en?: string // slug of the English version of the current post
  fr?: string // slug of the French version of the current post
  notionUrl?: string // published url of the Notion page (if any)
}

export interface Post extends PostHeaderType {
  slug: string
  uri: string
  id?: string
  excerpt?: RichTextItemResponse[]
  block?: Block
}

export type Category = {
  name: string
  uri: string
  // "slug" is obligatory but we set it "optional" here because the categories taken
  // from Notion don't have slug
  slug?: string | null
  id?: string
  description?: string
  style?: {
    bgColor: string
    textColor: string
    bdColor?: string
    titleColor?: string // Used in header of category page
  }
  featuredImage?: ImageType
  fontello?: string
  backgroundClassName?: string // used for index page
}

export type Tag = {
  name: string
  longName?: string
  id?: string
  slug?: string
  uri?: string
  icon?: ImageType
  className?: string
  description?: string
  pinned?: boolean
  color?: string
}

export type Author = {
  slug?: string | null
  id: string
  name?: string | null
  uri: string
  description?: string | null
  avatarUrl?: string | null
  icon?: string | null
  role?: string | null
  email?: string | null
  website?: string | null
  posts?: Post[] | null
}
