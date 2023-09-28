import allPostsCover from '@/public/featured-images/all.png'
import { getSlugPrefix } from '@app/lib/config'
import { getAuthors, getCategories, getPosts } from '@app/lib/fetcher'
import { generateMetaTitle } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { getStartCursorForCurrentPage } from '@notion-x/helpers'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@notion-x/interface'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 20

export async function generateMetadata({ params }: OptionalCatchAllProps): Promise<Metadata> {
  const currentPage = +(params?.slug?.[1] || 1)
  return {
    title: generateMetaTitle(`Tất cả bài viết - trang ${currentPage}`),
    description: 'Tất cả bài viết trên trang web Math2IT.',
    openGraph: {
      images: [
        {
          url: 'https://i.imgur.com/wXYx5SIh.png',
          width: 1024,
          height: 591
        }
      ]
    }
  }
}

export async function generateStaticParams() {
  const params = [] as OptionalCatchAllParams[]
  const allPosts = await getPosts()
  const numPosts = allPosts?.length || 0
  const totalPages = Math.ceil(numPosts / +process.env.POSTS_PER_PAGE!)
  for (let i = 1; i <= totalPages; i++) {
    const path = i === 1 ? { slug: [] } : { slug: [getSlugPrefix('page'), i.toString()] }
    params.push(path)
  }
  return params
}

export default async function AllPostsPage({ params }: OptionalCatchAllProps) {
  // Different from category page (/chuyen-muc/slug/trang/1)
  // the all posts page has no slug (/tat-ca-bai-viet/trang/1)
  const currentPage = +(params?.slug?.[1] || 1)

  if (
    !params ||
    (params.slug?.length > 0 && params.slug?.[0] !== getSlugPrefix('page')) ||
    params.slug?.length > 2
  ) {
    notFound()
  }

  console.log(`\n👉 uri: /${getSlugPrefix('all')}${getSlugPrefix('page')}/${currentPage}/`)

  const notRootPage = !!params.slug

  const categories = getCategories()
  const authors = await getAuthors()

  const allPosts = await getPosts({
    categories,
    authors
  })
  const totalPages = Math.ceil(allPosts.length / +process.env.POSTS_PER_PAGE!)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('all')}/`)
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
        startCursor,
        pageSize: +process.env.POSTS_PER_PAGE!
      })

  return (
    <PageOfPostsListTemplate
      title={'Tất cả bài viết'}
      uri={`/${getSlugPrefix('all')}/`}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
      cover={allPostsCover}
      postTypeOpts={{ hideCategory: false }}
    />
  )
}
