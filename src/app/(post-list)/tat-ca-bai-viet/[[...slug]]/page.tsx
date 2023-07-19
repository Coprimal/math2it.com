import { NOTION_DB_POSTS, getSlugPrefix, notionMaxRequest, numPostsPerPage } from '@app/lib/config'
import { getAuthors, getCategories, getPosts, getTags } from '@app/lib/fetcher'
import { generateMetaTitle, getStartCursorForCurrentPage } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import allPostsCover from '@root/public/featured-images/all.png'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@src/interface'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

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
    dbId: NOTION_DB_POSTS,
    pageSize: notionMaxRequest
  })
  const numPosts = allPosts?.length || 0
  const totalPages = Math.ceil(numPosts / numPostsPerPage)
  for (let i = 1; i <= totalPages; i++) {
    const path =
      i === 1
        ? { slug: [getSlugPrefix('all')] }
        : { slug: [getSlugPrefix('all'), getSlugPrefix('page'), i.toString()] }
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
        dbId: NOTION_DB_POSTS,
        categories,
        tags,
        authors,
        startCursor,
        pageSize: numPostsPerPage
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
