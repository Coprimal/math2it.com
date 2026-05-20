import { notFound } from 'next/navigation'
import type { ExtendedRecordMap } from 'notion-types'

import PostBody from '@/src/components/notion/PostBody'
import { getPage } from '@/src/lib/notion/api'
import { defaultBlockOptions } from '@/src/app/lib/config'

export const dynamic = 'force-dynamic'

export const metadata = { robots: { index: false, follow: false } }

const KNOWN_PAGE_ID = process.env.ABOUT_PAGE || ''

export default async function DebugNotionPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  if (!KNOWN_PAGE_ID) {
    return <p>Set ABOUT_PAGE env var to use this debug page.</p>
  }
  const recordMap = (await getPage(KNOWN_PAGE_ID)) as ExtendedRecordMap
  return (
    <main style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Debug: vendored Notion renderer</h1>
      <PostBody
        recordMap={recordMap}
        blockOptions={defaultBlockOptions}
        useSimpleImage={true}
      />
    </main>
  )
}
