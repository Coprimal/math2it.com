export type SiteTheme = 'dark' | 'light'

export type EnvMode = 'dev' | 'prod'

export type NotionTagData = {
  id: string
  name: string
  color: string
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
    tag?: {
      multi_select: NotionTagData[]
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
    finalModified: { formula: { date: { start } } }
    categories: { multi_select: { name: string }[] }
    tag: { multi_select: NotionTagData[] }
    authors: { relation: { id: string }[] }
    selected: { checkbox: boolean }
    bookCover: BookCoverProperty
    slug: { rich_text: { plain_text: string }[] }
    contentCheck?: { checkbox: boolean }
  }
}

export type ImgurUrlType = 't' | 'm' | 'l' | 'h'
