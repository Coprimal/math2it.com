import { getSlugPrefix, notionMaxRequest, numPostsPerPage } from '@app/lib/config'
import { getAuthors, getCategories, getPostsBy, getTags } from '@app/lib/fetcher'
import { getFilterOf, getStartCursorForCurrentPage } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@src/interface'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 10 // ###R: change when done developing

export async function generateMetadata({ params }: OptionalCatchAllProps): Promise<Metadata> {
  const slug = params.slug[0] || ''
  const currentPage = +(params?.slug?.[2] || 1)
  const authors = await getAuthors()
  const author = authors.find(a => a.slug === slug)
  if (!author)
    return {
      title: 'Tác giả không xác định | Math2IT'
    }
  return {
    title: `Tác giả "${author?.name}" - trang ${currentPage} | Math2IT`
  }
}

export async function generateStaticParams() {
  const authors = await getAuthors()
  const params = [] as OptionalCatchAllParams[]
  for (const author of authors) {
    const allPosts = await getPostsBy({
      filter: getFilterOf('author', author),
      pageSize: notionMaxRequest
    })
    const numPosts = allPosts?.length || 0
    const totalPages = Math.ceil(numPosts / numPostsPerPage)
    for (let i = 1; i <= totalPages; i++) {
      const path =
        i === 1
          ? { slug: [getSlugPrefix('author'), author.slug!] }
          : { slug: [getSlugPrefix('author'), author.slug!, 'trang', i.toString()] }
      params.push(path)
    }
  }
  return params
}

export default async function AuthorPage({ params }: OptionalCatchAllProps) {
  const currentPage = +(params?.slug?.[2] || 1)

  if (
    !params ||
    !params?.slug ||
    (params.slug.length > 1 && params.slug[1] !== 'trang') ||
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
  const author = authors.find(c => c.slug === slug)
  if (!author) notFound()

  // All posts in that category, we need these to find the number of pages
  const allPosts = await getPostsBy({
    categories,
    tags,
    authors,
    filter: getFilterOf('author', author),
    pageSize: notionMaxRequest
  })
  const totalPages = Math.ceil(allPosts.length / numPostsPerPage)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('author')}/${slug}/`)
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
        filter: getFilterOf('author', author),
        startCursor,
        pageSize: numPostsPerPage
      })

  return (
    <PageOfPostsListTemplate
      title={`Tác giả ${author.name}`}
      uri={author.uri}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
