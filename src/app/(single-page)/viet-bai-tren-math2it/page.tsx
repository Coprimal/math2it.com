import { notFound } from 'next/navigation'

import { defaultBlockOptionsContext } from '../../lib/config'
import { getBlocks, getPostHeader } from '../../lib/fetcher'
import { generateMetaTitle } from '../../lib/helpers'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export const metadata = {
  title: generateMetaTitle('Viết bài cùng Math2IT'),
  description: 'Cùng Math2IT tạo nên những bài viết chất lượng về Toán, Tin và Công nghệ.',
  openGraph: {
    images: [
      {
        url: 'https://i.imgur.com/IGneUknh.jpg',
        width: 1024,
        height: 591
      }
    ]
  }
}

export default async function WriteWithUsPage() {
  try {
    const postHeader = await getPostHeader(process.env.WRITE_WITH_US_PAGE as string)
    const contentBlocks = await getBlocks(process.env.WRITE_WITH_US_PAGE as string)
    return (
      <SinglePostTemplate
        isPage={true}
        hideWriteWithUs={true}
        postHeader={postHeader}
        contentBlocks={contentBlocks}
        blockOptionsContext={defaultBlockOptionsContext}
      />
    )
  } catch (error) {
    console.log('🚨Error when loading a single post page', error)
    notFound()
  }
}
