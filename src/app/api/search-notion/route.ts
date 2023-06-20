import { idToUuid, parseSearchResults } from '@app/lib/helpers'
import got from 'got'

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
    throw new Error('NOTION_DB_POSTS is not defined')
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
