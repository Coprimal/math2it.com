import { Category, EnvMode, Page } from '@src/interface'

export const usePlaceholder = false // use placeholder for cover images?
// 👇 use external plaiceholder service in case usePlaiceholder is true
export const usePlaiceholder = false
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
export const defaultFeaturedImageUrl = '/featured-images/default_bg.png'
export const defaultCodeLanguage = 'typescript'

export const minNumHeadingsToShowToc = 4 // from this number of headings, show toc
export const mathFontSize = 'text-base'

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
  uri: '/about/',
  label: 'Giới thiệu',
  navigationItems: {
    navColor: '#ff8094',
    navIcon: 'icon-math2it'
  }
}
export const MENUS = [
  {
    id: 'id-math',
    uri: '/category/math/',
    label: 'Toán học',
    navigationItems: {
      navColor: '#72b5fb',
      navIcon: 'icon-pi-outline'
    }
  },
  {
    id: 'id-it',
    uri: '/category/technology/',
    label: 'Công nghệ',
    navigationItems: {
      navColor: '#f5c175',
      navIcon: 'icon-cog-alt'
    }
  },
  {
    id: 'id-translated-articles',
    uri: '/category/translated-articles/',
    label: 'Bài dịch',
    navigationItems: {
      navColor: '#d6baff',
      navIcon: 'icon-language'
    }
  },
  {
    id: 'id-tool',
    uri: '/category/tool/',
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
  uri: '/author/an-danh/'
}

/**
 * Categories
 */
export const predefinedCategories: Category[] = [
  // Bài dịch
  {
    slug: 'translated-articles',
    uri: '/category/translated-articles/',
    name: 'Bài dịch',
    style: {
      bgColor: '#e6d6ff',
      textColor: '#6d4e99'
    },
    featureImage: {
      sourceUrl: '/featured-images/translate_bg.png',
      sizes: defaultCustomSizeFM
    },
    fontello: 'icon-language'
  },
  // Công cụ
  {
    slug: 'tool',
    uri: '/category/tool/',
    name: 'Công cụ',
    style: {
      bgColor: '#ffe3e3', // old: #ffe4ee
      textColor: '#cb4242' // old: rgb(197 57 108)
    },
    featureImage: {
      sourceUrl: '/featured-images/tool_bg.png',
      sizes: defaultCustomSizeFM
    },
    fontello: 'icon-magic'
  },
  // Công nghệ
  {
    slug: 'technology',
    uri: '/category/technology/',
    name: 'Công nghệ',
    style: {
      bgColor: '#ffeacc',
      textColor: '#9c763f'
    },
    featureImage: {
      sourceUrl: '/featured-images/tech_bg.png',
      sizes: defaultCustomSizeFM
    },
    fontello: 'icon-cog-alt'
  },
  // Giáo dục
  {
    slug: 'education',
    uri: '/category/education/',
    name: 'Giáo dục',
    style: {
      bgColor: 'rgb(218 255 227)',
      textColor: 'rgb(36 138 59)'
    },
    featureImage: {
      sourceUrl: '/featured-images/edu_bg.png',
      sizes: defaultCustomSizeFM
    },
    fontello: 'icon-graduation-cap'
  },
  // Sách hay
  {
    slug: 'book',
    uri: '/category/book/',
    name: 'Sách hay',
    style: {
      bgColor: 'rgb(220 252 254)',
      textColor: 'rgb(9 92 98)',
      bdColor: 'rgb(180 238 243)'
    },
    featureImage: {
      sourceUrl: '/featured-images/book_bg.png',
      sizes: defaultCustomSizeFM
    },
    fontello: 'icon-book'
  },
  // Toán học
  {
    slug: 'math',
    uri: '/category/math/',
    name: 'Toán học',
    style: {
      bgColor: 'rgb(215 235 255)',
      textColor: '#3d78b5'
    },
    featureImage: {
      sourceUrl: '/featured-images/math_bg.png',
      sizes: defaultCustomSizeFM
    },
    fontello: 'icon-pi-outline'
  }
]

/**
 * Pages
 */
export const singlePages: Page[] = [
  {
    slug: 'about',
    uri: '/about/',
    title: 'Giới thiệu về Math2IT',
    id: 'about'
  },
  {
    slug: 'all',
    uri: '/all/',
    title: 'Tất cả bài viết',
    id: 'all'
  },
  {
    slug: 'thanks',
    uri: '/thanks/',
    title: 'Cảm ơn',
    id: 'thanks'
  },
  {
    slug: 'privacy',
    uri: '/privacy/',
    title: 'Quyền riêng tư',
    id: 'privacy'
  },
  {
    slug: 'viet-bai-tren-math2it',
    uri: '/viet-bai-tren-math2it/',
    title: 'Viết bài trên Math2IT',
    id: 'write'
  },
  {
    slug: 'newsletter',
    uri: '/newsletter/',
    title: 'Đăng ký nhận tin',
    id: 'newsletter'
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
