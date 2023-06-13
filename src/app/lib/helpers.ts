import {
  UNOFFICIAL_NOTION_KEYS,
  defaultBlurDataURL,
  defaultCategoryBgColor,
  defaultCategoryTextColor,
  defaultCustomSizeFM,
  defaultFeaturedImageUrl,
  defaultPostDate,
  defaultPostTitle,
  predefinedCategories,
  usePlaiceholder
} from '@app/lib/config'
import {
  Author,
  Category,
  FeaturedImage,
  GroupTypeLabels,
  NotionAuthor,
  NotionPost,
  NotionTag,
  Post,
  SearchResult,
  Tag
} from '@src/interface'
import { get, intersectionWith } from 'lodash'
import { getPlaiceholder } from 'plaiceholder'

/**
 * Convert "Nguyễn Văn Đông" to "nguyen-van-dong"
 */
export function makeSlugText(text?: string | null): string | null {
  if (!text) return null
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(':', '')
    .split(' ')
    .join('-')
    .replace(/^\/|\/$/g, '') // remove "/" at the beginning and the end
}

/**
 * We use "null" to avoid the "undefined" error when parsing to a JSON format!
 */
export function transformNotionAuthorsData(data: NotionAuthor[]): Author[] {
  if (!data || !Array.isArray(data) || !data.length) return []
  return (
    data?.map(author => {
      const properties = author?.properties || null
      const name = properties?.name?.title[0]?.plain_text || null
      const slug = properties?.slug?.rich_text[0]?.plain_text || makeSlugText(name) || null
      const uri = slug ? `/author/${slug}/` : `/author/${makeSlugText(name)}/`
      const avatarUrl = properties?.avatar?.files[0]?.file.url || null
      const description = properties?.description?.rich_text[0]?.plain_text || null
      const icon = author?.icon?.emoji || null
      const role = properties?.role?.select.name || null
      const email = properties?.email?.email || null
      const website = properties?.website?.url || null
      const id = author.id
      return {
        id,
        name,
        uri,
        slug,
        description,
        avatarUrl,
        icon,
        role,
        email,
        website
      }
    }) || []
  )
}

export function transformNotionTagsData(data?: NotionTag[]): Tag[] {
  return (
    data?.map(tag => {
      const properties = tag?.properties || null
      const name = properties?.name?.title[0]?.plain_text
      const description = properties?.description?.rich_text[0]?.plain_text || null
      const slug = properties?.slug?.rich_text[0]?.plain_text || makeSlugText(name) || null
      const uri = `/tag/${slug}/`
      const fontello = properties?.fontello?.rich_text[0]?.plain_text || null
      const id = tag?.id || uri
      const icon = properties?.icon?.files[0]?.file.url || null
      return { id, name, uri, description, fontello, icon, slug }
    }) || []
  )
}

/**
 * Transform data fetched from Notion to format Post[]
 */
