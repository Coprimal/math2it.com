import defaultBookCover from '@/public/featured-images/untitledBook.jpg'
import {
  getBlocks as getNotionBlocks,
  getNotionDatabaseWithoutCache,
  getNotionPageWithoutCache,
  getPlaceholderImage,
  retrieveNotionDatabaseWithoutCache
} from '@notion-x/db'
import { getJoinedRichText, makeSlugText } from '@notion-x/helpers'
import { Author, Category, ImageType, NotionSorts, Post, Tag } from '@notion-x/interface'
import {
  ListBlockChildrenResponse,
  QueryDatabaseParameters
} from '@notionhq/client/build/src/api-endpoints'
import { ImgurUrlType, NotionPost, NotionTagData } from '@src/interface'
import { get } from 'lodash'
import { StaticImageData } from 'next/image'
import { cache } from 'react'

import {
  SINGLE_PAGE_SLUGS,
  defaultFeaturedImage,
  defaultPostDate,
  defaultPostTitle,
  getSlugPrefix,
  notionDateName,
  notionMaxRequest,
  predefinedCategories
} from './config'
import {
  getFilter,
  parseAuthorsForPost,
  parseImgurUrl,
  parseNotionImageUrl,
  transformNotionAuthorsData
} from './helpers'

/**
 * Get posts from Notion. If the requested `pageSize` is >= `notionMaxRequest`, it will
 * automatically request the next page.
 *
 * categories, tags, authors aren't required but they're required if you want to use
 * transformNotionPostsData(). They're required in case we just want to get sine basic information
 * of the posts.
 *
 * Below are some notable parameters:
 *
 * @param options.filter - (optional) beside the main filter, you can add more filters
 * @param options.startCursor - (optional) if you want to get more posts, you can pass the
 * next_cursor from the previous request.
 * @param options.pageSize - (optional) the number of posts you want to get. If you want to
 * get all available posts, you can pass `notionMaxRequest`.
 * @param options.getFull - (optional) if you want to get all posts without the filter of the last modified date
 */
export async function getPosts(options: {
  dbId: string
  categories?: Category[]
  authors?: Author[]
  filter?: unknown
  startCursor?: string
  pageSize?: number
  sorts?: NotionSorts[]
  getFull?: boolean
}): Promise<Post[]> {
  const { dbId, filter, categories, authors, startCursor, pageSize, sorts, getFull } = options

  const defaultSort = {
    property: notionDateName,
    direction: 'descending'
  } as NotionSorts
  const sortsToUse: any = sorts?.length ? sorts.push(defaultSort) : [defaultSort]
  const filterToUse = getFilter(filter, getFull)

  let data = await getNotionDatabase(dbId, filterToUse, startCursor, pageSize, sortsToUse)
  let postsList = get(data, 'results', []) as NotionPost[]

  if (data && pageSize && pageSize >= notionMaxRequest && data['has_more']) {
    let newStartCursor = startCursor
    while (data!['has_more']) {
      newStartCursor = data!['next_cursor'] as string
      data = await getNotionDatabase(dbId, filterToUse, newStartCursor, pageSize, sortsToUse)
      if (get(data, 'results')) {
        const lst = data!['results'] as any[]
        postsList = [...postsList, ...lst]
      }
    }
  }

  const posts = await transformNotionPostsData({
    data: postsList,
    categories,
    authors
  })
  return posts
}

/**
 * Depending on the filter, we can use this function to get posts by categories, tags, authors
 *
 * The categories, tags and authors are otional because sometimes, we don't need them in the return.
 */
export async function getPostsBy(options: {
  filter: unknown
  pageSize: number
  startCursor?: string
  categories?: Category[]
  authors?: Author[]
  getFull?: boolean
}) {
  const { categories, authors, filter, pageSize, startCursor, getFull } = options
  const posts = await getPosts({
    dbId: process.env.NOTION_DB_POSTS as string,
    categories,
    authors,
    filter,
    startCursor,
    pageSize,
    getFull
  })
  return posts
}

