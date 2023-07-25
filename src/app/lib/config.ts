import _dImg from '@root/public/featured-images/_default.png'
import defaultBook from '@root/public/featured-images/book.png'
import defaultEdu from '@root/public/featured-images/edu.png'
import defaultMath from '@root/public/featured-images/math.png'
import defaultTech from '@root/public/featured-images/tech.png'
import defaultTool from '@root/public/featured-images/tool.png'
import defaultTranslate from '@root/public/featured-images/translate.png'
import { Category, SlugTypeLabels } from '@src/interface'

export const defaultBlurDataURL =
  'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC' +
  'AAAAC0lEQVR42mN8XA8AAksBZG7LpHYAAAAASUVORK5CYII='
// 👇 ❗❗ Shouldn't change this! Otherwise, change the "next_cursor" list in the
// later of this file as well. Read more in the "next_cursor" section!
export const numPostsPerPage = 20
// export const numPostsPerPage = 5 // ###Thi <- Change this
// 👇 Don't change this! By default, notion's page_size is 100, but we only need 10
export const defaultNumPostsRequest = 10

/**
 * Single post settings
 */
export const postWidthContainer = 'max-w-3xl'
export const paragraphSpacing = 'mb-4'
export const defaultCategoryBgColor = '#eee'
export const defaultCategoryTextColor = '#222'
export const defaultCodeLanguage = 'typescript'
export const minNumHeadingsToShowToc = 4 // from this number of headings, show toc
export const mathFontSize = 'text-base'
export const defaultFeaturedImage = _dImg

