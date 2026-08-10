import { getPage } from '@notion-x/src/lib/notionx'
import { notFound } from 'next/navigation'

import { defaultBlockOptions } from '../../lib/config'
import { getAuthors } from '../../lib/fetcher'
import { generateMetaTitle } from '../../lib/helpers'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export const revalidate = 20

export const metadata = {
  title: generateMetaTitle('Hướng dẫn viết bài'),
  description: 'Tiêu chuẩn chung khi viết bài trên Math2IT.',
  openGraph: {
    images: [
      {
        url: 'https://i.imgur.com/a2Nzwnnh.jpg',
        width: 1024,
        height: 591
      }
    ]
  }
}

export default async function AboutPage() {
  try {
    const recordMap = await getPage(process.env.WRITING_GUIDELINES_PAGE as string)
    const authors = await getAuthors()
    return (
      <SinglePostTemplate
        recordMap={recordMap}
        isPage={true}
        authors={authors}
        blockOptions={defaultBlockOptions}
      />
    )
  } catch (error) {
    console.log('🚨 Lỗi khi load trang "Hướng dẫn viết bài"', error)
    notFound()
  }
}
