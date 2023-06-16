import defaultBook from '@root/public/featured-images/book_bg.png'
import _defaultFeaturedImage from '@root/public/featured-images/default_bg.png'
import defaultEdu from '@root/public/featured-images/edu_bg.png'
import defaultMath from '@root/public/featured-images/math_bg.png'
import defaultTech from '@root/public/featured-images/tech_bg.png'
import defaultTool from '@root/public/featured-images/tool_bg.png'
import defaultTranslate from '@root/public/featured-images/translate_bg.png'
import { Category, EnvMode, SlugTypeLabels } from '@src/interface'

export const usePlaceholder = false // use placeholder for cover images?
export const defaultBlurDataURL =
  'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC' +
  'AAAAC0lEQVR42mN8XA8AAksBZG7LpHYAAAAASUVORK5CYII='
export const homeOgImageUrl = ''
// 👇 ❗❗ Shouldn't change this! Otherwise, change the "next_cursor" list in the
// later of this file as well. Read more in the "next_cursor" section!
// export const numPostsPerPage = 20
export const numPostsPerPage = 5 // ###Thi <- Change this
// 👇 Don't change this! By default, notion's page_size is 100, but we only need 10
export const defaultNumPostsRequest = 10

// Single post settings
export const postWidthContainer = 'max-w-3xl'
export const paragraphSpacing = 'mb-4'

export const defaultCategoryBgColor = '#eee'
export const defaultCategoryTextColor = '#222'
export const defaultCodeLanguage = 'typescript'

export const minNumHeadingsToShowToc = 4 // from this number of headings, show toc
export const mathFontSize = 'text-base'

export const defaultFeaturedImage = _defaultFeaturedImage

/**
 * NOTION
 */
export const notionMaxRequest = 100
export const ENV_MODE = (process.env.ENV_MODE || 'dev') as EnvMode
export const NOTION_DB_POSTS = process.env.NOTION_DB_POSTS as string
export const NOTION_DB_AUTHORS = process.env.NOTION_DB_AUTHORS as string
export const NOTION_DB_TAGS = process.env.NOTION_DB_TAGS as string
export const NOTION_TOKEN = process.env.NOTION_TOKEN as string
export const NOTION_VERSION = process.env.NOTION_VERSION as string
// 👇 Read this: https://github.com/NotionX/react-notion-x#private-pages
export const NOTION_ACTIVE_USER = process.env.NOTION_ACTIVE_USER as string
export const NOTION_TOKEN_V2 = process.env.NOTION_TOKEN_V2 as string

// 👇 It's used to sort posts by date
export const notionDateName = 'finalCreatedDate'

// Notion Posts defautl
export const defaultPostTitle = 'Không tựa đề'
export const defaultPostExcerpt = 'Một bài viết trên Math2IT'
export const defaultPostDate = new Date().toISOString().split('T')[0]

// Custom sizes for featured images
export const defaultCustomSizeFM = '(max-width: 400px) 100vw, 400px'
export const postListCustomSizeFM = '(max-width: 500px) 100vw, 300px'
export const postCoverCustomSizeFM = `
  (min-width: 1400px) 1400px,
  (min-width: 1300px) 1300px,
  (min-width: 1200px) 1200px,
  (min-width: 1020px) 1020px,
  (min-width: 800px) 800px,
  100vw`

/**
 * Menu things
 */
export const MenuHome = {
  id: 'id-home',
  uri: '/',
  label: 'Math2IT',
  navigationItems: {
    navColor: '#ffeead',
    navIcon: 'icon-home'
  }
}
export const MenuAbout = {
  id: 'id-about',
  uri: `${getSlugPrefix('about')}`,
  label: 'Giới thiệu',
  navigationItems: {
    navColor: '#ff8094',
    navIcon: 'icon-math2it'
  }
}
export const MENUS = [
  {
    id: 'id-toan-hoc',
    uri: '/chuyen-muc/toan-hoc/',
    label: 'Toán học',
    navigationItems: {
      navColor: '#72b5fb',
      navIcon: 'icon-pi-outline'
    }
  },
  {
    id: 'id-cong-nghe',
    uri: '/chuyen-muc/cong-nghe/',
    label: 'Công nghệ',
    navigationItems: {
      navColor: '#f5c175',
      navIcon: 'icon-cog-alt'
    }
  },
  {
    id: 'id-bai-dich',
    uri: '/chuyen-muc/bai-dich/',
    label: 'Bài dịch',
    navigationItems: {
      navColor: '#d6baff',
      navIcon: 'icon-language'
    }
  },
  {
    id: 'id-cong-cu',
    uri: '/chuyen-muc/cong-cu/',
    label: 'Công cụ',
    navigationItems: {
      navColor: '#ef92b1',
      navIcon: 'icon-magic'
    }
  }
]

