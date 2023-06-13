import { categorySlugPrefix, notionMaxRequest, numPostsPerPage } from '@app/lib/config'
import { getAuthors, getCategories, getPostsBy, getTags } from '@app/lib/fetcher'
import { getFilterOf, getStartCursorForCurrentPage } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@src/interface'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 10 // ###R: change when done developing

export async function generateMetadata({ params }: OptionalCatchAllProps): Promise<Metadata> {
  const categories = getCategories()
  const slug = params.slug[0] || ''
  const category = categories.find(c => c.slug === slug)
  if (!category)
    return {
      title: 'Chủ đề không xác định | Math2IT'
    }
  return {
    title: `Chủ đề "${category?.name}" | Math2IT`
  }
}

export async function generateStaticParams() {
  const categories = getCategories()
  const tagsData = getTags()
  const authorsData = getAuthors()
  const [tags, authors] = await Promise.all([tagsData, authorsData])

  const params = [] as OptionalCatchAllParams[]
  for (const category of categories) {
    const allPosts = await getPostsBy({
      categories,
      tags,
      authors,
      filter: getFilterOf('category', category),
      pageSize: notionMaxRequest
    })
    const numPosts = allPosts?.length || 0
    const totalPages = Math.ceil(numPosts / numPostsPerPage)
    for (let i = 1; i <= totalPages; i++) {
      const path =
        i === 1
          ? { slug: [categorySlugPrefix, category.slug!] }
          : { slug: [categorySlugPrefix, category.slug!, 'page', i.toString()] }
      params.push(path)
    }
  }
  return params
}

export default async function CategoryPage({ params }: OptionalCatchAllProps) {
  const currentPage = +(params?.slug?.[2] || 1)

  if (
    !params ||
    !params?.slug ||
    (params.slug.length > 1 && params.slug[1] !== 'page') ||
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
  const category = categories.find(c => c.slug === slug)
  if (!category) notFound()

  // All posts in that category, we need these to find the number of pages
  const allPosts = await getPostsBy({
    categories,
    tags,
    authors,
    filter: getFilterOf('category', category),
    pageSize: notionMaxRequest
  })
  const totalPages = Math.ceil(allPosts.length / numPostsPerPage)

  if (notRootPage && currentPage === 1) {
    return {
      redirect: {
        destination: `/${categorySlugPrefix}/${slug}/`,
        permanent: true
      }
    }
  }

  if (currentPage !== 1 && currentPage > totalPages) {
    notFound()
  }

  const startCursor = getStartCursorForCurrentPage(currentPage, allPosts, numPostsPerPage)
  const postsOnThisPage = !allPosts.length
    ? []
    : await getPostsBy({
        categories,
        tags,
        authors,
        filter: getFilterOf('category', category),
        startCursor,
        pageSize: numPostsPerPage
      })

  return (
    <PageOfPostsListTemplate
      title={`Category ${category.name}`}
      uri={category.uri}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
