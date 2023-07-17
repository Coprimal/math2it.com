import { notFound } from 'next/navigation'

import { WRITE_WITH_US_PAGE } from '../../lib/config'
import { getBlocks, getPostHeader } from '../../lib/fetcher'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export default async function WriteWithUsPage() {
  try {
    const postHeader = await getPostHeader(WRITE_WITH_US_PAGE)
    const contentBlocks = await getBlocks(WRITE_WITH_US_PAGE)
    return <SinglePostTemplate postHeader={postHeader} contentBlocks={contentBlocks} />
  } catch (error) {
    console.log('🚨Error when loading a single post page', error)
    notFound()
  }
}
