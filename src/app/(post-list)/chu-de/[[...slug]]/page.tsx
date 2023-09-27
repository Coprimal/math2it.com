import tagCover from '@/public/featured-images/tag.png'
import { getSlugPrefix, notionMaxRequest } from '@app/lib/config'
import { getAuthors, getCategories, getPostsBy, getTags } from '@app/lib/fetcher'
import { generateMetaTitle, getFilterOf } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { getStartCursorForCurrentPage } from '@notion-x/helpers'
import { OptionalCatchAllParams, OptionalCatchAllProps, Tag } from '@notion-x/interface'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 20

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
      pageSize: notionMaxRequest,
      getFull: true
    })
    const numPosts = allPosts?.length || 0
    const totalPages = Math.ceil(numPosts / +process.env.POSTS_PER_PAGE!)
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

  console.log(`\n👉 uri: /chu-de/${slug}/${getSlugPrefix('page')}/${currentPage}/`)

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
    pageSize: notionMaxRequest,
    getFull: true
  })
  const totalPages = Math.ceil(allPosts.length / +process.env.POSTS_PER_PAGE!)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('tag')}/${slug}/`)
  }

  if (currentPage !== 1 && currentPage > totalPages) {
    notFound()
  }

  const startCursor = getStartCursorForCurrentPage(
    currentPage,
    allPosts,
    +process.env.POSTS_PER_PAGE!
  )
  const postsOnThisPage = !allPosts.length
    ? []
    : await getPostsBy({
        categories,
        authors,
        filter: getFilterOf('tag', tag),
        startCursor,
        pageSize: +process.env.POSTS_PER_PAGE!,
        getFull: true
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
