import { getSlugPrefix, notionMaxRequest, numPostsPerPage } from '@app/lib/config'
import { getAuthors, getCategories, getPostsBy, getTags } from '@app/lib/fetcher'
import { generateMetaTitle, getFilterOf } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import tagCover from '@root/public/featured-images/tag.png'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getStartCursorForCurrentPage } from 'notion-nextjs-lib/dist/helpers/helpers'
import {
  OptionalCatchAllParams,
  OptionalCatchAllProps,
  Tag
} from 'notion-nextjs-lib/dist/interface'

export const revalidate = 60

export async function generateMetadata({ params }: OptionalCatchAllProps): Promise<Metadata> {
  const slug = params.slug[0] || ''
  const currentPage = +(params?.slug?.[2] || 1)
  const tags = await getTags()
  const tag = getTag(slug, tags)
  if (!tag)
    return {
      title: generateMetaTitle('Chủ đề không xác định')
    }
  return {
    title: generateMetaTitle(`Chủ đề "${tag.name}" - trang ${currentPage}`)
  }
}

export async function generateStaticParams() {
  const tags = await getTags()
  const params = [] as OptionalCatchAllParams[]
  for (const tag of tags) {
    const allPosts = await getPostsBy({
      filter: getFilterOf('tag', tag),
      pageSize: notionMaxRequest
    })
    const numPosts = allPosts?.length || 0
    const totalPages = Math.ceil(numPosts / numPostsPerPage)
    for (let i = 1; i <= totalPages; i++) {
      const path =
        i === 1 ? { slug: [tag.slug!] } : { slug: [tag.slug!, getSlugPrefix('page'), i.toString()] }
      params.push(path)
    }
  }
  return params
}

export default async function TagPage({ params }: OptionalCatchAllProps) {
  const currentPage = +(params?.slug?.[2] || 1)

  if (
    !params ||
    !params?.slug ||
    (params.slug.length > 1 && params.slug[1] !== getSlugPrefix('page')) ||
    params.slug.length > 3
  ) {
    notFound()
  }

  const notRootPage = params.slug.length > 1
  const slug = params.slug[0] || ''

  const categories = getCategories()
  const tagsData = getTags()
  const authorsData = getAuthors()
  const [tags, authors] = await Promise.all([tagsData, authorsData])
  const tag = getTag(slug, tags)
  if (!tag) notFound()

  // All posts in that category, we need these to find the number of pages
  const allPosts = await getPostsBy({
    categories,
    authors,
    filter: getFilterOf('tag', tag),
    pageSize: notionMaxRequest
  })
  const totalPages = Math.ceil(allPosts.length / numPostsPerPage)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('tag')}/${slug}/`)
  }

  if (currentPage !== 1 && currentPage > totalPages) {
    notFound()
  }

  const startCursor = getStartCursorForCurrentPage(currentPage, allPosts, numPostsPerPage)
  const postsOnThisPage = !allPosts.length
    ? []
    : await getPostsBy({
        categories,
        authors,
        filter: getFilterOf('tag', tag),
        startCursor,
        pageSize: numPostsPerPage
      })

  return (
    <PageOfPostsListTemplate
      title={`Thẻ "${tag.name}"`}
      uri={tag.uri}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
      iconComponent={<i className="icon-tag-2"></i>}
      cover={tagCover}
      postTypeOpts={{ hideCategory: false }}
    />
  )
}

function getTag(slug: string, tags: Tag[]) {
  return tags.find(t => t.slug === slug || t.slug === slug.replace(/%26/g, '&'))
}
