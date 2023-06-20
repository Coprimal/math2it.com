import { getPlaceholderImage } from '@app/lib/fetcher'
import { BookmarkPreview, ImageType } from '@src/interface'
import { type NextRequest, NextResponse } from 'next/server'
import { unfurl } from 'unfurl.js'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { message: 'A valid URL string is required', code: 400 },
      { status: 400 }
    )
  }

  try {
    const unfurled = await unfurl(url)
    const image = (await parseImage(unfurled.open_graph?.images?.[0]?.url)) ?? null
    const bookmark: BookmarkPreview = {
      title: cleanText(unfurled.title) ?? null,
      description: cleanText(unfurled.description) ?? null,
      favicon: unfurled.favicon ?? null,
      image
    }
    return NextResponse.json(bookmark)
  } catch (e: any) {
    if (e?.code === 'ENOTFOUND') {
      return NextResponse.json(
        { message: 'The URL could not be found', code: 404 },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'An unknown error occurred', code: 500 }, { status: 500 })
  }
}

function cleanText(text?: string) {
  if (!text) return null
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}

async function parseImage(imgUrl?: string): Promise<ImageType> {
  if (!imgUrl) return null
  const { base64, width, height } = await getPlaceholderImage(imgUrl)
  return { sourceUrl: imgUrl, blurDataURL: base64, width, height }
}
