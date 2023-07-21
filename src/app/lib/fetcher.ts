import {
  BlockObjectResponse,
  ListBlockChildrenResponse,
  QueryDatabaseParameters,
  RichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints'
import defaultBookCover from '@root/public/featured-images/untitledBook.jpg'
import {
  Author,
  Category,
  ImageType,
  ImgurUrlType,
  NotionHeader,
  NotionPost,
  NotionSorts,
  Post,
  PostHeaderType,
  Tag
} from '@src/interface'
import { get, set } from 'lodash'
import { StaticImageData } from 'next/image'
import { getPlaiceholder } from 'plaiceholder'
import { cache } from 'react'

import {
  NOTION_DB_AUTHORS,
  NOTION_DB_POSTS,
  NOTION_DB_TAGS,
  defaultFeaturedImage,
  defaultPostDate,
  defaultPostTitle,
  getSlugPrefix,
  notionDateName,
  notionMaxRequest,
  predefinedCategories
} from './config'
import {
  getNotionBlocksWithoutCache,
  getNotionDatabaseWithoutCache,
  getNotionPageWithoutCache
} from './db'
import {
  getFilter,
  getPredefinedCategories,
  makeSlugText,
  parseAuthorsForPost,
  parseImgurUrl,
  parseNotionImageUrl,
  parseTagsForPost,
  transformNotionAuthorsData,
  transformNotionTagsData
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
 */
export async function getPosts(options: {
  dbId: string
  categories?: Category[]
  tags?: Tag[]
  authors?: Author[]
  filter?: unknown
  startCursor?: string
  pageSize?: number
  sorts?: NotionSorts[]
}): Promise<Post[]> {
  const { dbId, filter, categories, tags, authors, startCursor, pageSize, sorts } = options

  const defaultSort = {
    property: notionDateName,
    direction: 'descending'
  } as NotionSorts
  const sortsToUse: any = sorts?.length ? sorts.push(defaultSort) : [defaultSort]
  const filterToUse = getFilter(filter)

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
    tags,
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
  tags?: Tag[]
  authors?: Author[]
}) {
  const { categories, tags, authors, filter, pageSize, startCursor } = options
  const posts = await getPosts({
    dbId: NOTION_DB_POSTS,
    categories,
    tags,
    authors,
    filter,
    pageSize,
    startCursor
  })
  return posts
}

/**
 * Get all predefined categories (not from Notion database)
 */
export const getCategories = () => predefinedCategories

/**
 * Get all tags from Notion database (NOTION_DB_TAGS)
 */
export const getTags = async () => {
  if (!NOTION_DB_TAGS) throw new Error('NOTION_DB_TAGS is not defined')
  const data = await getNotionDatabase(NOTION_DB_TAGS, undefined, undefined, notionMaxRequest)
  return transformNotionTagsData(data?.['results'] as any[])
}

/**
 * Get all authors from Notion database (NOTION_DB_AUTHORS)
 */
export const getAuthors = async () => {
  if (!NOTION_DB_AUTHORS) throw new Error('NOTION_DB_AUTHORS is not defined')
  const data = await getNotionDatabase(NOTION_DB_AUTHORS, undefined, undefined, notionMaxRequest)
  return transformNotionAuthorsData(data?.['results'] as any[])
}

/**
 * Get header of a single post from Notion
 *
 */
export async function getPostHeader(pageId: string): Promise<PostHeaderType> {
  const pageData = await getNotionPage(pageId)
  return await transformPostHeader(pageData, pageId)
}

/**
 * Transform Notion data to PostHeaderType
 *
 * REMARK: This method MUST be placed in this file (not in helpers.ts) because it uses
 * some methods that require the "cache()" from react.
 */
export async function transformPostHeader(
  notionHeader: NotionHeader,
  pageIdwithDash: string
): Promise<PostHeaderType> {
  const properties = notionHeader?.properties

  // title
  const title = properties?.name?.title?.[0]?.plain_text || defaultPostTitle

  // date
  // Because we migrate from WP to Notion, a lot of posts need to use the old created date
  const finalCreatedDate =
    properties?.finalCreatedDate?.formula?.date?.start || new Date().toISOString()
  const date = new Date(finalCreatedDate).toISOString()

  // categories
  const categories = getPredefinedCategories(properties?.categories?.multi_select)

  // tags
  const tagIdsList = properties?.tags?.relation?.map(item => item.id) || []
  const tagsList = await getTags()

  const tags = parseTagsForPost(tagIdsList, tagsList)

  // authors
  const authorIdsList = properties?.authors?.relation?.map(item => item.id) || []
  const authorsList = await getAuthors()
  const authors = parseAuthorsForPost(authorIdsList, authorsList)

  // featured image
  const sourceUrl = notionHeader?.cover?.external?.url || notionHeader?.cover?.file?.url
  const featuredImage = await parseImage({
    sourceUrl,
    altText: `Ảnh đại diện cho bài viết "${title}"`,
    category: categories[0],
    pageIdwithDash,
    staticImageData: defaultFeaturedImage,
    typeImgur: 'h'
  })

  // selected
  const selected = properties?.selected?.checkbox || false

  // bookCover
  const bookCoverUrl =
    properties?.bookCover?.files?.[0]?.external?.url || properties?.bookCover?.files?.[0]?.file?.url
  const bookCover = await parseImage({
    sourceUrl: bookCoverUrl,
    altText: `Ảnh bìa sách "${title}"`,
    pageIdwithDash,
    staticImageData: defaultBookCover,
    canBeNull: true,
    typeImgur: 'm'
  })

  // showToc
  const showToc = properties?.showToc?.checkbox || false

  return { title, date, categories, tags, authors, featuredImage, selected, bookCover, showToc }
}

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
  const urlToUse = parseImgurUrl(sourceUrl, options.typeImgur)
  const image: ImageType = { altText, sourceUrl: urlToUse }
  const imgUrl = parseNotionImageUrl(urlToUse, pageIdwithDash)
  if (imgUrl) {
    const { base64, width, height } = await getPlaceholderImage(imgUrl)
    image.blurDataURL = base64
    image.width = width
    image.height = height
  } else {
    if (canBeNull) return null
    // If there is no featured image, we will use the default featured image of the category
    if (category && category.featuredImage?.staticImageData) {
      image.staticImageData = category.featuredImage?.staticImageData
    } else {
      // If the post has no category
      image.staticImageData = staticImageData
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
  tags?: Tag[]
  authors?: Author[]
}): Promise<Post[]> {
  const { data, categories: categoriesList, tags: tagsList, authors: authorsList } = options
  if (!data || !data.length) return []
  return Promise.all(
    data?.map(async post => {
      // id
      const id = get(post, 'id') as string

      // title
      const title = get(post, 'properties.name.title[0].plain_text', defaultPostTitle)

      // date
      // Because we migrate from WP to Notion, a lot of posts need to use the old created date
      const gotDate = get(
        post,
        'properties.finalCreatedDate.formula.date.start',
        get(post, 'last_edited_time', defaultPostDate)
      )
      const date = new Date(gotDate).toISOString()

      // Tags
      let tags
      if (tagsList) {
        const tagIdsList = get(post, 'properties.tags.relation', []).map(
          (tag: { id: string }) => tag.id
        )
        tags = parseTagsForPost(tagIdsList, tagsList)
      }

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

/**
 * Get all nested blocks (in all levels) of a block.
 *
 */
export async function getBlocks(
  blockId: string,
  initNumbering?: string
): Promise<ListBlockChildrenResponse['results']> {
  const data = await getNotionBlocks(blockId)
  const blocks = data?.results as
    | (BlockObjectResponse & {
        list_item?: string
        children?: ListBlockChildrenResponse['results']
        imageInfo?: any
        imgUrl?: string
      })[]
    | []

  if (!blocks?.length) return []

  let number = 1
  for (const block of blocks) {
    /**
     * Remark: Consider 2 cases:
     * ++ First:
     * 1. Item 1
     * Paragraph
     * 1. Item 2
     *
     * ++ Second:
     * 1. Item 1
     * 2. Item 2
     *
     * The Notion API doesn't give any information in that Item 1 and Item 2 of the first case are
     * in diffrent uls while in the second case, they are in the same ul.
     *
     * They are both in the same structure.
     * Check: https://developers.notion.com/reference/block#numbered-list-item-blocks
     *
     * That's why we add some additional information to the block.
     */
    if (block.type === 'numbered_list_item') {
      if (initNumbering && ['1', '2', '3'].includes(initNumbering)) initNumbering = undefined
      block['list_item'] = (initNumbering ?? '') + `${number}.`
      number++
    } else {
      number = 1
    }

    if (block.type === 'bulleted_list_item') {
      block['list_item'] = !initNumbering ? '1' : initNumbering === '1' ? '2' : '3'
    }

    if (get(block, `${block.type}.rich_text`)) {
      const parsedMention = await parseMention(get(block, `${block.type}.rich_text`) as any)
      set(block, `${block.type}.rich_text`, parsedMention)
    }

    if (block.has_children) {
      const children = await getBlocks(block.id, block['list_item'])
      block['children'] = children
    }

    // Get real image size (width and height) of an image block
    if (block.type === 'image') {
      const url = get(block, 'image.file.url') || get(block, 'image.external.url')
      if (url) {
        block['imgUrl'] = parseImgurUrl(url, 'h') // Resize the image to 1024x1024 max
        block['imageInfo'] = await getPlaceholderImage(url) // { base64, width, height }
      }
    }
  }

  return blocks
}

/**
 * Add "slug" property when mentioning a page or an author in a paragraph block
 * @param blockParagraph
 */
async function parseMention(richText: RichTextItemResponse[] | []): Promise<any> {
  if (!richText?.length) return []
  const newRichText = [] as RichTextItemResponse[]
  for (const block of richText) {
    if (block.type === 'mention' && block.mention?.type === 'page') {
      const pageId = get(block, 'mention.page.id')
      if (pageId) {
        const pageUri = await getPageUri(pageId)
        set(block, 'mention.page.uri', pageUri)
      }
      newRichText.push(block)
    } else {
      newRichText.push(block)
    }
  }
  return newRichText
}
/**
 * Get uri (not slug) of a Notion page
 */
async function getPageUri(pageId: string): Promise<string | null> {
  const pageData = await getNotionPage(pageId)
  const isAuthor = get(pageData, 'parent.database_id', '').replaceAll('-', '') === NOTION_DB_AUTHORS
  const slug =
    get(pageData, 'properties.slug.rich_text[0].plain_text', '') ||
    makeSlugText(get(pageData, 'properties.name.title[0].plain_text', ''))
  if (!slug) return null
  return !isAuthor
    ? `/${getSlugPrefix('singlePost')}/${slug}/`
    : `/${getSlugPrefix('author')}/${slug}/`
}

/**
 * Get all blocks of a Notion Page by pageId
 *
 * @see {@link https://developers.notion.com/reference/get-block-children Get block children - Notion API}
 */
export const getNotionBlocks = cache(
  async (pageId: string, pageSize?: number, startCursor?: string) =>
    getNotionBlocksWithoutCache(pageId, pageSize, startCursor)
)

/**
 * Get data from Notion using the official Notion APIs. We use React cache() to cache the data.
 *
 * @see {@link https://developers.notion.com/reference/post-database-query Query a database - Notion API}
 * @see {@link https://nextjs.org/docs/app/building-your-application/data-fetching/caching#react-cache React cache()}
 * @see {@link https://developers.notion.com/reference/request-limits Notion API request limits}
 */
export const getNotionDatabase = cache(
  async (
    dataId: string,
    filter?: QueryDatabaseParameters['filter'],
    startCursor?: string,
    pageSize?: number,
    sorts?: NotionSorts[]
  ) => getNotionDatabaseWithoutCache(dataId, filter, startCursor, pageSize, sorts)
)

/**
 * Get Notion Page by pageId
 *
 * It's "notion.pages.retrieve()" if we use Notion API directly.
 *
 * @see {@link https://developers.notion.com/reference/retrieve-a-page Retrieve a page - Notion API}
 */
export const getNotionPage = cache(async (pageId: string) => getNotionPageWithoutCache(pageId))

/**
 * Get blurDataURL (base64) of an image
 *
 * REMARK: This method MUST be placed in this file, otherwise, there will be an error of "Can't resolve 'fs'"
 */
export const getPlaceholderImage = cache(async function getPlaceholderImage(src: string) {
  const buffer = await fetch(src).then(async res => Buffer.from(await res.arrayBuffer()))

  const { base64, metadata } = await getPlaiceholder(buffer)
  return { base64, width: metadata.width, height: metadata.height }
})