export async function transformNotionPostsData(options: {
  data: NotionPost[]
  categories: Category[]
  tags: Tag[]
  authors: Author[]
}): Promise<Post[]> {
  const { data, categories: categoriesList, tags: tagsList, authors: authorsList } = options
  return Promise.all(
    data?.map(async post => {
      // id
      const id = get(post, 'id') as string

      // title
      const title = get(post, 'properties.name.title[0].plain_text', defaultPostTitle)

      // date
      // Because we migrate from WP to Notion, a lot of posts need to use the old created date
      const gotDate = get(
        post,
        'properties.finalCreatedDate.formula.date.start',
        get(post, 'last_edited_time', defaultPostDate)
      )
      const date = new Date(gotDate).toISOString()

      // Tags
      const tagIdsList = get(post, 'properties.tags.relation', []).map(
        (tag: { id: string }) => tag.id
      )
      const tags = parseTagsForPost(tagIdsList, tagsList)

      // Categories
      const defaultCategory = categoriesList[0]
      const gotCategories = post.properties?.categories?.multi_select
      const categories = gotCategories
        ? gotCategories.map(category => {
            const foundCategory = categoriesList.find(
              cat => makeSlugText(cat?.name) === makeSlugText(category.name)
            )
            return foundCategory
              ? foundCategory
              : {
                  name: category.name,
                  uri: `/${getSlugPrefix('category')}/${makeSlugText(category.name)}/`
                }
          })
        : defaultCategory

      // Author
      const authorIdsList = get(post, 'properties.authors.relation', []).map(
        (author: { id: string }) => author.id
      )
      const authors = parseAuthorsForPost(authorIdsList, authorsList)

      // Featured image
      const coverUrl = get(post, 'cover.external.url') || get(post, 'cover.file.url')
      const featuredImage = parseFeaturedImage(
        { sourceUrl: coverUrl },
        `Hình trong bài ${title}`,
        id
      )

      if (featuredImage && usePlaiceholder) {
        if (coverUrl) {
          const { base64 } = await getPlaiceholder(Buffer.from(coverUrl), { size: 20 })
          featuredImage.blurDataURL = base64
        } else {
          featuredImage.blurDataURL = defaultBlurDataURL
        }
      }

      // bookCover (if available)
      const bookCoverUrl = get(post, 'properties.bookCover.files[0].file.url')
      let bookCover: FeaturedImage = null
      if (bookCoverUrl && usePlaiceholder) {
        bookCover = { sourceUrl: bookCoverUrl }
        const { base64 } = await getPlaiceholder(Buffer.from(bookCoverUrl), { size: 20 })
        bookCover.blurDataURL = base64
      }

      // slug
      const slug =
        get(post, 'properties.slug.rich_text[0].plain_text', '') ||
        makeSlugText(get(post, 'properties.name.title[0].plain_text', ''))

      // excerpt
      const excerpt = get(post, 'properties.excerpt.rich_text', [])

      return {
        id,
        title,
        slug,
        uri: `/${slug}/`,
        date,
        tags,
        excerpt,
        categories,
        authors,
        featuredImage,
        bookCover
      } as Post
    }) || []
  )
}

export function parseAuthorsForPost(authorIdsList: string[], authorsList: Author[]): Author[] {
  return intersectionWith(authorsList, authorIdsList, (author, id) => author.id === id)
}

export function parseTagsForPost(tagIdsList: string[], tagsList: Tag[]): Tag[] {
  return intersectionWith(tagsList, tagIdsList, (tag, id) => tag.id === id)
}

/**
 * Sometimes, error "Module not found" when we call this method somewhere else.
 * Solution: Just put it inside "getStaticProps" function!
 */
export function getPredefinedCategories(categories: Category[] = []): Category[] {
  if (categories?.length === 0) return []

  return categories
    .filter(cat => cat)
    .map(category => {
      const foundCategory = predefinedCategories.find(
        preCat => makeSlugText(preCat?.name) === makeSlugText(category?.name)
      )
      return foundCategory
        ? foundCategory
        : {
            slug: makeSlugText(category?.name),
            name: category!.name,
            uri: `/category/${makeSlugText(category!.name)}/`,
            style: {
              bgColor: defaultCategoryBgColor,
              textColor: defaultCategoryTextColor
            },
            featureImage: {
              sourceUrl: defaultFeaturedImageUrl,
              sizes: defaultCustomSizeFM
            }
          }
    })
}

/**
 * Get a right format for featured image from Notion
 * Note that, depending on how we set the cover for post, we have different url formats.
 * For example:
 * - Use photos from Notion -> '/images/...'
 * - Use photos from Unsplash -> 'https://images.unsplash.com/...'
 * - Use uploaded photos -> 🚸 IGNORED AND REPLACED BY DEFAULT IMAGE 'https://xxx.amazonaws.com/...'
 */