/**
 * Get all predefined categories (not from Notion database)
 */
export const getCategories = () => predefinedCategories

/**
 * Get all tags from Notion database (process.env.NOTION_DB_TAGS)
 */
export const getTags = async () => {
  if (!process.env.NOTION_DB_POSTS) throw new Error('process.env.NOTION_DB_POSTS is not defined')
  const data = await retrieveNotionDatabase(process.env.NOTION_DB_POSTS)
  return (
    data?.properties?.tag?.multi_select?.options?.map((opt: NotionTagData) => mapTag(opt)) || []
  )
}

function mapTag(tag: NotionTagData): Tag {
  return {
    id: makeSlugText(tag.name),
    name: tag.name,
    slug: makeSlugText(tag.name),
    uri: `/${getSlugPrefix('tag')}/${makeSlugText(tag.name)}/`
  }
}

/**
 * Get all authors from Notion database (process.env.NOTION_DB_AUTHORS)
 */
export const getAuthors = async () => {
  if (!process.env.NOTION_DB_AUTHORS)
    throw new Error('process.env.NOTION_DB_AUTHORS is not defined')
  const data = await getNotionDatabase(
    process.env.NOTION_DB_AUTHORS,
    undefined,
    undefined,
    notionMaxRequest
  )
  return transformNotionAuthorsData(data?.['results'] as any[])
}

/**
 * ARCHIVED: We use the information in the recordMap instead of this method
 * Get header of a single post from Notion
 *
 */
// export async function getPostHeader(pageId: string): Promise<PostHeaderType> {
//   const pageData = await getNotionPage(pageId)
//   return await transformPostHeader(pageData, pageId)
// }

/**
 * Transform Notion data to PostHeaderType
 *
 * REMARK: This method MUST be placed in this file (not in helpers.ts) because it uses
 * some methods that require the "cache()" from react.
 */
// async function transformPostHeader(
//   notionHeader: NotionHeader,
//   pageIdwithDash: string
// ): Promise<PostHeaderType> {
//   const properties = notionHeader?.properties

//   // title
//   const title = getJoinedRichText(properties?.name?.title as any) || defaultPostTitle

//   // date
//   // Because we migrate from WP to Notion, a lot of posts need to use the old created date
//   const finalCreatedDate =
//     properties?.finalCreatedDate?.formula?.date?.start || new Date().toISOString()
//   const date = new Date(finalCreatedDate).toISOString()

//   // categories
//   const categories = getPredefinedCategories(properties?.categories?.multi_select)

//   // tags
//   const tags = properties?.tag?.multi_select?.map(item => mapTag(item))

//   // authors
//   const authorIdsList = properties?.authors?.relation?.map(item => item.id) || []
//   const authorsList = await getAuthors()
//   const authors = parseAuthorsForPost(authorIdsList, authorsList)

//   // featured image
//   const sourceUrl = notionHeader?.cover?.external?.url || notionHeader?.cover?.file?.url
//   const featuredImage = await parseImage({
//     sourceUrl,
//     altText: `Ảnh đại diện cho bài viết "${title}"`,
//     category: categories[0],
//     pageIdwithDash,
//     staticImageData: defaultFeaturedImage,
//     typeImgur: 'h'
//   })

//   // selected
//   const selected = properties?.selected?.checkbox || false

//   // bookCover
//   const bookCoverUrl =
//     properties?.bookCover?.files?.[0]?.external?.url || properties?.bookCover?.files?.[0]?.file?.url
//   const bookCover = await parseImage({
//     sourceUrl: bookCoverUrl,
//     altText: `Ảnh bìa sách "${title}"`,
//     pageIdwithDash,
//     staticImageData: defaultBookCover,
//     canBeNull: true,
//     typeImgur: 'm'
//   })

//   // contentCheck
//   const contentCheck = properties?.contentCheck?.checkbox || false

