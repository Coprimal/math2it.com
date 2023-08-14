import { defaultBlockOptionsContext, notionMaxRequest } from '@app/lib/config'
import { getAuthors, getBlocks, getCategories, getPostHeader, getPosts } from '@app/lib/fetcher'
import SinglePostTemplate from '@app/templates/SinglePostTemplate'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getJoinedRichText } from 'notion-nextjs-lib/dist/helpers/block-helpers'
import { DynamicSegmentParamsProps } from 'notion-nextjs-lib/dist/interface'
import 'react-medium-image-zoom/dist/styles.css'

import { generateMetaTitle, getRelatedPosts } from '../../lib/helpers'

export const revalidate = 60

export async function generateMetadata({ params }: DynamicSegmentParamsProps): Promise<Metadata> {
  const slug = params.slug || ''
  const untitled = 'Bài viết không xác định | Math2IT'
  if (!slug) return { title: untitled }
  const allPosts = await getPosts({
    dbId: process.env.NOTION_DB_POSTS as string,
    pageSize: notionMaxRequest
  })
  const post = allPosts.find(post => post.slug === slug)
  if (!post) return { title: untitled, description: undefined }
  return {
    title: generateMetaTitle(post.title),
    description: getJoinedRichText(post.excerpt),
    openGraph: {
      images: [
        {
          url: post.featuredImage?.sourceUrl || ''
        }
      ]
    }
  }
}

export async function generateStaticParams() {
  const allPosts = await getPosts({
    dbId: process.env.NOTION_DB_POSTS as string,
    pageSize: notionMaxRequest
  })
  const params = allPosts.filter(post => post.slug).map(post => ({ slug: post.slug }))
  return params
}

export default async function SinglePostPage({ params }: DynamicSegmentParamsProps) {
  const slug = params.slug || ''
  if (!slug) notFound()

  try {
    const categories = getCategories()
    const authors = await getAuthors()

    const allPosts = await getPosts({
      dbId: process.env.NOTION_DB_POSTS as string,
      categories,
      authors,
      pageSize: notionMaxRequest
    })
    const post = allPosts.find(post => post.slug === slug)
    const pageIdwithDash = post?.id
    if (!pageIdwithDash) notFound()

    const postHeader = await getPostHeader(pageIdwithDash)
    const contentBlocks = await getBlocks(pageIdwithDash)
    const relatedPosts = getRelatedPosts(allPosts, post, 8)

    return (
      <SinglePostTemplate
        postHeader={postHeader}
        contentBlocks={contentBlocks}
        relatedPosts={relatedPosts}
        blockOptionsContext={defaultBlockOptionsContext}
      />
    )
  } catch (error) {
    console.log('🚨Error when loading a single post page', error)
    notFound()
  }
}
