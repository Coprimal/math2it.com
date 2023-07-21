import { NOTION_DB_POSTS, notionMaxRequest } from '@app/lib/config'
import {
  getAuthors,
  getBlocks,
  getCategories,
  getPostHeader,
  getPosts,
  getTags
} from '@app/lib/fetcher'
import SinglePostTemplate from '@app/templates/SinglePostTemplate'
import { DynamicSegmentParamsProps } from '@src/interface'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import 'react-medium-image-zoom/dist/styles.css'

import { getJoinedRichText } from '../../lib/block-helpers'
import { generateMetaTitle } from '../../lib/helpers'

export async function generateMetadata({ params }: DynamicSegmentParamsProps): Promise<Metadata> {
  const slug = params.slug || ''
  const untitled = 'Bài viết không xác định | Math2IT'
  if (!slug) return { title: untitled }
  const allPosts = await getPosts({
    dbId: NOTION_DB_POSTS,
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
    dbId: NOTION_DB_POSTS,
    pageSize: notionMaxRequest
  })
  const params = allPosts.filter(post => post.slug).map(post => ({ slug: post.slug }))
  return params
}

export default async function SinglePostPage({ params }: DynamicSegmentParamsProps) {
  const slug = params.slug || ''
  if (!slug) return notFound()

  try {
    const categories = getCategories()
    const tagsData = getTags()
    const authorsData = getAuthors()
    const [tags, authors] = await Promise.all([tagsData, authorsData])

    const allPosts = await getPosts({
      dbId: NOTION_DB_POSTS,
      categories,
      tags,
      authors,
      pageSize: notionMaxRequest
    })
    const post = allPosts.find(post => post.slug === slug)
    const pageIdwithDash = post?.id
    if (!pageIdwithDash) notFound()

    const postHeader = await getPostHeader(pageIdwithDash)
    const contentBlocks = await getBlocks(pageIdwithDash)

    /* ###Thi */ console.log(`👉👉👉 contentBlocks: ${JSON.stringify(contentBlocks)}`)

    return <SinglePostTemplate postHeader={postHeader} contentBlocks={contentBlocks} />
  } catch (error) {
    console.log('🚨Error when loading a single post page', error)
    notFound()
  }
}
