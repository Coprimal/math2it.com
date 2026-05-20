import tagCover from '@/public/featured-images/tag.png'
import { getSlugPrefix } from '@app/lib/config'
import { getAuthors, getCategories, getPosts, getTags } from '@app/lib/fetcher'
import { generateMetaTitle, getFilterOf } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { OptionalCatchAllParams, OptionalCatchAllProps, Tag } from '@/src/types/notion'
import { getStartCursorForCurrentPage } from '@/src/lib/notion/helpers'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const dynamicParams = false

export async function generateMetadata(props: OptionalCatchAllProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug?.[0] || ''
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
    const allPosts = await getPosts({
      filter: getFilterOf('tag', tag)
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

export default async function TagPage(props: OptionalCatchAllProps) {
  const params = await props.params;
  const currentPage = +(params?.slug?.[2] || 1)

  if (
    !params ||
    !params?.slug ||
    (params.slug.length > 1 && params.slug[1] !== getSlugPrefix('page')) ||
    params.slug.length > 3
  ) {
    notFound()
  }

  const slug = params.slug[0] || ''

  console.log(`\n👉 uri: /chu-de/${slug}/${getSlugPrefix('page')}/${currentPage}/`)

  const categories = getCategories()
  const tagsData = getTags()
  const authorsData = getAuthors()
  const [tags, authors] = await Promise.all([tagsData, authorsData])
  const tag = getTag(slug, tags)
  if (!tag) notFound()

  // All posts in that category, we need these to find the number of pages
  const allPosts = await getPosts({
    categories,
    authors,
    filter: getFilterOf('tag', tag)
  })
  const totalPages = Math.ceil(allPosts.length / +process.env.POSTS_PER_PAGE!)

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
    : await getPosts({
        categories,
        authors,
        filter: getFilterOf('tag', tag),
        startCursor,
        pageSize: +process.env.POSTS_PER_PAGE!
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
  return tags.find(t => t.slug === slug || t.slug === slug.replace(/%26/g, '&'));
}
