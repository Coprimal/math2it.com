import {
  ENV_MODE,
  defaultCategoryBgColor,
  defaultCategoryTextColor,
  defaultCustomSizeFM,
  getSlugPrefix,
  predefinedCategories
} from '@app/lib/config'
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import {
  Author,
  Category,
  ImgurUrlType,
  NotionAuthor,
  NotionTag,
  Post,
  SlugTypeLabels,
  Tag
} from '@src/interface'
import { intersectionWith } from 'lodash'

/**
 * Convert "Nguyễn Văn Đông" to "nguyen-van-dong"
 */
export function makeSlugText(text?: string | null): string | null {
  if (!text) return null
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(':', '')
    .split(' ')
    .join('-')
    .replace(/^\/|\/$/g, '') // remove "/" at the beginning and the end
}

/**
 * We use "null" to avoid the "undefined" error when parsing to a JSON format!
 */
export function transformNotionAuthorsData(data: NotionAuthor[]): Author[] {
  if (!data || !Array.isArray(data) || !data.length) return []
  return (
    data?.map(author => {
      const properties = author?.properties || null
      const name = properties?.name?.title[0]?.plain_text || null
      const slug = properties?.slug?.rich_text[0]?.plain_text || makeSlugText(name) || null
      const uri = slug
        ? `/${getSlugPrefix('author')}/${slug}/`
        : `/${getSlugPrefix('author')}/${makeSlugText(name)}/`
      const avatarUrl =
        properties?.avatar?.files[0]?.file?.url ||
        properties?.avatar?.files[0]?.external?.url ||
        null
      const description = properties?.description?.rich_text[0]?.plain_text || null
      const icon = author?.icon?.emoji || null
      const role = properties?.role?.select.name || null
      const email = properties?.email?.email || null
      const website = properties?.website?.url || null
      const id = author.id
      return {
        id,
        name,
        uri,
        slug,
        description,
        avatarUrl,
        icon,
        role,
        email,
        website
      }
    }) || []
  )
}

export function transformNotionTagsData(data?: NotionTag[]): Tag[] {
  return (
    data?.map(tag => {
      const properties = tag?.properties || null
      const name = properties?.name?.title[0]?.plain_text
      const description = properties?.description?.rich_text[0]?.plain_text || null
      const slug = properties?.slug?.rich_text[0]?.plain_text || makeSlugText(name) || null
      const uri = `/${getSlugPrefix('tag')}/${slug}/`
      const id = tag?.id || uri
      return { id, name, uri, description, slug }
    }) || []
  )
}

export function parseAuthorsForPost(authorIdsList: string[], authorsList: Author[]): Author[] {
  return intersectionWith(authorsList, authorIdsList, (author, id) => author.id === id)
}

export function parseTagsForPost(tagIdsList: string[], tagsList: Tag[]): Tag[] {
  return intersectionWith(tagsList, tagIdsList, (tag, id) => tag.id === id)
}

/**
 * Sometimes, error "Module not found" when we call this method somewhere else.
 * Solution: Just put it inside "getStaticProps" function!
 */
export function getPredefinedCategories(categories: { name: string }[] = []): Category[] {
  if (categories?.length === 0) return []

  return categories
    .filter(cat => cat)
    .map(category => {
      const foundCategory = predefinedCategories.find(
        preCat => makeSlugText(preCat?.name) === makeSlugText(category?.name)
      )
      return foundCategory
        ? foundCategory
        : {
            slug: makeSlugText(category?.name),
            name: category!.name,
            uri: `/${getSlugPrefix('category')}/${makeSlugText(category!.name)}/`,
            style: {
              bgColor: defaultCategoryBgColor,
              textColor: defaultCategoryTextColor
            },
            featuredImage: {
              sourceUrl: '/featured-images/default_bg.png',
              sizes: defaultCustomSizeFM
            }
          }
    })
}

/**
 * Get a right format for featured image from Notion
 * Note that, depending on how we set the cover for post, we have different url formats.
 * For example:
 * - Use photos from Notion -> '/images/...'
 * - Use photos from Unsplash -> 'https://images.unsplash.com/...'
 * - Use uploaded photos -> 🚸 IGNORED AND REPLACED BY DEFAULT IMAGE 'https://xxx.amazonaws.com/...'
 */
export function parseNotionImageUrl(url?: string, pageIdWithDash?: string): string | null {
  if (!url || !pageIdWithDash) return null

  // 👇 Uploaded photos from our computer -> IGNORED
  // if (!imgUrl.startsWith('/images')) {
  //   const u = new URL(imgUrl)
  //   if (u.pathname.startsWith('/secure.notion-static.com') && u.hostname.endsWith('.amazonaws.com'))
  //     return null
  // }

  if (url.startsWith('data:')) {
    return url
  }

  // more recent versions of notion don't proxy unsplash images
  if (url.startsWith('https://images.unsplash.com')) {
    return url
  }

  if (url.startsWith('/images')) {
    url = `https://www.notion.so${url}`
    return url
  }

  try {
    const u = new URL(url)
    if (
      u.pathname.startsWith('/secure.notion-static.com') &&
      u.hostname.endsWith('.amazonaws.com')
    ) {
      if (
        u.searchParams.has('X-Amz-Credential') &&
        u.searchParams.has('X-Amz-Signature') &&
        u.searchParams.has('X-Amz-Algorithm')
      ) {
        // if the URL is already signed, then use it as-is
        return url
      } else {
        url =
          'https://www.notion.so' +
          `/image/${encodeURIComponent(url)}?table=block&id=${pageIdWithDash}`
      }
    }
  } catch {
    // ignore invalid urls
  }
  return url
}