export const notionMaxRequest = 100

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
  label: 'Trang chủ',
  navigationItems: {
    navColor: '#ffeead',
    navIcon: 'icon-home'
  }
}
export const MenuAbout = {
  id: 'id-about',
  uri: `/${getSlugPrefix('about')}/`,
  label: 'Giới thiệu',
  navigationItems: {
    navColor: '#ff8094',
    navIcon: 'icon-math2it'
  }
}
export const MENUS = [
  {
    id: 'id-toan-hoc',
    uri: `/${getSlugPrefix('category')}/toan-hoc/`,
    label: 'Toán học',
    navigationItems: {
      navColor: '#72b5fb',
      navIcon: 'icon-pi-outline'
    }
  },
  {
    id: 'id-cong-nghe',
    uri: `/${getSlugPrefix('category')}/cong-nghe/`,
    label: 'Công nghệ',
    navigationItems: {
      navColor: '#f5c175',
      navIcon: 'icon-cog-alt'
    }
  },
  {
    id: 'id-bai-dich',
    uri: `/${getSlugPrefix('category')}/bai-dich/`,
    label: 'Bài dịch',
    navigationItems: {
      navColor: '#d6baff',
      navIcon: 'icon-language'
    }
  },
  {
    id: 'id-cong-cu',
    uri: `/${getSlugPrefix('category')}/cong-cu/`,
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
  // Toán học
  {
    slug: 'toan-hoc',
    uri: `/${getSlugPrefix('category')}/toan-hoc/`,
    name: 'Toán học',
    description:
      'Những gì bạn học về Toán có ý nghĩa và liên hệ gì với thực tế? Tại sao lại có những định nghĩa, định lý Toán học được giới thiệu một cách miễn cưỡng? Ta sẽ tìm cách hiểu được các liên hệ của chúng một cách tự nhiên nhất có thể.',
    style: {
      bgColor: '#D7EBFF',
      textColor: '#3d78b5',
      titleColor: '#104d8d'
    },
    featuredImage: {
      staticImageData: defaultMath,
      imgur: 'https://i.imgur.com/oml1Oe0h.png'
    },
    fontello: 'icon-pi-outline',
    backgroundClassName: 'bg-gradient-to-b from-[#f4f8fb] to-white'
  },
  // Công nghệ
  {
    slug: 'cong-nghe',
    uri: `/${getSlugPrefix('category')}/cong-nghe/`,
    name: 'Công nghệ',
    description:
      'Những bài viết hiểu về công nghệ, công nghệ gắn liền với Toán học và hướng đến đối tượng người học cơ bản. Các bài viết sẽ tập trung vào những cách thức và tài liệu để tự học.',
    style: {
      bgColor: '#ffeacc',
      textColor: '#9c763f',
      titleColor: '#7b5319'
    },
    featuredImage: {
      staticImageData: defaultTech,
      imgur: 'https://i.imgur.com/wZuuuS9h.png'
    },
    fontello: 'icon-cog-alt',
    backgroundClassName: 'bg-gradient-to-b from-[#f9f1e5] to-white'
  },
  // Bài dịch
  {
    slug: 'bai-dich',
    uri: `/${getSlugPrefix('category')}/bai-dich/`,
    name: 'Bài dịch',
    description:
      'Rào cản ngôn ngữ là trở ngại lớn nhất với người Việt ta hiện nay. Đây là loạt bài viết thật sự hay về Toán, Tin, Giáo dục mà Math2IT lựa chọn và lược dịch cho các bạn.',
    style: {
      bgColor: '#e6d6ff',
      textColor: '#6d4e99',
      titleColor: '#3d1674'
    },
    featuredImage: {
      staticImageData: defaultTranslate,
      imgur: 'https://i.imgur.com/dgf3ZD8h.png'
    },
    fontello: 'icon-language',
    backgroundClassName: 'bg-gradient-to-b from-[#f9f6ff] to-white'
  },
  // Công cụ
  {
    slug: 'cong-cu',
    uri: `/${getSlugPrefix('category')}/cong-cu/`,
    name: 'Công cụ',
    description: 'Những thủ thuật, công cụ công nghệ hữu ích cho học tập, làm việc và cuộc sống.',
    style: {
      bgColor: '#ffe3e3', // old: #ffe4ee
      textColor: '#cb4242', // old: rgb(197 57 108),
      titleColor: '#a21b1b'
    },
    featuredImage: {
      staticImageData: defaultTool,
      imgur: 'https://i.imgur.com/d1LoRWXh.png'
    },
    fontello: 'icon-magic',
    backgroundClassName: 'bg-gradient-to-b from-[#ef92b412] to-white'
  },
  // Giáo dục
  {
    slug: 'giao-duc',
    uri: `/${getSlugPrefix('category')}/giao-duc/`,
    name: 'Giáo dục',
    description:
      'Tìm kiếm các phương pháp và ý tưởng giáo dục hay đã và đang được áp dụng trên toàn thế giới.',
    style: {
      bgColor: '#DAFFE3',
      textColor: '#248A3B',
      titleColor: '#0d4d1b'
    },
    featuredImage: {
      staticImageData: defaultEdu,
      imgur: 'https://i.imgur.com/CMiVIvwh.png'
    },
    fontello: 'icon-graduation-cap',
    backgroundClassName: 'bg-gradient-to-b from-[#54b57d24] to-white'
  },
  // Sách hay
  {
    slug: 'sach-hay',
    uri: `/${getSlugPrefix('category')}/sach-hay/`,
    name: 'Sách hay',
    description:
      'Đọc nhiều sách không biến bạn thành mọt, nó sẽ mở ra cho bạn một thế giới rộng lớn của kiến thức và ý tưởng. Math2IT xin giới thiệu đến bạn những quyển sách về Toán, Tin, Giáo dục hay và tiêu biểu nhất.',
    style: {
      bgColor: '#DCFCFE',
      textColor: '#095C62',
      bdColor: '#B4EEF3',
      titleColor: '#114b50'
    },
    featuredImage: {
      staticImageData: defaultBook,
      imgur: 'https://i.imgur.com/PB7pSADh.png'
    },
    fontello: 'icon-book',
    backgroundClassName: 'bg-gradient-to-b from-[#dcfcfe75] to-white'
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
  boldSearchKeyClose: '</gzkNfoUU>',
  bookCover: 'yw|N'
}

export function getSlugPrefix(type: SlugTypeLabels): string {
  if (type === 'category') return 'chuyen-muc'
  if (type === 'tag') return 'chu-de'
  if (type === 'author') return 'tac-gia'
  if (type === 'all') return 'tat-ca-bai-viet'
  if (type === 'selected') return 'tuyen-chon'
  if (type === 'singlePost') return 'bai-viet'
  if (type === 'about') return 'gioi-thieu'
  if (type === 'viet-bai') return 'viet-bai-tren-math2it'
  if (type === 'page') return 'trang'
  return ''
}
