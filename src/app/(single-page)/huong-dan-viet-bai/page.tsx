import { notFound } from 'next/navigation'

import { getBlocks, getPostHeader } from '../../lib/fetcher'
import { generateMetaTitle } from '../../lib/helpers'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export const revalidate = 60

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
    const postHeader = await getPostHeader(process.env.WRITING_GUIDELINES_PAGE as string)
    const contentBlocks = await getBlocks(process.env.WRITING_GUIDELINES_PAGE as string)
    return (
      <SinglePostTemplate
        isPage={true}
        blockOptions={{ disableAnchorHeading: true }}
        postHeader={postHeader}
        contentBlocks={contentBlocks}
      />
    )
  } catch (error) {
    console.log('🚨Error when loading a single post page', error)
    notFound()
  }
}
