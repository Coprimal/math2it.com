/**
 * Hand-rolled unofficial Notion-API client.
 * Ported from dinhanhthi.com/src/lib/notion/db.ts.
 * Replaces `notion-client`'s NotionAPI class.
 */

import type { CollectionInstance, ExtendedRecordMap, SearchParams } from 'notion-types'
import { getPageContentBlockIds, idToUuid, parsePageId } from 'notion-utils'
import pMemoize from 'p-memoize'

// Read env vars at module top — does NOT crash if missing; defers to first use.
const NOTION_API_WEB = process.env.NOTION_API_WEB ?? 'https://www.notion.so/api/v3'
const NOTION_TOKEN_V2 = process.env.NOTION_TOKEN_V2
const NOTION_ACTIVE_USER = process.env.NOTION_ACTIVE_USER

/**
 * Sanitize a string for inclusion in error messages — strips token/cookie-like values
 * that could appear in Notion error bodies.
 */
function sanitizeErrorBody(raw: string): string {
  return raw
    .slice(0, 500)
    .replace(/token_v2=[^;,\s"']+/gi, 'token_v2=[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
}

/**
 * Internal POST helper for Notion's unofficial web API (v3).
 * Endpoint must start with `/` (e.g. `/loadPageChunk`).
 * Throws loudly on non-2xx with status, statusText, and up to 500 chars of the response body.
 */
async function notionFetch<T>(endpoint: string, body: unknown): Promise<T> {
  const url = `${NOTION_API_WEB}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (NOTION_TOKEN_V2) {
    headers['Cookie'] = `token_v2=${NOTION_TOKEN_V2}`
  }

  if (NOTION_ACTIVE_USER) {
    headers['x-notion-active-user-header'] = NOTION_ACTIVE_USER
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const rawBody = await res.text().catch(() => '')
    const sanitized = sanitizeErrorBody(rawBody)
    throw new Error(
      `notionFetch ${endpoint} failed: ${res.status} ${res.statusText} — ${sanitized}`
    )
  }

  return (await res.json()) as T
}

// Ported from dinhanhthi.com/src/lib/notion/db.ts — v3→v2 recordMap unwrap
/**
 * Normalize Notion API v3 recordMap format back to v2 format.
 *
 * In v3 (`__version__: 3`), each entry in `block`, `collection`, etc. is wrapped as:
 *   `{ value: { value: <actual data>, role: "..." } }`
 * In v2, it was:
 *   `{ value: <actual data> }`
 *
 * This function unwraps v3 to v2 so all downstream code works unchanged.
 */
export function normalizeRecordMap(recordMap: any): ExtendedRecordMap {
  if (!recordMap || recordMap.__version__ !== 3) return recordMap

  const tablesToNormalize = [
    'block',
    'collection',
    'collection_view',
    'notion_user',
    'space',
    'custom_emoji'
  ]

  for (const table of tablesToNormalize) {
    const entries = recordMap[table]
    if (!entries) continue

    for (const id of Object.keys(entries)) {
      const entry = entries[id]
      // v3 pattern: entry.value = { value: actualData, role: "..." }
      // v2 pattern: entry.value = actualData (which has id, type, properties, etc.)
      if (entry?.value?.value && entry.value.role !== undefined) {
        entries[id] = { value: entry.value.value, role: entry.value.role }
      }
    }
  }

  return recordMap
}

/**
 * Fetch a page's initial chunk of blocks from Notion's unofficial API.
 *
 * @param pageId - Notion page ID (with or without dashes; normalized internally).
 * @returns `{ recordMap, cursor }` where `recordMap` is normalized to v2 shape.
 */
export async function loadPageChunk(
  pageId: string
): Promise<{ recordMap: ExtendedRecordMap; cursor?: any }> {
  const parsedPageId = parsePageId(pageId)
  if (!parsedPageId) {
    throw new Error(`Invalid Notion pageId "${pageId}"`)
  }

  const body = {
    pageId: parsedPageId,
    limit: 100,
    cursor: { stack: [] },
    chunkNumber: 0,
    verticalColumns: false
  }

  const raw = await notionFetch<any>('/loadPageChunk', body)

  return {
    recordMap: normalizeRecordMap(raw.recordMap),
    cursor: raw.cursor
  }
}

/**
 * Fetch individual blocks by ID via Notion's unofficial syncRecordValuesMain endpoint.
 * Used in task 2.3's pending-blocks loop to resolve missing block references.
 *
 * @param requests - Array of `{ pointer: { table: 'block', id }, version }` descriptors.
 * @returns Normalized v2 `ExtendedRecordMap`.
 */
export async function syncRecordValuesMain(
  requests: Array<{ pointer: { table: 'block'; id: string }; version: number }>
): Promise<ExtendedRecordMap> {
  const raw = await notionFetch<any>('/syncRecordValuesMain', { requests })
  return normalizeRecordMap(raw.recordMap)
}

// ---------------------------------------------------------------------------
// Task 2.3 — getPage / getBlocks (pending-blocks loop + memoization)
// ---------------------------------------------------------------------------

/**
 * Fetch and normalize the initial page chunk.
 * Internal helper — NOT exported.
 *
 * @param pageId - Notion page ID (with or without dashes).
 * @returns Normalized v2 `ExtendedRecordMap` from the first loadPageChunk response.
 */
async function getPageRaw(pageId: string): Promise<ExtendedRecordMap> {
  const result = await loadPageChunk(pageId)
  return result.recordMap
}

/**
 * Fetch a set of blocks by their IDs via syncRecordValuesMain.
 * Internal helper — NOT exported.
 *
 * @param blockIds - Array of block IDs to resolve.
 * @returns Normalized v2 `ExtendedRecordMap` containing the requested blocks.
 */
async function getBlocksByIds(blockIds: string[]): Promise<ExtendedRecordMap> {
  const requests = blockIds.map(id => ({
    pointer: { table: 'block' as const, id },
    version: -1
  }))
  return syncRecordValuesMain(requests)
}

/**
 * Fetch a complete Notion page, filling in any blocks referenced by `content`
 * arrays that were missing from the initial loadPageChunk response.
 *
 * Loops up to 10 iterations calling getBlocksByIds() for any still-missing IDs
 * detected via `getPageContentBlockIds()` from `notion-utils`. Returns the
 * accumulated `ExtendedRecordMap` regardless of whether all blocks were found.
 *
 * Memoized on `pageId` so repeated calls within the same process are free.
 * Return type matches `notion-client`'s `NotionAPI.getPage()` — a plain
 * `ExtendedRecordMap` — so the vendored renderer can swap to this with a
 * one-line import change.
 *
 * @param pageId - Notion page ID (with or without dashes).
 * @returns `ExtendedRecordMap` containing all resolved page blocks.
 */
async function getPageImpl(pageId: string): Promise<ExtendedRecordMap> {
  const recordMap = await getPageRaw(pageId)

  let missingIds: string[] = []
  // Track IDs that Notion has returned empty/missing to avoid infinite re-requesting them.
  const permanentlyMissing = new Set<string>()

  for (let i = 0; i < 10; i++) {
    const contentIds = getPageContentBlockIds(recordMap)
    missingIds = contentIds.filter(id => !recordMap.block[id] && !permanentlyMissing.has(id))

    if (missingIds.length === 0) {
      break
    }

    const fetched = await getBlocksByIds(missingIds)

    // If Notion returned nothing, avoid re-requesting the same IDs next iteration.
    if (!fetched.block || Object.keys(fetched.block).length === 0) {
      for (const id of missingIds) {
        permanentlyMissing.add(id)
      }
      break
    }

    // Mark any requested IDs that were not returned to avoid infinite loops.
    const returnedIds = new Set(Object.keys(fetched.block))
    for (const id of missingIds) {
      if (!returnedIds.has(id)) {
        permanentlyMissing.add(id)
      }
    }

    for (const [id, val] of Object.entries(fetched.block)) {
      recordMap.block[id] = val
    }
  }

  if (missingIds.length > 0) {
    const sample = missingIds.slice(0, 5)
    console.warn(
      '[notion/api] getPage(%s): %d blocks still missing after 10 iterations. First missing IDs: %s',
      pageId,
      missingIds.length,
      sample.join(', ')
    )
  }

  return recordMap
}

/**
 * Memoized public wrapper for getPageImpl.
 * Exported — intended as the drop-in replacement for `notionX.getPage()`.
 */
export const getPage = pMemoize(getPageImpl)

/**
 * Fetch a set of blocks by their IDs and return them wrapped in the shape that
 * `notion-client`'s `NotionAPI.getBlocks()` returns:
 *   `{ recordMap: { block } }`
 *
 * Used by components such as Mermaid.tsx that lazy-fetch child blocks.
 *
 * @param blockIds - Array of block IDs to fetch.
 * @returns `{ recordMap: { block } }` — same shape as notion-client's getBlocks.
 */
export async function getBlocks(
  blockIds: string[]
): Promise<{ recordMap: { block: ExtendedRecordMap['block'] } }> {
  const result = await getBlocksByIds(blockIds)
  return { recordMap: { block: result.block } }
}

// ---------------------------------------------------------------------------
// Task 2.4 — queryCollection / getUnofficialDatabase / searchNotionPersonal
// ---------------------------------------------------------------------------

/**
 * POST to Notion's unofficial /queryCollection endpoint.
 *
 * Body shape mirrors the original `getUnofficialDatabaseImpl` in notion-x db.ts (the version
 * currently in production at math2it) rather than dinhanhthi's variant, so that the
 * Phase-4 import-path swap requires zero body changes.
 *
 * @param opts.collectionId     - Collection ID (a.k.a. sourceId in notion-x). Normalized to dashed UUID.
 * @param opts.collectionViewId - Collection view ID. Normalized to dashed UUID.
 * @param opts.spaceId          - Space ID (defaults to process.env.SPACE_ID).
 * @param opts.loader           - Override the default loader object.
 * @returns `{ recordMap: CollectionInstance, result: any }` with recordMap normalized to v2.
 */
export async function queryCollection(opts: {
  collectionId: string
  collectionViewId: string
  spaceId?: string
  query?: any
  loader?: any
}): Promise<{ recordMap: any; result: any }> {
  const {
    collectionId,
    collectionViewId,
    spaceId = process.env.SPACE_ID,
    loader
  } = opts

  const parsedCollectionId = parsePageId(collectionId)
  const parsedViewId = parsePageId(collectionViewId)

  const loaderToUse = loader ?? {
    filter: {
      operator: 'and',
      filters: []
    },
    type: 'reducer',
    reducers: {
      collection_group_results: {
        type: 'results',
        limit: 9999
      },
      'table:uncategorized:title:count': {
        type: 'aggregation',
        aggregation: {
          property: 'title',
          aggregator: 'count'
        }
      }
    },
    sort: []
  }

  const body = {
    collectionView: {
      id: parsedViewId,
      spaceId
    },
    source: {
      type: 'collection',
      id: parsedCollectionId,
      spaceId
    },
    loader: loaderToUse
  }

  const raw = await notionFetch<any>('/queryCollection', body)

  return {
    recordMap: normalizeRecordMap(raw.recordMap),
    result: raw.result
  }
}

/**
 * Unofficial API for getting all pages in a database.
 *
 * Signature matches the original `getUnofficialDatabase` in notion-x db.ts EXACTLY so that
 * Phase 4 can swap the import path with no other changes.
 *
 * Memoized with `pMemoize` keyed on all args (JSON.stringify) — same pattern as
 * notion-x's implementation.
 */
export async function getUnofficialDatabaseImpl(opts: {
  spaceId?: string
  sourceId?: string
  collectionViewId?: string
  notionTokenV2?: string
  notionActiveUser?: string
  notionApiWeb?: string
}): Promise<CollectionInstance> {
  const { spaceId, sourceId, collectionViewId, notionTokenV2, notionActiveUser, notionApiWeb } =
    opts
  if (!spaceId) throw new Error('spaceId is not defined')
  if (!sourceId) throw new Error('sourceId is not defined')
  if (!collectionViewId) throw new Error('collectionViewId is not defined')
  if (!notionTokenV2) throw new Error('notionTokenV2 is not defined')
  if (!notionActiveUser) throw new Error('notionActiveUser is not defined')
  if (!notionApiWeb) throw new Error('notionApiWeb is not defined')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    cookie: `token_v2=${notionTokenV2}`,
    'x-notion-active-user-header': notionActiveUser
  }

  const body = {
    collectionView: {
      id: collectionViewId,
      spaceId
    },
    source: {
      type: 'collection',
      id: sourceId,
      spaceId
    },
    loader: {
      filter: {
        operator: 'and',
        filters: []
      },
      type: 'reducer',
      reducers: {
        collection_group_results: {
          type: 'results',
          limit: 9999
        },
        'table:uncategorized:title:count': {
          type: 'aggregation',
          aggregation: {
            property: 'title',
            aggregator: 'count'
          }
        }
      },
      sort: []
    }
  }

  const url = `${notionApiWeb}/queryCollection`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `getUnofficialDatabaseImpl failed: ${res.status} ${res.statusText} — ${sanitizeErrorBody(body)}`
    )
  }

  const raw = await res.json()

  // Normalize recordMap v3 → v2 (notion-x doesn't do this — added for consistency with
  // the rest of this module)
  if (raw?.recordMap) {
    raw.recordMap = normalizeRecordMap(raw.recordMap)
  }

  return raw as CollectionInstance
}

export const getUnofficialDatabase = pMemoize(getUnofficialDatabaseImpl, {
  cacheKey: (...args) => JSON.stringify(args)
})

/**
 * Search Notion using the public personal site search endpoint.
 *
 * Signature matches the original `searchNotionPersonal` in notion-x db.ts EXACTLY.
 * Called by `src/app/api/search-notion/route.ts` as:
 *   `searchNotionPersonal(searchParams, process.env.NOTION_API_PERSONAL, process.env.NOTION_DB_POSTS)`
 *
 * Uses the public personal.notion.site endpoint — no auth tokens required.
 * Does NOT use `notionFetch` to avoid sending Cookie / active-user headers.
 */
export async function searchNotionPersonal(
  params: SearchParams,
  apiUrl: string,
  dbId: string
): Promise<any> {
  if (!apiUrl) throw new Error('apiUrl is not defined')
  if (!dbId) throw new Error('dbId is not defined')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  const body = {
    type: 'BlocksInAncestor',
    query: params.query,
    ancestorId: idToUuid(dbId),
    source: 'quick_find_input_change',
    sort: {
      field: 'relevance'
    },
    limit: params.limit || 100,
    filters: {
      isDeletedOnly: false,
      excludeTemplates: false,
      navigableBlockContentOnly: false,
      requireEditPermissions: false,
      includePublicPagesWithoutExplicitAccess: true,
      ancestors: [],
      createdBy: [],
      editedBy: [],
      lastEditedTime: {},
      createdTime: {},
      inTeams: [],
      ...params.filters
    }
  }

  const url = `${apiUrl}/search`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(
      `searchNotionPersonal failed: ${res.status} ${res.statusText} — ${sanitizeErrorBody(errBody)}`
    )
  }

  return res.json()
}