export function parseFeaturedImage(
  featuredImageNode: FeaturedImage,
  altText: string,
  pageIdWithDash: string
): FeaturedImage {
  if (!featuredImageNode || !featuredImageNode.sourceUrl) return null
  const inputSourceUrl = featuredImageNode.sourceUrl

  // 👇 Uploaded photos from our computer -> IGNORED
  // if (!inputSourceUrl.startsWith('/images')) {
  //   const u = new URL(inputSourceUrl)
  //   if (u.pathname.startsWith('/secure.notion-static.com') && u.hostname.endsWith('.amazonaws.com'))
  //     return null
  // }

  const sourceUrl = mapFeatureImageURl(inputSourceUrl, pageIdWithDash)
  return {
    sourceUrl,
    altText: altText || 'Không tìm thấy hình ảnh!'
  }
}

/**
 * Modified from third_party/react-notion-x/map-image-url.ts/defaultMapImageUrl()
 * 🚸 IMPORTANT: It's not working if we upload photos to Notion from our computer!
 */
function mapFeatureImageURl(url: string, pageIdWithDash: string): string | null {
  if (!url) {
    return null
  }

  if (url.startsWith('data:')) {
    return url
  }

  // more recent versions of notion don't proxy unsplash images
  if (url.startsWith('https://images.unsplash.com')) {
    return url
  }

  if (url.startsWith('/images')) {
    url = `https://www.notion.so${url}`
    return url
  }

  try {
    const u = new URL(url)
    if (
      u.pathname.startsWith('/secure.notion-static.com') &&
      u.hostname.endsWith('.amazonaws.com')
    ) {
      if (
        u.searchParams.has('X-Amz-Credential') &&
        u.searchParams.has('X-Amz-Signature') &&
        u.searchParams.has('X-Amz-Algorithm')
      ) {
        // if the URL is already signed, then use it as-is
        return url
      } else {
        url =
          'https://www.notion.so' +
          `/image/${encodeURIComponent(url)}?table=block&id=${pageIdWithDash}`
      }
    }
  } catch {
    // ignore invalid urls
  }
  return url
}

/**
 * Get a right start_cursor for pagination based on current page and posts
 * @param posts
 * @param postsPerPage
 * @param currentPage
 * @returns next_cursor or `undefined` (it has to be `undefined`, not `null` because
 * Notion API doesn't accept `null` value for `start_cursor`)
 */
export function getStartCursorForCurrentPage(
  currentPage: number,
  posts: Post[],
  postsPerPage: number
): string | undefined {
  if (posts?.length === 0) return undefined
  if (currentPage === 1) return undefined
  const numPages = Math.ceil(posts.length / postsPerPage)
  if (currentPage > numPages) return undefined
  return posts[(currentPage - 1) * postsPerPage]?.id
}

export function getFilterOf(type: GroupTypeLabels, data?: Category | Tag | Author): unknown {
  switch (type) {
    case 'author':
      return {
        property: 'authors',
        relation: {
          contains: data?.id
        }
      }
    case 'category':
      return {
        property: 'categories',
        multi_select: {
          contains: data?.name
        }
      }
    case 'tag':
      return {
        property: 'tags',
        relation: {
          contains: data?.id
        }
      }
    case 'selected':
      return {
        and: [
          {
            property: 'selected',
            checkbox: {
              equals: true
            }
          }
        ]
      }
    default:
      return null
  }
}

// /**
//  * Get paths of getStaticProps() for different kinds of pages, eg. posts, tags,
//  * categories, authors, etc (pages with the paths like /author/page/2).
//  * @param type
//  * @param filterKey Use in the filter, eg. "id" for author.id, "slug" for tag.slug
//  * @param slugPrefix
//  * @param params
//  * @returns paths
//  */
// export async function getStaticPropsOfGroupPage<
//   Ts,
//   T extends { slug?: string | null; id?: string | null }
// >(options: {
//   type: GroupTypeLabels
//   filterKey: 'name' | 'id'
//   slugPrefix: string
//   params: GetStaticPropsContext['params']
// }): Promise<any> {
//   const { type, filterKey, slugPrefix, params } = options

//   try {
//     const currentPage = +(params?.slug?.[2] || 1)

