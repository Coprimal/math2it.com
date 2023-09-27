import { getSlugPrefix, notionMaxRequest } from '@app/lib/config'
import { getAuthors, getCategories, getPostsBy } from '@app/lib/fetcher'
import { generateMetaTitle, getFilterOf } from '@app/lib/helpers'
import PageOfPostsListTemplate from '@app/templates/PageOfPostsListTemplate'
import { getStartCursorForCurrentPage } from '@notion-x/helpers'
import { OptionalCatchAllParams, OptionalCatchAllProps } from '@notion-x/interface'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 20

export async function generateMetadata({ params }: OptionalCatchAllProps): Promise<Metadata> {
  const slug = params.slug[0] || ''
  const currentPage = +(params?.slug?.[2] || 1)
  const categories = getCategories()
  const category = categories.find(c => c.slug === slug)
  if (!category)
    return {
      title: generateMetaTitle('Không tìm thấy chuyên mục')
    }
  return {
    title: generateMetaTitle(`Chuyên mục "${category?.name}" - trang ${currentPage}`),
    description: category.description,
    openGraph: {
      images: [
        {
          url: category.featuredImage!.imgur!,
          width: 1024,
          height: 591
        }
      ]
    }
  }
}

export async function generateStaticParams() {
  const categories = getCategories()

  const params = [] as OptionalCatchAllParams[]
  for (const category of categories) {
    const allPosts = await getPostsBy({
      filter: getFilterOf('category', category),
      pageSize: notionMaxRequest,
      getFull: true
    })
    const numPosts = allPosts?.length || 0
    const totalPages = Math.ceil(numPosts / +process.env.POSTS_PER_PAGE!)
    for (let i = 1; i <= totalPages; i++) {
      const path =
        i === 1
          ? { slug: [category.slug!] }
          : {
              slug: [category.slug!, getSlugPrefix('page'), i.toString()]
            }

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
    (params.slug.length > 1 && params.slug[1] !== getSlugPrefix('page')) ||
    params.slug.length > 3
  ) {
    notFound()
  }

  const notRootPage = params.slug.length > 1
  const slug = params.slug[0] || ''

  console.log(`\n👉 uri: /chuyen-muc/${slug}/${getSlugPrefix('page')}/${currentPage}/`)

  const categories = getCategories()
  const authors = await getAuthors()
  const category = categories.find(c => c.slug === slug)
  if (!category) notFound()

  const iconComponent = category.fontello ? <i className={category.fontello}></i> : null

  // All posts in that category, we need these to find the number of pages
  const allPosts = await getPostsBy({
    categories,
    authors,
    filter: getFilterOf('category', category),
    pageSize: notionMaxRequest,
    getFull: true
  })
  const totalPages = Math.ceil(allPosts.length / +process.env.POSTS_PER_PAGE!)

  if (notRootPage && currentPage === 1) {
    redirect(`/${getSlugPrefix('category')}/${slug}/`)
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
        filter: getFilterOf('category', category),
        startCursor,
        pageSize: +process.env.POSTS_PER_PAGE!,
        getFull: true
      })

  return (
    <PageOfPostsListTemplate
      title={`Chuyên mục "${category.name}"`}
      subtitle={category.description}
      uri={category.uri}
      posts={postsOnThisPage}
      totalPages={totalPages}
      currentPage={currentPage}
      iconComponent={iconComponent}
      cover={category.featuredImage?.staticImageData}
    />
  )
}
