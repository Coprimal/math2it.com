import { BookmarkPreview } from '@src/interface'
import { type NextRequest, NextResponse } from 'next/server'
import { unfurl } from 'unfurl.js'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { error: 'A valid URL string is required', code: 400 },
      { status: 400 }
    )
  }

  try {
    const unfurled = await unfurl(url)
    const bookmark: BookmarkPreview = {
      url,
      title: cleanText(unfurled.title) ?? null,
      description: cleanText(unfurled.description) ?? null,
      favicon: unfurled.favicon ?? null,
      imageSrc: unfurled.open_graph?.images?.[0]?.url ?? null
    }
    return NextResponse.json(bookmark)
  } catch (e: any) {
    if (e?.code === 'ENOTFOUND') {
      return NextResponse.json({ error: 'The URL could not be found', code: 404 }, { status: 404 })
    }

    return NextResponse.json({ error: 'An unknown error occurred', code: 500 }, { status: 500 })
  }
}

function cleanText(text?: string) {
  if (!text) return null
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}
