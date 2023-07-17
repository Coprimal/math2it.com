import { notFound } from 'next/navigation'

import { ABOUT_PAGE } from '../../lib/config'
import { getBlocks, getPostHeader } from '../../lib/fetcher'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

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
