import { getSlugPrefix, notionMaxRequest, numPostsPerPage } from '@app/lib/config'
import { getAuthors, getCategories, getPosts } from '@app/lib/fetcher'
import { generateMetaTitle } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import allPostsCover from '@root/public/featured-images/all.png'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getStartCursorForCurrentPage } from 'notion-nextjs-lib/dist/helpers/helpers'
import { OptionalCatchAllParams, OptionalCatchAllProps } from 'notion-nextjs-lib/dist/interface'

export const revalidate = 60

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
  const allPosts = await getPosts({
    dbId: process.env.NOTION_DB_POSTS as string,
    pageSize: notionMaxRequest,
    getFull: true
  })
  const numPosts = allPosts?.length || 0
  const totalPages = Math.ceil(numPosts / numPostsPerPage)
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

  const notRootPage = !!params.slug

  const categories = getCategories()
  const authors = await getAuthors()

  const allPosts = await getPosts({
    dbId: process.env.NOTION_DB_POSTS as string,
    categories,
    authors,
    pageSize: notionMaxRequest,
    getFull: true
  })
  const totalPages = Math.ceil(allPosts.length / numPostsPerPage)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('all')}/`)
  }

  if (currentPage !== 1 && currentPage > totalPages) {
    notFound()
  }

  const startCursor = getStartCursorForCurrentPage(currentPage, allPosts, numPostsPerPage)
  const postsOnThisPage = !allPosts.length
    ? []
    : await getPosts({
        dbId: process.env.NOTION_DB_POSTS as string,
        categories,
        authors,
        startCursor,
        pageSize: numPostsPerPage,
        getFull: true
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
