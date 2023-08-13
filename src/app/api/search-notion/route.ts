import got from 'got'
import { idToUuid, makeSlugText } from 'notion-nextjs-lib/dist/helpers/helpers'

import { SearchResult } from '../../../interface'
import { UNOFFICIAL_NOTION_KEYS, defaultPostTitle } from '../../lib/config'

type SearchParams = {
  query: string
  limit?: number
  filters?: any
}

export async function POST(request: Request) {
  const searchParams = await request.json()

  const results = await search(searchParams)
  const postResults = parseSearchResults(results)

  return new Response(JSON.stringify(postResults), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function search(params: SearchParams): Promise<any> {
  const headers: any = {
    'Content-Type': 'application/json',
    cookie: `token_v2=${process.env.NOTION_TOKEN_V2}`,
    'x-notion-active-user-header': process.env.NOTION_ACTIVE_USER
  }

  if (!process.env.NOTION_DB_POSTS) {
    throw new Error('process.env.NOTION_DB_POSTS is not defined')
  }

  const body = {
    type: 'BlocksInAncestor',
    source: 'quick_find_public',
    ancestorId: idToUuid(process.env.NOTION_DB_POSTS),
    sort: {
      field: 'relevance'
    },
    limit: params.limit || 20,
    query: params.query,
    filters: {
      isDeletedOnly: false,
      isNavigableOnly: false,
      excludeTemplates: true,
      requireEditPermissions: false,
      ancestors: [],
      createdBy: [],
      editedBy: [],
      lastEditedTime: {},
      createdTime: {},
      ...params.filters
    }
  }

  const url = `${process.env.NOTION_API_WEB}/search`

  return got
    .post(url, {
      body: JSON.stringify(body),
      headers
    })
    .json()
}

/**
 * We convert the format of search results got from /api/search-notion to the format we want
 * Note that: /api/search-notin uses an unofficial notion api, so the format is a little bit different
 */
function parseSearchResults(data: any): SearchResult[] {
  let results = [] as SearchResult[]
  if (!data || !data.results || data.results.length === 0) results = []
  else {
    for (const result of data.results) {
      const postId = result.id
      const _properties = data.recordMap?.block?.[postId]?.value?.properties
      const isPostPublished = _properties?.[UNOFFICIAL_NOTION_KEYS.published]?.[0]?.[0] === 'Yes'
      const _title = _properties?.[UNOFFICIAL_NOTION_KEYS.title]?.[0]?.[0]
      const postTitle = _title || defaultPostTitle
      const _slug = _properties?.[UNOFFICIAL_NOTION_KEYS.slug]?.[0]?.[0] || null
      const postSlug = _slug || makeSlugText(_title || '')
      const postCategoryNames =
        _properties?.[UNOFFICIAL_NOTION_KEYS.categories]?.[0]?.[0]?.split(',') || []
      const isPostSelected = _properties?.[UNOFFICIAL_NOTION_KEYS.selected]?.[0]?.[0] === 'Yes'
      const postTitleHighlighted =
        result?.highlight?.title
          ?.replaceAll(
            UNOFFICIAL_NOTION_KEYS.boldSearchKey,
            '<span className="text-slate-900 font-semibold">'
          )
          ?.replaceAll(UNOFFICIAL_NOTION_KEYS.boldSearchKeyClose, '</span>') || postTitle
      const postTextHighlighted =
        result.highlight?.text
          ?.replaceAll(
            UNOFFICIAL_NOTION_KEYS.boldSearchKey,
            '<span className="text-slate-900 font-semibold">'
          )
          ?.replaceAll(UNOFFICIAL_NOTION_KEYS.boldSearchKeyClose, '</span>') || null
      const isBookPost = !!_properties?.[UNOFFICIAL_NOTION_KEYS.bookCover]

      results.push({
        id: postId,
        title: postTitle,
        slug: postSlug,
        categoryNames: postCategoryNames,
        isPublished: isPostPublished,
        isSelected: isPostSelected,
        titleHighlighted: postTitleHighlighted,
        textHighlighted: postTextHighlighted,
        isBookPost
      })
    }
  }
  return results
}