//   return {
//     title,
//     date,
//     categories,
//     tags,
//     authors,
//     featuredImage,
//     selected,
//     bookCover,
//     contentCheck
//   }
// }

/**
 * Make sure that the return of this method is always an image (from Notion or from the default image)
 */
async function parseImage(options: {
  sourceUrl?: string
  altText?: string
  category?: Category
  pageIdwithDash?: string
  staticImageData?: StaticImageData // can be featured image or book cover
  canBeNull?: boolean // for book cover, we can set it to undefined
  typeImgur?: ImgurUrlType
}): Promise<ImageType> {
  const { sourceUrl, altText, category, pageIdwithDash, staticImageData, canBeNull } = options
  if (!sourceUrl && !staticImageData) return null
  const image: ImageType = { altText }

  if (!sourceUrl) {
    if (canBeNull) return null
    // If there is no featured image, we will use the default featured image of the category
    if (category && category.featuredImage?.staticImageData) {
      image.staticImageData = category.featuredImage?.staticImageData
    } else {
      // If the post has no category
      image.staticImageData = staticImageData
    }
  } else {
    const urlToUse = parseImgurUrl({ url: sourceUrl, type: options.typeImgur })
    image.sourceUrl = urlToUse
    const imgUrl = parseNotionImageUrl(urlToUse, pageIdwithDash)
    if (imgUrl) {
      const { base64, width, height } = await getPlaceholderImage(imgUrl)
      image.blurDataURL = base64
      image.width = width
      image.height = height
    }
  }
  return image
}

/**
 * Transform data fetched from Notion to format Post[].
 *
 * Note that:
 *
 * 1. In some cases, we don't need all the properties of Post, so we ignore the fields
 * categories, tags and authors.
 * 2. This method MUST be placed in this file (not in helpers.ts) because it uses
 * some methods that require the "cache()" from react.
 */
async function transformNotionPostsData(options: {
  data: NotionPost[]
  categories?: Category[]
  authors?: Author[]
}): Promise<Post[]> {
  const { data, categories: categoriesList, authors: authorsList } = options
  if (!data || !data.length) return []
  return Promise.all(
    data?.map(async post => {
      // id
      const id = get(post, 'id') as string

      // title
      const title = getJoinedRichText(get(post, 'properties.name.title') as any) || defaultPostTitle

      // date
      // Because we migrate from WP to Notion, a lot of posts need to use the old created date
      const gotDate = get(
        post,
        'properties.finalCreatedDate.formula.date.start',
        get(post, 'last_edited_time', defaultPostDate)
      )
      const date = new Date(gotDate).toISOString()

      // Tags
      const tags =
        post.properties?.tag?.multi_select?.map((tag: NotionTagData) => mapTag(tag)) || []

      // Categories
      let categories: Category[]
      if (categoriesList) {
        const defaultCategory = categoriesList[0]
        const gotCategories = post.properties?.categories?.multi_select
        categories = gotCategories
          ? gotCategories.map(category => {
              const foundCategory = categoriesList.find(
                cat => makeSlugText(cat?.name) === makeSlugText(category.name)
              )
              return foundCategory
                ? foundCategory
                : {
                    name: category.name,
                    uri: `/${getSlugPrefix('category')}/${makeSlugText(category.name)}/`
                  }
            })
          : [defaultCategory]
      } else {
        categories = []
      }

      // Author
      let authors
      if (authorsList) {
        const authorIdsList = get(post, 'properties.authors.relation', []).map(
          (author: { id: string }) => author.id
        )
        authors = parseAuthorsForPost(authorIdsList, authorsList)
      }

      // Featured image
      const sourceUrl = get(post, 'cover.external.url') || get(post, 'cover.file.url')
      const featuredImage = await parseImage({
        sourceUrl,
        altText: `Ảnh đại diện cho bài viết ${title}`,
        category: categories?.[0],
        pageIdwithDash: id,
        staticImageData: defaultFeaturedImage,
        typeImgur: 'l'
      })

      // bookCover (if available)
      const bookCoverUrl =
        get(post, 'properties.bookCover.files[0].file.url') ||
        get(post, 'properties.bookCover.files[0].external.url')
      const bookCover = await parseImage({
        sourceUrl: bookCoverUrl,
        altText: `Ảnh bìa sách ${title}`,
        pageIdwithDash: id,
        staticImageData: defaultBookCover,
        canBeNull: true,
        typeImgur: 'm'
      })

      // slug
      const slug =
        get(post, 'properties.slug.rich_text[0].plain_text', '') ||
        makeSlugText(get(post, 'properties.name.title[0].plain_text', ''))

      // excerpt
      const excerpt = get(post, 'properties.excerpt.rich_text', [])

      return {
        id,
        title,
        slug,
        uri: `/${getSlugPrefix('singlePost')}/${slug}/`,
        date,
        tags,
        excerpt,
        categories,
        authors,
        featuredImage,
        bookCover
      } as Post
    })
  )
}

