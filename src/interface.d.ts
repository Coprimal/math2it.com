import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints'

export type SiteTheme = 'dark' | 'light'

export type EnvMode = 'dev' | 'prod'

export type MenuItem = {
  id: string
  uri: string
  label: string
  navigationItems: {
    navColor: string
    navIcon: string
  }
}

export type ImageType = {
  sourceUrl?: string | null
  sizes?: string
  altText?: string
  blurDataURL?: string
  width?: number
  height?: number
  staticImageData?: StaticImageData // for default featured images
} | null

export type OptionalCatchAllProps = { params: OptionalCatchAllParams }
export type OptionalCatchAllParams = { slug: string[] }
export type DynamicSegmentParamsProps = { params: DynamicSegmentParams }
export type DynamicSegmentParams = { slug: string }

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
}

export type Tag = {
  id: string
  name: string
  uri: string
  slug: string | null
  description?: string | null
}

export type PostAndPageACF = {
  excerpt?: string
}

export type PostHeaderType = {
  title: string
  date?: string
  categories?: Category[]
  tags?: Tag[]
  authors?: Author[]
  selected?: boolean
  featuredImage: ImageType
  bookCover?: ImageType
  showToc?: boolean
}

export interface Post extends PostHeaderType {
  slug: string
  id?: string
  uri: string
  excerpt?: RichTextItemResponse[]
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

export type Page = {
  id?: string
  title: string
  uri: string
  slug?: string
}

export type NotionSorts = {
  property: string
  direction: 'ascending' | 'descending'
}

export type SlugTypeLabels =
  | 'author'
  | 'category'
  | 'tag'
  | 'selected'
  | 'all'
  | 'singlePost'
  | 'about'
  | 'thanks'
  | 'privacy'
  | 'viet-bai'
  | 'newsletter'
  | 'page'
export type GroupTypeReturn = { categories: Category[] } | { tags: Tag[] } | { authors: Author[] }

/**
 * NOTION DATA
 */

export type NotionPost = {
  id: string
  created_time: string
  last_edited_time?: string
  cover?: {
    external?: {
      url: string
    }
  }
  properties?: {
    name: {
      title: { plain_text: string }[]
    }
    url: string
    categories?: {
      multi_select: { name: string }[]
    }
    tags?: {
      multi_select: { name: string }[]
    }
    author?: {
      select: { name: string }
    }
    excerpt?: {
      rich_text: { plain_text: string }[]
    }
    bookCover?: BookCoverProperty
  }
}

export type NotionAuthor = {
  id: string
  icon?: {
    emoji: string
  }
  properties: {
    role?: {
      select: { name: string }
    }
    website?: { url: string }
    avatar?: {
      files: { external: { url: string }; file: { url: string } }[]
    }
    description?: {
      rich_text: { plain_text: string }[]
    }
    email?: { email: string }
    name: { title: { plain_text: string }[] }
    slug?: { rich_text: { plain_text: string }[] }
  }
}

export type NotionTag = {
  id: string
  properties: {
    name: { title: { plain_text: string }[] }
    description: { rich_text: { plain_text: string }[] }
    slug: { rich_text: { plain_text: string }[] }
  }
}

type BookCoverProperty = {
  files: { external: { url: string }; file: { url: string } }[]
}

export type NotionHeader = {
  cover?: { external: { url: string }; file: { url: string } }
  properties: {
    name: { title: { plain_text: string }[] }
    finalCreatedDate: { formula: { date: { start } } }
    categories: { multi_select: { name: string }[] }
    tags: { relation: { id: string }[] }
    authors: { relation: { id: string }[] }
    selected: { checkbox: boolean }
    showToc: { checkbox: boolean }
    bookCover: BookCoverProperty
    slug: { rich_text: { plain_text: string }[] }
  }
}

export type AnnotationIgnoreField =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'underline'
  | 'code'
  | 'color'

export type TextIgnoreField = 'hyperlink' | AnnotationIgnoreField

export type SearchResult = {
  id: string
  title: string
  slug: string
  categoryNames: string[]
  isPublished: boolean
  isSelected: boolean
  titleHighlighted: string
  textHighlighted: string
  isBookPost: boolean
  isFake?: boolean // used to not perform the request
}

export type ImgurUrlType = 't' | 'm' | 'l' | 'h'

export type BookmarkPreview = {
  url: string
  title: string | null
  description: string | null
  favicon: string | null
  imageSrc: string | null
}
