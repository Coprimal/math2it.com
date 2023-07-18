import { notFound } from 'next/navigation'

import { ABOUT_PAGE } from '../../lib/config'
import { getBlocks, getPostHeader } from '../../lib/fetcher'
import { generateMetaTitle } from '../../lib/helpers'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export const metadata = {
  title: generateMetaTitle('Giới thiệu'),
  description: 'Giới thiệu trang web Math2IT và quyền riêng tư của bạn cũng như của chúng tôi.'
}

export default async function AboutPage() {
  try {
    const postHeader = await getPostHeader(ABOUT_PAGE)
    const contentBlocks = await getBlocks(ABOUT_PAGE)
    return <SinglePostTemplate postHeader={postHeader} contentBlocks={contentBlocks} />
  } catch (error) {
    console.log('🚨Error when loading a single post page', error)
    notFound()
  }
}
