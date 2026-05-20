/**
 * Official Notion API wrapper using `@notionhq/client`.
 *
 * Replaces the `queryDatabase` / `retrieveDatabase` functions that live in
 * `notion-x/src/lib/db.ts`.  Signatures and return shapes are matched
 * byte-for-byte so that `src/app/lib/fetcher.ts` can swap its import path
 * in Phase 4 with no other changes.
 *
 * The `notion` client is module-internal (notion-x never exported it either).
 */

import { Client } from '@notionhq/client'
import type {
  DatabaseObjectResponse,
  QueryDatabaseParameters,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints'
import pMemoize from 'p-memoize'

import type { NotionSorts } from '@notion-x/src/interface'

// ---------------------------------------------------------------------------
// Singleton client — auth is read once at module load time.
// ---------------------------------------------------------------------------

const notion = new Client({ auth: process.env.NOTION_TOKEN })

/** Maximum number of items per page, mirrors `notionMaxRequest` in notion-x. */
export const notionMaxRequest = 100

// ---------------------------------------------------------------------------
// Backoff helper
// ---------------------------------------------------------------------------

/**
 * Retry `fn` with exponential back-off on Notion rate-limit (429),
 * server errors (5xx), and transient network errors (ECONNRESET, ETIMEDOUT, etc.).
 * All other errors are re-thrown immediately.
 *
 * Delay formula: `Math.min(2 ** attempt * 1000, 30_000)` ms.
 */
async function withBackoff<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const status: number | string | undefined = err?.status ?? err?.code
      const isNetworkError =
        typeof status === 'string' && /^(ECONN|ETIMEDOUT|EAI_AGAIN|UND_ERR_)/.test(status)
      const isRetryable =
        status === 429 ||
        (typeof status === 'number' && status >= 500 && status < 600) ||
        isNetworkError

      if (!isRetryable || attempt === maxRetries) {
        throw err
      }

      const delay = Math.min(2 ** attempt * 1000, 30_000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  // Unreachable — loop always returns or throws, but satisfies TypeScript exhaustiveness.
  throw new Error('withBackoff exhausted retries')
}

// ---------------------------------------------------------------------------
// queryDatabase
// ---------------------------------------------------------------------------

/**
 * Query a Notion database and auto-paginate through all results.
 *
 * Pagination behaviour matches `notion-x/src/lib/db.ts#queryDatabaseImpl`:
 * - When `pageSize >= notionMaxRequest (100)` and the response has
 *   `has_more === true`, subsequent pages are fetched automatically and their
 *   results are appended.
 * - The final return shape is `{ results: aggregated }` — `has_more` and
 *   `next_cursor` are intentionally discarded after pagination, matching what
 *   notion-x returns and what callers (e.g. `fetcher.ts`) consume.
 *
 * @param opts.dbId       Notion database ID.
 * @param opts.filter     Optional filter object.
 * @param opts.startCursor Optional start cursor for manual pagination.
 * @param opts.pageSize   Items per request; defaults to `notionMaxRequest`.
 * @param opts.sorts      Optional sort descriptors.
 */
export async function queryDatabaseImpl(opts: {
  dbId: string
  filter?: QueryDatabaseParameters['filter']
  startCursor?: string
  pageSize?: number
  sorts?: NotionSorts[]
}): Promise<QueryDatabaseResponse> {
  const { dbId, filter, startCursor, pageSize = notionMaxRequest, sorts } = opts

  // Build the first-page request.
  const params: Parameters<typeof notion.databases.query>[0] = {
    database_id: dbId,
    ...(filter && { filter }),
    ...(sorts && { sorts: sorts as QueryDatabaseParameters['sorts'] }),
    ...(startCursor && { start_cursor: startCursor }),
    page_size: pageSize
  }

  let data = await withBackoff(() => notion.databases.query(params))

  let children = data.results as QueryDatabaseResponse['results']

  // Auto-paginate when the page size is at or above the threshold, mirroring
  // the condition in notion-x: `pageSize >= notionMaxRequest`.
  if (pageSize >= notionMaxRequest) {
    while (data.has_more && data.next_cursor) {
      const nextCursor = data.next_cursor
      data = await withBackoff(() =>
        notion.databases.query({
          ...params,
          start_cursor: nextCursor
        })
      )
      children = [...children, ...(data.results as QueryDatabaseResponse['results'])]
    }
  }

  return { results: children } as QueryDatabaseResponse
}

/**
 * Key-order-stable JSON serializer — sorts object keys before serializing so
 * logically-equivalent filter objects always produce the same cache key.
 * Handles nested objects and arrays. ≤15 lines, no external deps.
 */
function stableStringify(val: unknown): string {
  if (Array.isArray(val)) return '[' + val.map(stableStringify).join(',') + ']'
  if (val !== null && typeof val === 'object') {
    const sorted = Object.keys(val as object)
      .sort()
      .map(k => JSON.stringify(k) + ':' + stableStringify((val as any)[k]))
    return '{' + sorted.join(',') + '}'
  }
  return JSON.stringify(val)
}

export const queryDatabase = pMemoize(queryDatabaseImpl, {
  cacheKey: (...args) => stableStringify(args)
})

// ---------------------------------------------------------------------------
// retrieveDatabase
// ---------------------------------------------------------------------------

/**
 * Retrieve a Notion database schema.
 *
 * Matches `notion-x/src/lib/db.ts#retrieveDatabaseImpl` signature —
 * `(dbId: string)` only; auth is encapsulated in the singleton client.
 *
 * Used by `fetcher.ts#getTags()` to extract `tag.multi_select.options`.
 */
export async function retrieveDatabaseImpl(
  dbId: string
): Promise<DatabaseObjectResponse> {
  return withBackoff(() =>
    notion.databases.retrieve({ database_id: dbId }) as Promise<DatabaseObjectResponse>
  )
}

export const retrieveDatabase = pMemoize(retrieveDatabaseImpl, {
  cacheKey: (...args) => JSON.stringify(args)
})
