import { notFound } from 'next/navigation'

import { getBlocks, getPostHeader } from '../../lib/fetcher'
import { generateMetaTitle } from '../../lib/helpers'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export const revalidate = 60

export const metadata = {
  title: generateMetaTitle('Giới thiệu'),
  description: 'Giới thiệu trang web Math2IT và quyền riêng tư của bạn cũng như của chúng tôi.',
  openGraph: {
    images: [
      {
        url: 'https://i.imgur.com/PyXUtfTh.png',
        width: 1024,
        height: 591
      }
    ]
  }
}

export default async function AboutPage() {
  try {
    const postHeader = await getPostHeader(process.env.ABOUT_PAGE as string)
    const contentBlocks = await getBlocks(process.env.ABOUT_PAGE as string)
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
