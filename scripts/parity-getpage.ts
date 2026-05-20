/**
 * Parity test: new `getPage` (src/lib/notion/api.ts) vs OLD `notion-client`-based
 * `getPage` (notion-x/src/lib/notionx.ts).
 *
 * Safety net for the Phase 4 swap.
 *
 * Run via:
 *   yarn parity:getpage
 *   (which expands to: npx tsx -r dotenv/config scripts/parity-getpage.ts dotenv_config_path=.env.local)
 *
 * DO NOT run as part of CI — requires real Notion credentials and will hammer the
 * Notion API.  This script is intentionally skipped during automated test runs.
 */

import * as fs from 'fs'
import * as path from 'path'

import { queryDatabase } from '../src/lib/notion/db-official'
import { getPage as getPageNew } from '../src/lib/notion/api'
import { getPage as getPageOld } from '../notion-x/src/lib/notionx'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BlockValue {
  type?: string
  properties?: { title?: unknown }
  content?: string[]
}

interface RecordMap {
  block: Record<string, { value?: BlockValue }>
}

interface PerPostResult {
  id: string
  status: 'OK' | 'ERROR' | 'DIFFS'
  error?: string
  onlyNew?: string[]
  onlyOld?: string[]
  fieldDiffs?: FieldDiff[]
}

interface FieldDiff {
  blockId: string
  field: string
  newVal: unknown
  oldVal: unknown
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sort an array copy to get stable comparison */
function sortedCopy(arr: string[] | undefined): string[] {
  return arr ? [...arr].sort() : []
}

/** Compare two block values, skipping last_edited_time */
function diffBlockValues(
  blockId: string,
  newVal: BlockValue | undefined,
  oldVal: BlockValue | undefined
): FieldDiff[] {
  const diffs: FieldDiff[] = []

  if (!newVal && !oldVal) return diffs

  // type
  if ((newVal?.type ?? null) !== (oldVal?.type ?? null)) {
    diffs.push({ blockId, field: 'type', newVal: newVal?.type, oldVal: oldVal?.type })
  }

  // properties.title — compare JSON string for simplicity
  const newTitle = JSON.stringify(newVal?.properties?.title ?? null)
  const oldTitle = JSON.stringify(oldVal?.properties?.title ?? null)
  if (newTitle !== oldTitle) {
    diffs.push({ blockId, field: 'properties.title', newVal: newTitle, oldVal: oldTitle })
  }

  // content — sorted arrays compared as JSON
  const newContent = JSON.stringify(sortedCopy(newVal?.content))
  const oldContent = JSON.stringify(sortedCopy(oldVal?.content))
  if (newContent !== oldContent) {
    diffs.push({ blockId, field: 'content', newVal: newContent, oldVal: oldContent })
  }

  return diffs
}

/** Rate-limit helper */
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dbId = process.env.NOTION_DB_POSTS
  if (!dbId) {
    console.error('[parity-getpage] ERROR: NOTION_DB_POSTS is not set.')
    console.error(
      'Run with: npx tsx -r dotenv/config scripts/parity-getpage.ts dotenv_config_path=.env.local'
    )
    process.exit(1)
  }

  // -------------------------------------------------------------------------
  // Step 1: Collect 10 representative post IDs
  // -------------------------------------------------------------------------
  console.log('[parity-getpage] Querying database for 10 recent post IDs...')

  let postIds: string[] = []

  try {
    // Use finalModified sort — same property name as fetcher.ts#getPosts
    const response = await queryDatabase({
      dbId,
      pageSize: 10,
      sorts: [{ property: 'finalModified', direction: 'descending' }]
    })
    postIds = response.results
      .filter((r: any) => r.object === 'page')
      .map((r: any) => r.id as string)
  } catch (sortErr: any) {
    console.warn(
      '[parity-getpage] Sort by finalModified failed (%s), retrying without sort...',
      String(sortErr?.message ?? sortErr)
    )
    try {
      const response = await queryDatabase({ dbId, pageSize: 10 })
      postIds = response.results
        .filter((r: any) => r.object === 'page')
        .map((r: any) => r.id as string)
    } catch (fallbackErr: any) {
      console.error('[parity-getpage] FATAL: could not query database:', fallbackErr)
      process.exit(1)
    }
  }

  if (postIds.length === 0) {
    console.error('[parity-getpage] No post IDs returned from database.')
    process.exit(1)
  }

  console.log(`[parity-getpage] Got ${postIds.length} post ID(s).`)

  // -------------------------------------------------------------------------
  // Step 2: Fetch and compare each post
  // -------------------------------------------------------------------------
  const results: PerPostResult[] = []