//     if (
//       !params?.slug ||
//       (params.slug.length > 1 && params.slug[1] !== 'page') ||
//       params.slug.length > 3
//     ) {
//       return { notFound: true }
//     }

//     const notRootPage = params?.slug.length > 1
//     const slug = params?.slug[0] || ''

//     const { kinds, kind } = await getKind<Ts, T>(type, slug)

//     if (!kind) return { notFound: true }

//     const { posts: allPosts } = await getPostsBy({
//       type,
//       filter: getFilterOf(type, kind[filterKey]),
//       slug,
//       pageSize: notionMaxRequest,
//       kinds
//     })
//     const totalPages = Math.ceil(allPosts.length / numPostsPerPage)

//     if (notRootPage && currentPage === 1) {
//       return {
//         redirect: {
//           destination: `/${slugPrefix}/${slug}/`,
//           permanent: true
//         }
//       }
//     }

//     if (currentPage !== 1 && currentPage > totalPages) {
//       return { notFound: true }
//     }

//     let newPosts = [] as Post[]
//     if (allPosts.length) {
//       const startCursor = getStartCursorForCurrentPage(currentPage, allPosts, numPostsPerPage)
//       const { posts } = await getPostsBy<Ts, T>({
//         type,
//         filter: getFilterOf(type, kind[filterKey]),
//         slug,
//         startCursor,
//         pageSize: numPostsPerPage
//       })
//       newPosts = posts
//     }

//     return {
//       props: {
//         posts: newPosts,
//         kind,
//         totalPages,
//         currentPage
//       },
//       revalidate: revalidateTime
//     }
//   } catch (e) {
//     console.log(`🚨 Error when loading page ${type}: `, e)
//     return { notFound: true }
//   }
// }

// /**
//  * Get paths of getStaticPaths() for different kinds of pages, eg. posts, tags,
//  * categories, authors, etc (pages with the paths like /author/page/2).
//  * @param type
//  * @param filterKey Use in the filter, eg. "id" for author.id, "slug" for tag.slug
//  * @param slugPrefix
//  * @returns paths
//  */
// export async function getStaticPathsOfGroupPage<
//   Ts,
//   T extends { slug?: string | null; id?: string | null }
// >(options: { type: GroupTypeLabels; filterKey: string; slugPrefix: string }): Promise<string[]> {
//   const { type, filterKey, slugPrefix } = options
//   const kinds = (await getKinds<Ts>(type)) as any
//   const paths: string[] = []
//   for (const kind of Object.values(kinds)[0] as T[]) {
//     const slug = kind.slug
//     const { posts } = await getPostsBy({
//       type,
//       filter: getFilterOf(type, kind[filterKey]),
//       slug,
//       pageSize: notionMaxRequest,
//       kinds
//     })
//     const numPosts = posts?.length || 0
//     const totalPages = Math.ceil(numPosts / numPostsPerPage)
//     for (let i = 1; i <= Math.min(totalPages, numPagePrerendered); i++) {
//       const path = i === 1 ? `/${slugPrefix}/${slug}/` : `/${slugPrefix}/${slug}/page/${i}/`
//       paths.push(path)
//     }
//   }
//   return paths
// }

// /**
//  * Get the paths of getStaticProps() for page "all", "selected",... (pages
//  * with the path like "/all/page/2/")
//  */
// export async function getStaticPropsOfAllPages(options: {
//   type: 'all' | 'selected'
//   slug: string
//   params: GetStaticPropsContext['params']
//   filter?: unknown
// }): Promise<any> {
//   const { type, filter, slug, params } = options
//   try {
//     const currentPage = params?.slug ? +params?.slug[1] : 1
//     if (
//       !params ||
//       !params.slug ||
//       (params.slug && params.slug?.length > 0 && params.slug[0] !== 'page') ||
//       params.slug?.length > 2
//     ) {
//       return { notFound: true }
//     }

//     const notRootPage = !!params?.slug

