import {
  RichTextItemResponse,
  TextRichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints'
import { AnnotationIgnoreField } from '@src/interface'
import cn from 'classnames'

export function generateTextAnnotationClasses(
  annotations: TextRichTextItemResponse['annotations'],
  ignore?: AnnotationIgnoreField[]
): string {
  return cn({
    'font-semibold': annotations.bold && !ignore?.includes('bold'),
    italic: annotations.italic && !ignore?.includes('italic'),
    'underline underline-offset-4': annotations.underline && !ignore?.includes('underline'),
    'line-through': annotations.strikethrough && !ignore?.includes('strikethrough'),
    'font-mono text-[85%] bg-slate-200 text-rose-500 px-1 py-0 rounded':
      annotations.code && !ignore?.includes('code'),
    [mapColorClass(annotations.color)]: true && !ignore?.includes('color')
  })
}

export function mapColorClass(color: string): string {
  switch (color) {
    case 'gray':
      return 'text-gray-500'
    case 'brown':
      return 'text-brown-500'
    case 'orange':
      return 'text-orange-500'
    case 'yellow':
      return 'text-yellow-500'
    case 'green':
      return 'text-green-500'
    case 'blue':
      return 'text-blue-500'
    case 'purple':
      return 'text-purple-500'
    case 'pink':
      return 'text-pink-500'
    case 'red':
      return 'text-red-500'
    // Highlight
    case 'gray_background':
      return 'bg-gray-100'
    case 'brown_background':
      return 'bg-brown-100'
    case 'orange_background':
      return 'bg-orange-100'
    case 'yellow_background':
      return 'bg-yellow-100'
    case 'green_background':
      return 'bg-green-100'
    case 'blue_background':
      return 'bg-blue-100'
    case 'purple_background':
      return 'bg-purple-100'
    case 'pink_background':
      return 'bg-pink-100'
    case 'red_background':
      return 'bg-red-100'
    default:
      return ''
  }
}

export function getIndentLevelClass(level: number): string {
  switch (level) {
    case 0:
      return 'pl-0'
    case 1:
      return 'pl-4'
    case 2:
      return 'pl-8'
    default:
      return 'pl-0'
  }
}

export function getJoinedRichText(richTextArr: RichTextItemResponse[]): string {
  if (!richTextArr || !richTextArr.length) return ''
  const textArr = richTextArr.map((richText: RichTextItemResponse) => richText.plain_text)
  return textArr.join('')
}

export function convertHeadingIdToSlug(
  headingId: string,
  richTextArr: RichTextItemResponse[]
): string {
  const plainText = getJoinedRichText(richTextArr)
  return plainText.split(' ').join('-').toLowerCase() + `-${headingId.slice(0, 3)}`
}

export function getYoutubeVideoId(url?: string): string | null {
  if (!url) return null
  let videoId: string | null = null
  const patterns = [
    /(?:https?:\/\/(?:www\.)?)?youtube\.com\/watch\?(?:.*&)?v=([^&#]+)/i,
    /(?:https?:\/\/(?:www\.)?)?youtube\.com\/embed\/([^/?]+)/i,
    /(?:https?:\/\/(?:www\.)?)?youtube\.com\/v\/([^/?]+)/i,
    /(?:https?:\/\/(?:www\.)?)?youtube\.com\/user\/[^/?]+\/?\?v=([^&]+)/i,
    /(?:https?:\/\/(?:www\.)?)?youtu\.be\/([^/?]+)/i
  ]
  for (let i = 0; i < patterns.length; i++) {
    const match = url.match(patterns[i])
    if (match && match[1]) {
      videoId = match[1]
      break
    }
  }
  return videoId
}