// Below value should be the same as on Notion
export const anonymAuthor = {
  name: 'Ẩn danh',
  uri: '/tac-gia/an-danh/'
}

/**
 * Categories
 */
export const predefinedCategories: Category[] = [
  // Bài dịch
  {
    slug: 'bai-dich',
    uri: '/chuyen-muc/bai-dich/',
    name: 'Bài dịch',
    style: {
      bgColor: '#e6d6ff',
      textColor: '#6d4e99'
    },
    featuredImage: {
      staticImageData: defaultTranslate
    },
    fontello: 'icon-language'
  },
  // Công cụ
  {
    slug: 'cong-cu',
    uri: '/chuyen-muc/cong-cu/',
    name: 'Công cụ',
    style: {
      bgColor: '#ffe3e3', // old: #ffe4ee
      textColor: '#cb4242' // old: rgb(197 57 108)
    },
    featuredImage: {
      staticImageData: defaultTool
    },
    fontello: 'icon-magic'
  },
  // Công nghệ
  {
    slug: 'cong-nghe',
    uri: '/chuyen-muc/cong-nghe/',
    name: 'Công nghệ',
    style: {
      bgColor: '#ffeacc',
      textColor: '#9c763f'
    },
    featuredImage: {
      staticImageData: defaultTech
    },
    fontello: 'icon-cog-alt'
  },
  // Giáo dục
  {
    slug: 'giao-duc',
    uri: '/chuyen-muc/giao-duc/',
    name: 'Giáo dục',
    style: {
      bgColor: 'rgb(218 255 227)',
      textColor: 'rgb(36 138 59)'
    },
    featuredImage: {
      staticImageData: defaultEdu
    },
    fontello: 'icon-graduation-cap'
  },
  // Sách hay
  {
    slug: 'sach-hay',
    uri: '/chuyen-muc/sach-hay/',
    name: 'Sách hay',
    style: {
      bgColor: 'rgb(220 252 254)',
      textColor: 'rgb(9 92 98)',
      bdColor: 'rgb(180 238 243)'
    },
    featuredImage: {
      staticImageData: defaultBook
    },
    fontello: 'icon-book'
  },
  // Toán học
  {
    slug: 'toan-hoc',
    uri: '/chuyen-muc/toan-hoc/',
    name: 'Toán học',
    style: {
      bgColor: 'rgb(215 235 255)',
      textColor: '#3d78b5'
    },
    featuredImage: {
      staticImageData: defaultMath
    },
    fontello: 'icon-pi-outline'
  }
]

/**
 * Below keys are used for the unofficial notion API. We first use it to get the search results
 * from /api/search-notion.
 */
export const UNOFFICIAL_NOTION_KEYS = {
  slug: 'uGT[',
  categories: '@_E]',
  published: 'dJ\\g',
  selected: '~CxS',
  title: 'title',
  excerpt: 'VsZM',
  finalCreatedDate: 't:V?',
  boldSearchKey: '<gzkNfoUU>',
  boldSearchKeyClose: '</gzkNfoUU>'
}

export function getSlugPrefix(type: SlugTypeLabels): string {
  if (type === 'category') return 'chuyen-muc'
  if (type === 'tag') return 'chu-de'
  if (type === 'author') return 'tac-gia'
  if (type === 'all') return 'tat-ca-bai-viet'
  if (type === 'selected') return 'tuyen-chon'
  if (type === 'singlePost') return 'bai-viet'
  if (type === 'about') return 'gioi-thieu'
  if (type === 'thanks') return 'cam-on'
  if (type === 'privacy') return 'chinh-sach-bao-mat'
  if (type === 'newsletter') return 'dang-ky-nhan-bai-viet'
  if (type === 'viet-bai') return 'viet-bai-tren-math2it'
  return ''
}
