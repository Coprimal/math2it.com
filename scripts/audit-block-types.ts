/**
 * Block-type audit script — Phase 1, Task 1.3
 *
 * Queries NOTION_DB_POSTS (official API) to collect ~30 representative post IDs,
 * then calls notionX.getPage() (unofficial API) for each one, accumulates block
 * types, code languages, callout colors, and embed providers.
 *
 * Output: markdown report printed to stdout AND written to
 * docs/research/block-types-2026-05-19.md
 *
 * Run via:
 *   npx tsx -r dotenv/config scripts/audit-block-types.ts dotenv_config_path=.env.local
 */

import { Client } from '@notionhq/client'
import * as fs from 'fs'
import * as path from 'path'

import { getPage } from '../notion-x/src/lib/notionx'

// ---------------------------------------------------------------------------
// Known block-type coverage lists
// ---------------------------------------------------------------------------

/** Types with an explicit case in notion-x/src/components/block.tsx */
const HANDLED_IN_BLOCK_TSX = new Set([
  'page',
  'collection_view_page',
  'header',
  'sub_header',
  'sub_sub_header',
  'divider',
  'text',
  'bulleted_list',
  'numbered_list',
  'embed',
  'tweet',
  'maps',
  'pdf',
  'figma',
  'typeform',
  'codepen',
  'excalidraw',
  'image',
  'gist',
  'video',
  'drive',
  'audio',
  'file',
  'equation',
  'code',
  'column_list',
  'column',
  'quote',
  'callout',
  'bookmark',
  'toggle',
  'table_of_contents',
  'to_do',
  'transclusion_container', // synced_block origin block (unofficial API name)
  'transclusion_reference', // synced_block pointer (unofficial API name)
  'alias',
  'table',
  'table_row',
  'external_object_instance',
])

/** Task spec SAFE list (kept for reference column) */
const TASK_SAFE_LIST = new Set([
  'page',
  'text',
  'header',
  'sub_header',
  'sub_sub_header',
  'bulleted_list',
  'numbered_list',
  'code',
  'image',
  'equation',
  'callout',
  'quote',
  'toggle',
  'bookmark',
  'embed',
  'column_list',
  'column',
  'table',
  'table_row',
  'video',
  'audio',
  'file',
  'divider',
  'pdf',
  'tweet',
  'to_do',
])