export async function getBlocks(blockId: string): Promise<ListBlockChildrenResponse['results']> {
  return await getNotionBlocks(
    blockId,
    process.env.NOTION_TOKEN as string,
    process.env.NOTION_VERSION as string,
    undefined,
    getPageUri,
    parseImgurUrlForGettingBlocks
  )
}

function parseImgurUrlForGettingBlocks(url: string) {
  return parseImgurUrl({ url, type: 'h', ignoreImgType: 'png' })
}

/**
 * Get uri (not slug) of a Notion page
 */
async function getPageUri(pageId: string): Promise<string | undefined> {
  const pageData = await getNotionPage(pageId)
  const isAuthor =
    get(pageData, 'parent.database_id', '').replaceAll('-', '') === process.env.NOTION_DB_AUTHORS
  const slug =
    get(pageData, 'properties.slug.rich_text[0].plain_text', '') ||
    makeSlugText(get(pageData, 'properties.name.title[0].plain_text', ''))
  if (!slug) return undefined
  return !isAuthor
    ? !SINGLE_PAGE_SLUGS.includes(slug)
      ? `/${getSlugPrefix('singlePost')}/${slug}/`
      : `/${slug}/`
    : `/${getSlugPrefix('author')}/${slug}/`
}

/**
 * Get data from Notion using the official Notion APIs. We use React cache() to cache the data.
 *
 * @see {@link https://developers.notion.com/reference/post-database-query Query a database - Notion API}
 * @see {@link https://nextjs.org/docs/app/building-your-application/data-fetching/caching#react-cache React cache()}
 * @see {@link https://developers.notion.com/reference/request-limits Notion API request limits}
 */
const getNotionDatabase = cache(
  async (
    dataId: string,
    filter?: QueryDatabaseParameters['filter'],
    startCursor?: string,
    pageSize?: number,
    sorts?: NotionSorts[]
  ) =>
    getNotionDatabaseWithoutCache(
      dataId,
      process.env.NOTION_TOKEN as string,
      process.env.NOTION_VERSION as string,
      filter,
      startCursor,
      pageSize,
      sorts
    )
)

/**
 * Get Notion Page by pageId
 *
 * It's "notion.pages.retrieve()" if we use Notion API directly.
 *
 * @see {@link https://developers.notion.com/reference/retrieve-a-page Retrieve a page - Notion API}
 */
const getNotionPage = cache(async (pageId: string) =>
  getNotionPageWithoutCache(
    pageId,
    process.env.NOTION_TOKEN as string,
    process.env.NOTION_VERSION as string
  )
)

const retrieveNotionDatabase = cache(async (dataId: string) =>
  retrieveNotionDatabaseWithoutCache(
    dataId,
    process.env.NOTION_TOKEN as string,
    process.env.NOTION_VERSION as string
  )
)
