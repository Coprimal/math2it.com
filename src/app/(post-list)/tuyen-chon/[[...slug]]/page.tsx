import { getSlugPrefix, notionMaxRequest, numPostsPerPage } from '@app/lib/config'
import { getAuthors, getCategories, getPosts, getTags } from '@app/lib/fetcher'
import { generateMetaTitle, getFilterOf, getStartCursorForCurrentPage } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import selectedCover from '@root/public/featured-images/selected.png'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@src/interface'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 60

export async function generateMetadata({ params }: OptionalCatchAllProps): Promise<Metadata> {
  const currentPage = +(params?.slug?.[1] || 1)
  return {
    title: generateMetaTitle(`Bài viết tuyển chọn - trang ${currentPage}`),
    description: 'Đây là những bài viết được tuyển chọn bởi đội ngũ Math2IT.',
    openGraph: {
      images: [
        {
          url: 'https://i.imgur.com/XWqPiqLh.png',
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
    filter: getFilterOf('selected')
  })
  const numPosts = allPosts?.length || 0
  const totalPages = Math.ceil(numPosts / numPostsPerPage)
  for (let i = 1; i <= totalPages; i++) {
    const path =
      i === 1
        ? { slug: [getSlugPrefix('selected')] }
        : { slug: [getSlugPrefix('selected'), getSlugPrefix('page'), i.toString()] }
    params.push(path)
  }
  return params
}

export default async function SelectedPostsPage({ params }: OptionalCatchAllProps) {
  // Different from category page (/chuyen-muc/slug/trang/1)
  // the selected posts page has no slug (/tuyen-chon/trang/1)
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
    dbId: process.env.NOTION_DB_POSTS as string,
    categories,
    tags,
    authors,
    pageSize: notionMaxRequest,
    filter: getFilterOf('selected')
  })
  const totalPages = Math.ceil(allPosts.length / numPostsPerPage)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('selected')}/`)
  }

  if (currentPage !== 1 && currentPage > totalPages) {
    notFound()
  }

  const startCursor = getStartCursorForCurrentPage(currentPage, allPosts, numPostsPerPage)
  const postsOnThisPage = !allPosts.length
    ? []
    : await getPosts({
        dbId: process.env.NOTION_DB_POSTS as string,
        filter: getFilterOf('selected'),
        categories,
        tags,
        authors,
        startCursor,
        pageSize: numPostsPerPage
      })

  return (
    <PageOfPostsListTemplate
      title={'Bài viết tuyển chọn'}
      subtitle="Đây là những bài viết được tuyển chọn bởi đội ngũ Math2IT."
      uri={`/${getSlugPrefix('selected')}/`}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
      cover={selectedCover}
      postTypeOpts={{ hideCategory: false }}
    />
  )
}
