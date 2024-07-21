import { getSlugPrefix } from '@app/lib/config'
import { getAuthors, getCategories, getPosts } from '@app/lib/fetcher'
import { generateMetaTitle, getFilterOf } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@notion-x/src/interface'
import { getStartCursorForCurrentPage } from '@notion-x/src/lib/helpers'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 20

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
    filter: getFilterOf('selected')
  })
  const numPosts = allPosts?.length || 0
  const totalPages = Math.ceil(numPosts / +process.env.POSTS_PER_PAGE!)
  for (let i = 1; i <= totalPages; i++) {
    const path = i === 1 ? { slug: [] } : { slug: [getSlugPrefix('page'), i.toString()] }
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

  console.log(`\n👉 uri: /${getSlugPrefix('selected')}/${getSlugPrefix('page')}/${currentPage}/`)

  const notRootPage = !!params.slug

  const categories = getCategories()
  const authors = await getAuthors()

  const allPosts = await getPosts({
    categories,
    authors,
    filter: getFilterOf('selected')
  })
  const totalPages = Math.ceil(allPosts.length / +process.env.POSTS_PER_PAGE!)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('selected')}/`)
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
        filter: getFilterOf('selected'),
        categories,
        authors,
        startCursor,
        pageSize: +process.env.POSTS_PER_PAGE!
      })

  return (
    <PageOfPostsListTemplate
      title={'Bài viết tuyển chọn'}
      subtitle="Đây là những bài viết được tuyển chọn bởi đội ngũ Math2IT."
      uri={`/${getSlugPrefix('selected')}/`}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
      // cover={selectedCover}
      postTypeOpts={{ hideCategory: false }}
    />
  )
}
