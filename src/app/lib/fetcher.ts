import {
  QueryDatabaseParameters,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints'
import { Author, Category, NotionPost, NotionSorts, Post, Tag } from '@src/interface'
import { get } from 'lodash'
import { cache } from 'react'

import {
  ENV_MODE,
  NOTION_DB_AUTHORS,
  NOTION_DB_POSTS,
  NOTION_DB_TAGS,
  NOTION_TOKEN,
  NOTION_VERSION,
  defaultNumPostsRequest,
  notionDateName,
  notionMaxRequest,
  predefinedCategories
} from './config'
import {
  transformNotionAuthorsData,
  transformNotionPostsData,
  transformNotionTagsData
} from './helpers'

/**
 * Get data from Notion using the official Notion APIs. We use React cache() to cache the data.
 *
 * @see {@link https://developers.notion.com/reference/post-database-query Notion API}
 * @see {@link https://nextjs.org/docs/app/building-your-application/data-fetching/caching#react-cache React cache()}
 * @see {@link https://developers.notion.com/reference/request-limits Notion API request limits}
 */
export const getNotionData = cache(async function getNotionData(
  dataId: string,
  filter?: QueryDatabaseParameters['filter'],
  startCursor?: string,
  pageSize?: number,
  sorts?: NotionSorts[]
): Promise<QueryDatabaseResponse | undefined> {
  // console.log(
  //   `😇 getNotionData() called with args: ${JSON.stringify({
  //     dataId,
  //     filter,
  //     startCursor,
  //     pageSize,
  //     sorts
  //   })}`
  // ) // ###M
  try {
    const url = `https://api.notion.com/v1/databases/${dataId}/query`
    const requestBody = {
      filter,
      sorts,
      start_cursor: startCursor,
      page_size: pageSize ?? defaultNumPostsRequest
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    return res.json()
  } catch (error: any) {
    console.error(error)
    // Retry after a number of seconds in the returned header
    const retryAfter = error?.response?.headers['retry-after'] || error['retry-after']
    if (retryAfter) {
      console.log(`Retrying after ${retryAfter} seconds`)
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000 + 500))
      return await getNotionData(dataId, filter, startCursor, pageSize, sorts)
    }
    return
  }
})

/**
 * Get posts from Notion. If the requested `pageSize` is >= `notionMaxRequest`, it will
 * automatically request the next page.
 *
 * categories, tags, authors are required to be used in transformNotionPostsData()
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
  categories: Category[]
  tags: Tag[]
  authors: Author[]
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

  let data = await getNotionData(dbId, filterToUse, startCursor, pageSize, sortsToUse)
  let postsList = get(data, 'results', []) as NotionPost[]

  if (data && pageSize && pageSize >= notionMaxRequest && data['has_more']) {
    let newStartCursor = startCursor
    while (data!['has_more']) {
      newStartCursor = data!['next_cursor'] as string
      data = await getNotionData(dbId, filterToUse, newStartCursor, pageSize, sortsToUse)
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
 */
export async function getPostsBy(options: {
  categories: Category[]
  tags: Tag[]
  authors: Author[]
  filter: unknown
  pageSize: number
  startCursor?: string
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
export const getCategories = cache(() => {
  return predefinedCategories
})

/**
 * Get all tags from Notion database (NOTION_DB_TAGS)
 */
export const getTags = cache(async () => {
  if (!NOTION_DB_TAGS) throw new Error('NOTION_DB_TAGS is not defined')
  const data = await getNotionData(NOTION_DB_TAGS)
  return transformNotionTagsData(data?.['results'] as any[])
})

/**
 * Get all authors from Notion database (NOTION_DB_AUTHORS)
 */
export const getAuthors = cache(async () => {
  if (!NOTION_DB_AUTHORS) throw new Error('NOTION_DB_AUTHORS is not defined')
  const data = await getNotionData(NOTION_DB_AUTHORS)
  return transformNotionAuthorsData(data?.['results'] as any[])
})

/**
 * Filter to be used in getPosts()
 */
function getFilter(filter?: any): QueryDatabaseParameters['filter'] {
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
