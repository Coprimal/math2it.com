import { defaultBlockOptions } from '@app/lib/config'
import { getAuthors, getCategories, getPosts } from '@app/lib/fetcher'
import SinglePostTemplate from '@app/templates/SinglePostTemplate'
import { DynamicSegmentParamsProps } from '@notion-x/src/interface'
import { getJoinedRichText } from '@notion-x/src/lib/helpers'
import { notionX } from '@notion-x/src/lib/notionx'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { generateMetaTitle, getRelatedPosts } from '../../lib/helpers'

export const revalidate = 20

export async function generateMetadata({ params }: DynamicSegmentParamsProps): Promise<Metadata> {
  const slug = params.slug || ''
  const untitled = 'Bài viết không xác định | Math2IT'
  if (!slug) return { title: untitled }
  console.log(`\n👉 slug: ${slug}`)
  const allPosts = await getPosts()
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
  const allPosts = await getPosts()
  const params = allPosts.filter(post => post.slug).map(post => ({ slug: post.slug }))
  return params
}

export default async function SinglePostPage({ params }: DynamicSegmentParamsProps) {
  const slug = params.slug || ''
  if (!slug) notFound()

  try {
    const categories = getCategories()
    const authors = await getAuthors()

    /**
     * Still use getPosts() instead of getUnofficialPosts() because there are no advantages + if we
     * use, we need to integrate "block" inside posts (too heavy) to get covers for related posts.
     */
    const allPosts = await getPosts({
      categories,
      authors
    })
    const post = allPosts.find(post => post.slug === slug)
    const pageIdwithDash = post?.id
    if (!pageIdwithDash) notFound()

    const recordMap = await notionX.getPage(pageIdwithDash)
    const relatedPosts = getRelatedPosts(allPosts, post, 8)

    return (
      <SinglePostTemplate
        recordMap={recordMap}
        authors={authors}
        relatedPosts={relatedPosts}
        blockOptions={defaultBlockOptions}
      />
    )
  } catch (error) {
    console.log('🚨 Error when loading a single post page', error)
    notFound()
  }
}