//     const { posts: allPosts } = await getPosts({
//       filter,
//       pageSize: notionMaxRequest
//     })
//     const totalPages = Math.ceil(allPosts.length / numPostsPerPage)

//     if (notRootPage && currentPage === 1) {
//       return {
//         redirect: {
//           destination: `/${slug}/`,
//           permanent: false
//         }
//       }
//     }

//     if (currentPage !== 1 && currentPage > totalPages) {
//       return { notFound: true }
//     }

//     let newPosts = [] as Post[]

//     if (allPosts.length) {
//       const startCursor = getStartCursorForCurrentPage(currentPage, allPosts, numPostsPerPage)
//       const { posts } = await getPosts({
//         filter,
//         startCursor,
//         pageSize: numPostsPerPage
//       })
//       newPosts = posts
//     }

//     return {
//       props: {
//         posts: newPosts,
//         totalPages,
//         currentPage
//       },
//       revalidate: revalidateTime
//     }
//   } catch (e) {
//     console.log(`🚨 Error when loading page ${type}: `, e)
//     return { notFound: true }
//   }
// }

// /**
//  * Get the paths of getStaticPaths() for page "all", "selected",... (pages
//  * with the path like "/all/page/2/")
//  */
// export async function getStaticPathsOfAllPages(options: {
//   filter?: unknown
//   slug: string
// }): Promise<string[]> {
//   const { filter, slug } = options
//   const paths: string[] = []
//   const { posts } = await getPosts({
//     filter,
//     pageSize: notionMaxRequest
//   })
//   const numPosts = posts?.length || 0
//   const totalPages = Math.ceil(numPosts / numPostsPerPage)
//   for (let i = 1; i <= Math.min(totalPages, numPagePrerendered); i++) {
//     const path = i === 1 ? `/${slug}/` : `/${slug}/page/${i}/`
//     paths.push(path)
//   }
//   return paths
// }

// export async function transformPostHeader(
//   notionHeader: NotionHeader,
//   pageIdwithDash: string
// ): Promise<PostHeaderType> {
//   const properties = notionHeader?.properties

//   // title
//   const title = properties?.name?.title?.[0]?.plain_text || defaultPostTitle

//   // date
//   // Because we migrate from WP to Notion, a lot of posts need to use the old created date
//   const finalCreatedDate =
//     properties?.finalCreatedDate?.formula?.date?.start || new Date().toISOString()
//   const date = new Date(finalCreatedDate).toISOString()

//   // categories
//   const categories = getPredefinedCategories(properties?.categories?.multi_select)

//   // tags
//   const tagIdsList = properties?.tags?.relation?.map(item => item.id) || []
//   const tagsList = await getTags()
//   const tags = parseTagsForPost(tagIdsList, tagsList)

//   // authors
//   const authorIdsList = properties?.authors?.relation?.map(item => item.id) || []
//   const authorsList = await getAuthors()
//   const authors = parseAuthorsForPost(authorIdsList, authorsList)

//   // featured image
//   const sourceUrl = notionHeader?.cover?.external?.url || notionHeader?.cover?.file?.url
//   const featuredImage = sourceUrl
//     ? parseFeaturedImage({ sourceUrl }, `Ảnh đại diện cho bài viết "${title}"`, pageIdwithDash)
//     : null
//   // create place holder for featured image
//   if (featuredImage) {
//     if (sourceUrl) {
//       const { base64 } = await getPlaiceholder(sourceUrl, { size: 20 })
//       featuredImage.blurDataURL = base64
//     } else {
//       featuredImage.blurDataURL = defaultBlurDataURL
//     }
//   }

//   // selected
//   const selected = properties?.selected?.checkbox || false

//   // bookCover
//   const bookCoverUrl =
//     properties?.bookCover?.files?.[0]?.external?.url || properties?.bookCover?.files?.[0]?.file?.url
//   const bookCover = bookCoverUrl
//     ? parseFeaturedImage({ sourceUrl: bookCoverUrl }, `Ảnh bìa sách "${title}"`, pageIdwithDash)
//     : null
//   // create place holder for book cover
//   if (bookCover) {
//     if (bookCoverUrl) {
//       const { base64 } = await getPlaiceholder(bookCoverUrl, { size: 20 })
//       bookCover.blurDataURL = base64
//     } else {
//       bookCover.blurDataURL = defaultBlurDataURL
//     }
//   }