/** Types that are risky / known-problematic even if notion-x has a case */
const TASK_UNSAFE_LIST = new Set([
  'child_database',
  'child_page',
  'synced_block',
  'unsupported',
  'template',
  'link_preview',
  'breadcrumb',
  'table_of_contents', // task spec listed this as UNSAFE; notion-x actually handles it
])

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Guard: check required env vars
  const dbId = process.env.NOTION_DB_POSTS
  if (!dbId) {
    console.error('[audit-block-types] ERROR: NOTION_DB_POSTS is not set.')
    console.error(
      'Ensure .env.local exists and contains NOTION_DB_POSTS. ' +
        'Run with: npx tsx -r dotenv/config scripts/audit-block-types.ts dotenv_config_path=.env.local'
    )
    process.exit(1)
  }

  const notionToken = process.env.NOTION_TOKEN
  if (!notionToken) {
    console.error('[audit-block-types] ERROR: NOTION_TOKEN is not set.')
    process.exit(1)
  }

  const notionVersion = process.env.NOTION_VERSION
  if (!notionVersion) {
    console.error('[audit-block-types] ERROR: NOTION_VERSION is not set.')
    process.exit(1)
  }

  // Step 1: Query the DB via official API to get ~30 post IDs
  console.error('[audit-block-types] Querying database for post IDs...')
  const notion = new Client({ auth: notionToken })

  let postIds: string[] = []
  try {
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 30,
    })
    if ((response as any).status === 401 || (response as any).code === 'unauthorized') {
      console.error('[audit-block-types] ERROR: Notion API returned 401 — token expired or invalid.')
      process.exit(1)
    }
    postIds = response.results
      .filter((r: any) => r.object === 'page')
      .map((r: any) => r.id)
  } catch (err: any) {
    const status = err?.status ?? err?.code
    if (status === 401 || String(status).includes('unauthorized')) {
      console.error('[audit-block-types] ERROR: 401 Unauthorized — Notion token expired or invalid.')
      process.exit(1)
    }
    console.error('[audit-block-types] ERROR querying database:', err?.message ?? err)
    process.exit(1)
  }

  console.error(`[audit-block-types] Found ${postIds.length} posts to audit.`)

  // Step 2: For each post, getPage via unofficial API and accumulate block types
  const blockTypeCounts = new Map<string, number>()
  const codeLanguages = new Set<string>()
  const calloutColors = new Set<string>()
  const embedProviders = new Set<string>()

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < postIds.length; i++) {
    const postId = postIds[i]
    console.error(`[audit-block-types] [${i + 1}/${postIds.length}] Processing post ${postId}...`)

    try {
      const recordMap = await getPage(postId)

      for (const [_blockId, blockRecord] of Object.entries(recordMap.block)) {
        // The notion-client unofficial API returns a doubly-nested structure:
        //   recordMap.block[id] = { spaceId?, value: { value: Block, role: string } }
        // So the actual Block is at .value.value, not .value.
        // (The TypeScript type says .value but the runtime has the extra nesting.)
        const block = (blockRecord as any)?.value?.value
        if (!block) continue

        const type: string = block.type ?? 'unknown'
        blockTypeCounts.set(type, (blockTypeCounts.get(type) ?? 0) + 1)

        // Accumulate code languages
        if (type === 'code') {
          const lang: string | undefined = block.properties?.language?.[0]?.[0]
          if (lang) codeLanguages.add(lang)
        }

        // Accumulate callout colors
        if (type === 'callout') {
          const color: string | undefined = block.format?.block_color
          if (color) calloutColors.add(color)
        }

        // Accumulate embed providers (display_source)
        if (type === 'embed' || type === 'video' || type === 'drive') {
          const src: string | undefined = block.format?.display_source
          if (src) {
            try {
              const host = new URL(src).hostname
              embedProviders.add(host)
            } catch {
              embedProviders.add(src.substring(0, 60))
            }
          }
        }
      }

      successCount++
    } catch (err: any) {
      failCount++
      console.error(
        `[audit-block-types]   ERROR on post ${postId}: ${err?.message ?? String(err)}`
      )
    }
  }

  console.error(
    `[audit-block-types] Done. Success: ${successCount}, Failed: ${failCount}.`
  )

  // Step 3: Build the markdown report
  const sortedTypes = Array.from(blockTypeCounts.entries()).sort(
    ([, a], [, b]) => b - a // descending count
  )

  const coveredTypes: string[] = []
  const missingTypes: string[] = []

  for (const [type] of sortedTypes) {
    if (HANDLED_IN_BLOCK_TSX.has(type)) {
      coveredTypes.push(type)
    } else {
      missingTypes.push(type)
    }
  }

  const coveredStr =
    coveredTypes.length > 0
      ? coveredTypes.map(t => `- \`${t}\``).join('\n')
      : '- (none)'

  const missingStr =
    missingTypes.length > 0
      ? missingTypes.map(t => `- \`${t}\``).join('\n')
      : '- (none — happy path)'

  const codeLanguagesStr =
    codeLanguages.size > 0
      ? Array.from(codeLanguages)
          .sort()
          .map(l => `- ${l}`)
          .join('\n')
      : '- (none found)'

  const calloutColorsStr =
    calloutColors.size > 0
      ? Array.from(calloutColors)
          .sort()
          .map(c => `- ${c}`)
          .join('\n')
      : '- (none found)'

  const embedStr =
    embedProviders.size > 0
      ? Array.from(embedProviders)
          .sort()
          .map(e => `- ${e}`)
          .join('\n')
      : '- (none found)'

  // Table rows sorted by count descending
  const tableRows = sortedTypes
    .map(([type, count]) => {
      const inBlockTsx = HANDLED_IN_BLOCK_TSX.has(type) ? 'yes' : '**NO**'
      return `| ${type} | ${count} | ${inBlockTsx} |`
    })
    .join('\n')

  const phase3Implication =
    missingTypes.length === 0
      ? 'Every block type found in math2it\'s posts is already covered by an explicit `case` in ' +
        '`notion-x/src/components/block.tsx`. Vendoring is mechanical: copy components, rewrite import ' +
        'paths, and no new switch-case arms are required.'
      : `The following block type(s) appear in posts but have NO explicit case in ` +
        `\`notion-x/src/components/block.tsx\` (they fall through to the \`default\` renderer which ` +
        `logs and returns an empty \`<div>\`): ${missingTypes.map(t => `\`${t}\``).join(', ')}. ` +
        `These must receive explicit handling during Phase 3 vendoring.`

  const report = `# Block-Type Audit — ${new Date().toISOString().slice(0, 10)}

Generated by \`scripts/audit-block-types.ts\` as part of Phase 1, Task 1.3 of the
notion-x static-build refactor.

## Sample Size

- Posts inspected: **${successCount}** (of ${postIds.length} attempted)
- Posts failed: **${failCount}**
- Total unique block types seen: **${sortedTypes.length}**

## Sorted Block-Type Table

| block_type | count | in block.tsx? |
|------------|-------|--------------|
${tableRows}

## Covered by notion-x (explicit case in block.tsx)

${coveredStr}

## Missing / Needs Explicit Handling During Vendoring

${missingStr}

## Distinct Code Languages Seen

${codeLanguagesStr}

## Distinct Callout Colors Seen

${calloutColorsStr}

## Distinct Embed / Video Providers Seen (display_source hosts)

${embedStr}

## Phase 3 Vendoring Implication

${phase3Implication}

---

### Reference: notion-x block.tsx switch-case coverage

The following types have an explicit \`case\` arm in \`notion-x/src/components/block.tsx\`:

${Array.from(HANDLED_IN_BLOCK_TSX)
  .sort()
  .map(t => `- \`${t}\``)
  .join('\n')}

### Reference: Task Spec SAFE List (may differ from actual block.tsx coverage)

${Array.from(TASK_SAFE_LIST)
  .sort()
  .map(t => `- \`${t}\``)
  .join('\n')}

### Reference: Task Spec UNSAFE / Risky List

${Array.from(TASK_UNSAFE_LIST)
  .sort()
  .map(t => `- \`${t}\``)
  .join('\n')}
`

  // Print to stdout
  console.log(report)

  // Write to file
  const outPath = path.resolve(__dirname, '../docs/research/block-types-2026-05-19.md')
  fs.writeFileSync(outPath, report, 'utf8')
  console.error(`[audit-block-types] Report written to ${outPath}`)
}

main().catch(err => {
  console.error('[audit-block-types] Fatal error:', err)
  process.exit(1)
})