/**
 * Imgur has an api for resizing images based on the url of the image.
 *
 * @see {@link https://api.imgur.com/models/image#thumbs Image thumbnails - Imgur API}
 *
 * @param url
 * @param type t (160x160), m (320x320), l (640x640), h (1024x1024) all the image proportions are maintained
 */
export const parseImgurUrl = (url?: string, type?: ImgurUrlType) => {
  if (!url || !type || !url.includes('imgur')) return url
  // return url + type
  return url.replace(/(\.\w+$)/, `${type}$1`)
}

/**
 * Get a right start_cursor for pagination based on current page and posts
 * @param posts
 * @param postsPerPage
 * @param currentPage
 * @returns next_cursor or `undefined` (it has to be `undefined`, not `null` because
 * Notion API doesn't accept `null` value for `start_cursor`)
 */
export function getStartCursorForCurrentPage(
  currentPage: number,
  posts: Post[],
  postsPerPage: number
): string | undefined {
  if (posts?.length === 0) return undefined
  if (currentPage === 1) return undefined
  const numPages = Math.ceil(posts.length / postsPerPage)
  if (currentPage > numPages) return undefined
  return posts[(currentPage - 1) * postsPerPage]?.id
}

export function getFilterOf(type: SlugTypeLabels, data?: Category | Tag | Author): unknown {
  switch (type) {
    case 'author':
      return {
        or: [
          {
            property: 'authors',
            relation: {
              contains: data?.id
            }
          },
          {
            property: 'authors',
            relation: {
              is_empty: true
            }
          }
        ]
      }
    case 'category':
      return {
        property: 'categories',
        multi_select: {
          contains: data?.name
        }
      }
    case 'tag':
      return {
        property: 'tags',
        relation: {
          contains: data?.id
        }
      }
    case 'selected':
      return {
        and: [
          {
            property: 'selected',
            checkbox: {
              equals: true
            }
          }
        ]
      }
    default:
      return null
  }
}

/**
 * Convert "7c2e54318e52416ca5769831454bf08d" or "7c2e5431-8e52-416c-a576-9831454bf08d"
 * to "7c2e5431-8e52-416c-a576-9831454bf08d"
 */
export function idToUuid(id: string): string | null {
  if (!id) {
    return null
  }

  id = id.split('?')[0]
  const match = id.match(/\b([a-f0-9]{32})\b/)

  if (match) {
    return `${id.slice(0, 8)}-${id.slice(8, 4 + 8)}-${id.slice(12, 4 + 12)}-${id.slice(
      16,
      4 + 16
    )}-${id.slice(20)}`
  }

  const match2 = id.match(/\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/)
  if (match2) {
    return match2[1]
  }

  return null
}

/**
 * Filter to be used in getPosts()
 */
export function getFilter(filter?: any): QueryDatabaseParameters['filter'] {
  const defaultFilter = [] as any[]
  // Ignore sandbox posts in production
  if (ENV_MODE === 'prod') {
    defaultFilter.push({
      property: 'published',
      checkbox: {
        equals: true
      }
    })
  }
  if (!filter) return { and: defaultFilter }
  if (!filter?.and)
    return {
      and: [...defaultFilter, filter]
    }
  if (filter?.and)
    return {
      and: [...defaultFilter, ...(filter?.and ?? [])]
    }
}

/**
 * Get related posts from all posts with the same category or tag. In case there are not enough
 * posts with the same category or tag, it will get random posts.
 */
export function getRelatedPosts(posts: Post[], currentPost: Post, limit = 5): Post[] {
  const relatedPosts = posts.filter(post => {
    if (post.uri === currentPost.uri) return false
    if (
      post.categories?.some(category =>
        currentPost.categories?.map(category => category.slug).includes(category.slug)
      )
    )
      return true

    if (post.tags?.some(tag => currentPost.tags?.map(tag => tag.slug).includes(tag.slug)))
      return true

    return false
  })

  // If there are not enough related posts, get random posts
  if (relatedPosts.length < limit) {
    const randomPosts = posts.filter(
      post => !relatedPosts.includes(post) && post.uri !== currentPost.uri
    )
    return relatedPosts.concat(randomPosts.slice(0, limit - relatedPosts.length))
  }

  return relatedPosts.sort(() => Math.random() - 0.5).slice(0, limit)
}