//   // showToc
//   const showToc = properties?.showToc?.checkbox || false

//   return { title, date, categories, tags, authors, featuredImage, selected, bookCover, showToc }
// }

/**
 * Convert "7c2e54318e52416ca5769831454bf08d" or "7c2e5431-8e52-416c-a576-9831454bf08d"
 * to "7c2e5431-8e52-416c-a576-9831454bf08d"
 */
export function idToUuid(id: string): string | null {
  if (!id) {
    return null
  }

  id = id.split('?')[0]
  const match = id.match(/\b([a-f0-9]{32})\b/)

  if (match) {
    return `${id.slice(0, 8)}-${id.slice(8, 4 + 8)}-${id.slice(12, 4 + 12)}-${id.slice(
      16,
      4 + 16
    )}-${id.slice(20)}`
  }

  const match2 = id.match(/\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/)
  if (match2) {
    return match2[1]
  }

  return null
}

/**
 * We convert the format of search results got from /api/search-notion to the format we want
 * Note that: /api/search-notin uses an unofficial notion api, so the format is a little bit different
 *
 * Remark: we put this function here to overcome the error "Module not found: Can't resolve 'child_process'"
 */
export function parseSearchResults(data: any): SearchResult[] {
  // console.log('👉👉👉👉 data (parseSearchResults): ', JSON.stringify(data)) // ###M
  let results = [] as SearchResult[]
  if (!data || !data.results || data.results.length === 0) results = []
  else {
    for (const result of data.results) {
      const postId = result.id
      const _properties = data.recordMap?.block?.[postId]?.value?.properties
      const isPostPublished = _properties?.[UNOFFICIAL_NOTION_KEYS.published]?.[0]?.[0] === 'Yes'
      const _title = _properties?.[UNOFFICIAL_NOTION_KEYS.title]?.[0]?.[0]
      const postTitle = _title || defaultPostTitle
      const _slug = _properties?.[UNOFFICIAL_NOTION_KEYS.slug]?.[0]?.[0] || null
      const postSlug = _slug || makeSlugText(_title || '')
      const postCategoryNames =
        _properties?.[UNOFFICIAL_NOTION_KEYS.categories]?.[0]?.[0]?.split(',') || []
      const isPostSelected = _properties?.[UNOFFICIAL_NOTION_KEYS.selected]?.[0]?.[0] === 'Yes'
      const postTitleHighlighted =
        result?.highlight?.title
          ?.replaceAll(
            UNOFFICIAL_NOTION_KEYS.boldSearchKey,
            '<span className="text-slate-900 font-semibold">'
          )
          ?.replaceAll(UNOFFICIAL_NOTION_KEYS.boldSearchKeyClose, '</span>') || postTitle
      const postTextHighlighted =
        result.highlight?.text
          ?.replaceAll(
            UNOFFICIAL_NOTION_KEYS.boldSearchKey,
            '<span className="text-slate-900 font-semibold">'
          )
          ?.replaceAll(UNOFFICIAL_NOTION_KEYS.boldSearchKeyClose, '</span>') || null

      results.push({
        id: postId,
        title: postTitle,
        slug: postSlug,
        categoryNames: postCategoryNames,
        isPublished: isPostPublished,
        isSelected: isPostSelected,
        titleHighlighted: postTitleHighlighted,
        textHighlighted: postTextHighlighted
      })
    }
  }
  return results
}

export function getSlugPrefix(type: GroupTypeLabels): string {
  if (type === 'category') return 'category'
  if (type === 'tag') return 'tag'
  if (type === 'author') return 'author'
  if (type === 'all') return 'all'
  if (type === 'selected') return 'choice'
  return ''
}
