import { NotionAPI } from 'notion-client'
import { ExtendedRecordMap } from 'notion-types'
import { getPageContentBlockIds } from 'notion-utils'

export const notionX = new NotionAPI({
  activeUser: process.env.NOTION_ACTIVE_USER,
  authToken: process.env.NOTION_TOKEN_V2,
  kyOptions: {
    hooks: {
      beforeRequest: [
        (request, options) => {
          const url = request.url.toString();

          if (url.includes('/api/v3/syncRecordValues')) {
            return new Request(
              url.replace('/api/v3/syncRecordValues', '/api/v3/syncRecordValuesMain'),
              options,
            );
          }

          return request;
        },
      ],
    },
  },
})

export async function getPage(pageId: string) {
  const recordMap = await notionX.getPage(pageId, {
    fetchMissingBlocks: true,
    signFileUrls: true,
  })
  const normalizedRecordMap = normalizeRecordMap(recordMap)
  const withContentBlocks = await fixMissingContentBlocks(normalizedRecordMap)
  const newRecordMap = await fixMissingBlocks(withContentBlocks)
  return newRecordMap
}

// notion-client only returns the first chunk of a long page, so content blocks
// at the end of the post are referenced but never loaded. Iteratively fetch the
// missing content blocks via notionX.getBlocks() (keeps auth + signed_urls)
// until every referenced child is present.
async function fixMissingContentBlocks(
  recordMap: ExtendedRecordMap,
): Promise<ExtendedRecordMap> {
  let working = recordMap
  const maxIterations = 10
  for (let i = 0; i < maxIterations; i++) {
    const pendingBlockIds = getPageContentBlockIds(working).filter(
      id => !working.block[id]?.value,
    )
    if (!pendingBlockIds.length) {
      break
    }
    const fetched = await notionX.getBlocks(pendingBlockIds)
    const block = { ...working.block, ...fetched?.recordMap?.block }
    working = normalizeRecordMap({ ...working, block })
  }
  return working
}

// Some block entries come back double-wrapped as `{ value: { value, role } }`
// instead of `{ value, role }`, so `entry.value` is a `{ value, role }` wrapper
// rather than a real block. Unwrap the extra layer once at the source so every
// consumer (post header, template, renderer, toc) reads a real block from `.value`.
function normalizeRecordMap(recordMap: ExtendedRecordMap): ExtendedRecordMap {
  const block = { ...recordMap.block } as any
  for (const blockId of Object.keys(block)) {
    const entry = block[blockId]
    const inner = entry?.value as any
    if (inner?.value && inner?.role && !inner?.id) {
      block[blockId] = { ...entry, value: inner.value, role: inner.role }
    }
  }
  return { ...recordMap, block }
}

async function fixMissingBlocks(recordMap: ExtendedRecordMap): Promise<ExtendedRecordMap> {
  const brokenBlockIds = [] as any
  for (const blockId of Object.keys(recordMap.block)) {
    const block = recordMap.block[blockId]?.value
    if (!block || block.type !== 'text') {
      continue
    }
    const title = block.properties?.title
    if (!title) {
      continue
    }
    title.map(([_text, decorations], _index) => {
      if (!decorations) {
        return false
      }
      const decorator = decorations[0]
      if (!decorator || decorator[0] !== 'p' || !decorator[1]) {
        return false
      }
      const bId = decorator[1]
      if (!recordMap.block[bId]?.value) {
        brokenBlockIds.push(bId)
        return true
      }
      return false
    })
  }
  const missingBlocks = brokenBlockIds?.length ? await notionX.getBlocks(brokenBlockIds) : null
  const newBlocks = {
    ...recordMap.block,
    ...missingBlocks?.recordMap?.block
  }
  return {
    ...recordMap,
    block: newBlocks
  }
}
