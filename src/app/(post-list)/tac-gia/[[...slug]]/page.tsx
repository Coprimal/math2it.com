import authorCover from '@/public/featured-images/author.png'
import { getSlugPrefix } from '@app/lib/config'
import { getAuthors, getCategories, getPosts } from '@app/lib/fetcher'
import { generateMetaTitle, getFilterOf } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@/src/types/notion'
import { getStartCursorForCurrentPage } from '@/src/lib/notion/helpers'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 20

export async function generateMetadata(props: OptionalCatchAllProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug?.[0] || ''
  const currentPage = +(params?.slug?.[2] || 1)
  const authors = await getAuthors()
  const author = authors.find(a => a.slug === slug)
  if (!author)
    return {
      title: generateMetaTitle('Tác giả không xác định')
    }
  return {
    title: generateMetaTitle(`Tác giả "${author?.name}" - trang ${currentPage}`),
    description: author.description,
    openGraph: {
      images: [
        {
          url: 'https://i.imgur.com/z3t05uQh.png',
          width: 1024,
          height: 591
        }
      ]
    }
  }
}

export async function generateStaticParams() {
  const authors = await getAuthors()
  const params = [] as OptionalCatchAllParams[]
  for (const author of authors) {
    const allPosts = await getPosts({
      filter: getFilterOf('author', author)
    })
    const numPosts = allPosts?.length || 0
    const totalPages = Math.ceil(numPosts / +process.env.POSTS_PER_PAGE!)
    for (let i = 1; i <= totalPages; i++) {
      const path =
        i === 1
          ? { slug: [author.slug!] }
          : { slug: [author.slug!, getSlugPrefix('page'), i.toString()] }
      params.push(path)
    }
  }
  return params
}

export default async function AuthorPage(props: OptionalCatchAllProps) {
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

  const notRootPage = params.slug.length > 1
  const slug = params.slug[0] || ''

  console.log(`\n👉 uri: /tac-gia/${slug}/${getSlugPrefix('page')}/${currentPage}/`)

  const categories = getCategories()
  const authors = await getAuthors()
  const author = authors.find(c => c.slug === slug)
  if (!author) notFound()

  // All posts in that category, we need these to find the number of pages
  const allPosts = await getPosts({
    categories,
    authors,
    filter: getFilterOf('author', author)
  })
  const totalPages = Math.ceil(allPosts.length / +process.env.POSTS_PER_PAGE!)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('author')}/${slug}/`)
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
    : await getPosts({
        categories,
        authors,
        filter: getFilterOf('author', author),
        startCursor,
        pageSize: +process.env.POSTS_PER_PAGE!
      })

  return (
    <PageOfPostsListTemplate
      title={`Các bài viết của "${author.name}"`}
      subtitle={author.description}
      uri={author.uri}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
      cover={authorCover}
      postTypeOpts={{ hideCategory: false }}
    />
  )
}