  for (let i = 0; i < postIds.length; i++) {
    const id = postIds[i]
    process.stdout.write(`[parity-getpage] [${i + 1}/${postIds.length}] ${id} ... `)

    try {
      const [newRM, oldRM] = await Promise.all([
        getPageNew(id) as Promise<RecordMap>,
        getPageOld(id) as Promise<RecordMap>
      ])

      const newKeys = new Set(Object.keys(newRM.block))
      const oldKeys = new Set(Object.keys(oldRM.block))

      const onlyNew = [...newKeys].filter(k => !oldKeys.has(k))
      const onlyOld = [...oldKeys].filter(k => !newKeys.has(k))

      // Compare blocks present in BOTH
      const commonKeys = [...newKeys].filter(k => oldKeys.has(k))
      const fieldDiffs: FieldDiff[] = []
      for (const blockId of commonKeys) {
        const diffs = diffBlockValues(blockId, newRM.block[blockId]?.value, oldRM.block[blockId]?.value)
        fieldDiffs.push(...diffs)
      }

      const hasDiffs = onlyNew.length > 0 || onlyOld.length > 0 || fieldDiffs.length > 0

      if (hasDiffs) {
        const sample = fieldDiffs
          .slice(0, 3)
          .map(d => `${d.blockId.slice(0, 8)}.${d.field}`)
          .join(', ')
        console.log(
          `DIFFS: keyset OnlyNew=${onlyNew.length} OnlyOld=${onlyOld.length}, fieldDiffs=${fieldDiffs.length}${sample ? ` (sampled: ${sample})` : ''}`
        )
        results.push({ id, status: 'DIFFS', onlyNew, onlyOld, fieldDiffs })
      } else {
        console.log('OK')
        results.push({ id, status: 'OK' })
      }
    } catch (err: any) {
      const message = String(err?.message ?? err)
      console.log(`ERROR: ${message}`)
      results.push({ id, status: 'ERROR', error: message })
    }

    // Rate-limit between posts
    if (i < postIds.length - 1) {
      await sleep(500)
    }
  }

  // -------------------------------------------------------------------------
  // Step 3: Summary
  // -------------------------------------------------------------------------
  const okCount = results.filter(r => r.status === 'OK').length
  const diffCount = results.filter(r => r.status === 'DIFFS').length
  const errCount = results.filter(r => r.status === 'ERROR').length
  const total = results.length

  console.log('')
  console.log(`OK: ${okCount}/${total}, DIFFS: ${diffCount}/${total}, ERRORS: ${errCount}/${total}`)

  // -------------------------------------------------------------------------
  // Step 4: Write Markdown report
  // -------------------------------------------------------------------------
  const reportPath = path.resolve(__dirname, '../docs/research/parity-getpage-2026-05-20.md')

  const now = new Date().toISOString()
  const lines: string[] = [
    '# Parity Report: `getPage` NEW vs OLD',
    '',
    '## TL;DR',
    '',
    `> Run \`yarn parity:getpage\` to populate this report — captured on ${now.slice(0, 10)} UTC.`,
    `> Results as of ${now} UTC.`,
    `> **OK: ${okCount}/${total} | DIFFS: ${diffCount}/${total} | ERRORS: ${errCount}/${total}**`,
    '',
  ]

  for (const r of results) {
    lines.push(`## ${r.id}`)
    lines.push('')
    lines.push(`**Status:** ${r.status}`)
    lines.push('')

    if (r.status === 'ERROR') {
      lines.push(`**Error:** \`${r.error}\``)
      lines.push('')
      continue
    }

    if (r.status === 'OK') {
      lines.push('No differences found.')
      lines.push('')
      continue
    }

    // DIFFS
    lines.push(`**Keyset only in NEW:** ${(r.onlyNew ?? []).length} block(s)`)
    lines.push('')
    if ((r.onlyNew ?? []).length > 0) {
      lines.push('```')
      lines.push((r.onlyNew ?? []).slice(0, 20).join('\n'))
      if ((r.onlyNew ?? []).length > 20) lines.push(`... and ${(r.onlyNew ?? []).length - 20} more`)
      lines.push('```')
      lines.push('')
    }

    lines.push(`**Keyset only in OLD:** ${(r.onlyOld ?? []).length} block(s)`)
    lines.push('')
    if ((r.onlyOld ?? []).length > 0) {
      lines.push('```')
      lines.push((r.onlyOld ?? []).slice(0, 20).join('\n'))
      if ((r.onlyOld ?? []).length > 20) lines.push(`... and ${(r.onlyOld ?? []).length - 20} more`)
      lines.push('```')
      lines.push('')
    }

    lines.push(`**Field diffs:** ${(r.fieldDiffs ?? []).length}`)
    lines.push('')

    if ((r.fieldDiffs ?? []).length > 0) {
      lines.push('| Block ID | Field | NEW value | OLD value |')
      lines.push('| -------- | ----- | --------- | --------- |')
      for (const d of (r.fieldDiffs ?? []).slice(0, 30)) {
        const newStr = String(d.newVal ?? '').slice(0, 60).replace(/\|/g, '\\|')
        const oldStr = String(d.oldVal ?? '').slice(0, 60).replace(/\|/g, '\\|')
        lines.push(`| \`${d.blockId.slice(0, 8)}\` | \`${d.field}\` | ${newStr} | ${oldStr} |`)
      }
      if ((r.fieldDiffs ?? []).length > 30) {
        lines.push(`| … | … | … | … | _(${(r.fieldDiffs ?? []).length - 30} more rows omitted)_ |`)
      }
      lines.push('')
    }
  }

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8')
  console.log(`[parity-getpage] Report written to ${reportPath}`)
}

main().catch(err => {
  console.error('[parity-getpage] Uncaught error:', err)
  process.exit(1)
})
