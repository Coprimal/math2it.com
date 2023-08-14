import {
  defaultCategoryBgColor,
  defaultCategoryTextColor,
  defaultCustomSizeFM,
  getSlugPrefix,
  predefinedCategories
} from '@app/lib/config'
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import { ImgurUrlType, NotionAuthor, SlugTypeLabels } from '@src/interface'
import fs from 'fs'
import { intersectionWith } from 'lodash'
import { makeSlugText } from 'notion-nextjs-lib/dist/helpers/helpers'
import { Author, Category, Post, Tag } from 'notion-nextjs-lib/dist/interface'
import path from 'path'

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
 * @param ignoreImgType in case we don't want to add "type" to the url of certain images
 */
export const parseImgurUrl = (opts: {
  url: string
  type?: ImgurUrlType
  ignoreImgType?: string
}) => {
  if (!opts.url || !opts.type || !opts.url.includes('imgur')) return opts.url
  // If url is a gif or png, return the original url
  if (opts.url.includes('.gif') || (opts.ignoreImgType && opts.url.includes(opts.ignoreImgType))) {
    return opts.url
  }
  // return url + type
  return opts.url.replace(/(\.\w+$)/, `${opts.type}$1`)
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
        property: 'tag',
        multi_select: {
          contains: data?.name
        }
      }
    case 'selected':
      return {
        property: 'selected',
        checkbox: {
          equals: true
        }
      }
    default:
      return null
  }
}

/**
 * Filter to be used in getPosts(). Remark, we ignore single page (where isPage = true on Notion)
 *
 * getFull: true -> force to get all posts, otherwise, depending on ENV_MODE, we will get only
 * the posts that are updated after the last update (fact: that's why we name it "getFull" instead of
 * "getNewest").
 */
export function getFilter(filter?: any, getFull?: boolean): QueryDatabaseParameters['filter'] {
  const defaultFilter = [] as any[]

  // Only consider the posts that are updated after the last update
  if (!getFull) {
    try {
      const filePath = path.join(process.cwd(), '..', 'math2it-v-nextjs-html', 'lastUpdate.txt')
      const dateFromFile = fs.readFileSync(filePath, 'utf8')
      if (dateFromFile && process.env.ENV_MODE === 'prod') {
        const lastUpdate = new Date(dateFromFile).toISOString()
        defaultFilter.push({
          timestamp: 'last_edited_time',
          last_edited_time: {
            after: lastUpdate
          }
        })
      }
    } catch (error) {
      console.log('🚧 There is no lastUpdate.txt file!')
    }
  }

  // Ignore single page
  defaultFilter.push({
    property: 'isPage',
    checkbox: {
      equals: false
    }
  })
  // Ignore sandbox posts in production
  if (process.env.ENV_MODE === 'prod' || process.env.ENV_MODE === 'prodFull') {
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

export function generateMetaTitle(title: string) {
  return `${title} | Math2IT`
}

export function getRelatedPosts(allPosts: Post[], post: Post, numPost: number): Post[] {
  const postCategory = post.categories?.[0]?.name
  const filteredPosts = postCategory
    ? allPosts.filter(
        p => p.categories?.map(c => c.name)?.includes(postCategory) && p.id !== post.id
      )
    : allPosts.filter(p => p.id !== post.id)

  // Get a random numPosts posts
  if (filteredPosts.length > numPost) {
    const randomPosts: Post[] = []
    while (randomPosts.length < numPost) {
      const randomPost = filteredPosts[Math.floor(Math.random() * filteredPosts.length)]
      if (!randomPosts.includes(randomPost)) {
        randomPosts.push(randomPost)
      }
    }
    return randomPosts
  }

  return []
}
