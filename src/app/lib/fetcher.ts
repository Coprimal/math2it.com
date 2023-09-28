import defaultBookCover from '@/public/featured-images/untitledBook.jpg'
import { queryDatabase, retrieveDatabase } from '@notion-x/db'
import { defaultBlurData, getJoinedRichText, makeSlugText } from '@notion-x/helpers'
import { Author, Category, ImageType, NotionSorts, Post, Tag } from '@notion-x/interface'
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import { ImgurUrlType, NotionPost, NotionTagData } from '@src/interface'
import { get } from 'lodash'
import { StaticImageData } from 'next/image'
import { cache } from 'react'

import {
  defaultFeaturedImage,
  defaultPostDate,
  defaultPostTitle,
  getSlugPrefix,
  predefinedCategories
} from './config'
import {
  getFilter,
  parseAuthorsForPost,
  parseImgurUrl,
  parseNotionImageUrl,
  transformNotionAuthorsData
} from './helpers'

export const getPosts = async (opts?: {
  filter?: QueryDatabaseParameters['filter']
  startCursor?: string
  pageSize?: number
  sorts?: NotionSorts[]
  categories?: Category[]
  authors?: Author[]
}) => {
  // console.log('getPosts()')
  if (!process.env.NOTION_DB_POSTS)
    throw new Error('getTagsWithCache(): NOTION_DB_POSTS is not defined')
  const { filter, startCursor, pageSize, sorts, categories, authors } = opts || {}
  const defaultSort = {
    property: 'finalCreatedDate',
    direction: 'descending'
  } as NotionSorts
  const sortsToUse: any = sorts?.length ? sorts.push(defaultSort) : [defaultSort]
  const filterToUse = getFilter(filter)
  const data = await queryDatabase({
    dbId: process.env.NOTION_DB_POSTS as string,
    filter: filterToUse,
    startCursor,
    pageSize,
    sorts: sortsToUse
  })
  return await transformNotionPostsData({
    data: data?.results as any[],
    categories,
    authors
  })
}

export const getCategories = () => predefinedCategories

export const getTags = cache(async () => {
  if (!process.env.NOTION_DB_POSTS)
    throw new Error('getTagsWithCache(): NOTION_DB_POSTS is not defined')
  const data = await retrieveDatabase(process.env.NOTION_DB_POSTS as string)
  return get(data, 'properties.tag.multi_select.options', [])?.map((opt: NotionTagData) =>
    mapTag(opt)
  )
})

export const getAuthors = async () => {
  console.log('getAuthors()')
  if (!process.env.NOTION_DB_AUTHORS)
    throw new Error('getAuthorsWithCache(): NOTION_DB_AUTHORS is not defined')
  const data = await queryDatabase({ dbId: process.env.NOTION_DB_AUTHORS as string })
  return transformNotionAuthorsData(data?.['results'] as any[])
}

/**
 * Make sure that the return of this method is always an image (from Notion or from the default image)
 */
async function parseImage(options: {
  sourceUrl?: string
  altText?: string
  category?: Category
  pageIdwithDash?: string
  staticImageData?: StaticImageData // can be featured image or book cover
  canBeNull?: boolean // for book cover, we can set it to undefined
  typeImgur?: ImgurUrlType
}): Promise<ImageType> {
  const { sourceUrl, altText, category, pageIdwithDash, staticImageData, canBeNull } = options
  if (!sourceUrl && !staticImageData) return null
  const image: ImageType = { altText }

  if (!sourceUrl) {
    if (canBeNull) return null
    // If there is no featured image, we will use the default featured image of the category
    if (category && category.featuredImage?.staticImageData) {
      image.staticImageData = category.featuredImage?.staticImageData
    } else {
      // If the post has no category
      image.staticImageData = staticImageData
    }
  } else {
    const urlToUse = parseImgurUrl({ url: sourceUrl, type: options.typeImgur })
    image.sourceUrl = urlToUse
    const imgUrl = parseNotionImageUrl(urlToUse, pageIdwithDash)
    if (imgUrl) {
      image.blurDataURL = defaultBlurData.url
      image.width = defaultBlurData.width
      image.height = defaultBlurData.height
    }
  }
  return image
}

async function transformNotionPostsData(options: {
  data: NotionPost[]
  categories?: Category[]
  authors?: Author[]
}): Promise<Post[]> {
  const { data, categories: categoriesList, authors: authorsList } = options
  if (!data || !data.length) return []
  return Promise.all(
    data?.map(async post => {
      // id
      const id = get(post, 'id') as string

      // title
      const title = getJoinedRichText(get(post, 'properties.name.title') as any) || defaultPostTitle

      // date
      // Because we migrate from WP to Notion, a lot of posts need to use the old created date
      const gotDate = get(
        post,
        'properties.finalCreatedDate.formula.date.start',
        get(post, 'last_edited_time', defaultPostDate)
      )
      const date = new Date(gotDate).toISOString()

      // Tags
      const tags =
        post.properties?.tag?.multi_select?.map((tag: NotionTagData) => mapTag(tag)) || []

      // Categories
      let categories: Category[]
      if (categoriesList) {
        const defaultCategory = categoriesList[0]
        const gotCategories = post.properties?.categories?.multi_select
        categories = gotCategories
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
          : [defaultCategory]
      } else {
        categories = []
      }

      // Author
      let authors
      if (authorsList) {
        const authorIdsList = get(post, 'properties.authors.relation', []).map(
          (author: { id: string }) => author.id
        )
        authors = parseAuthorsForPost(authorIdsList, authorsList)
      }

      // Featured image
      const sourceUrl = get(post, 'cover.external.url') || get(post, 'cover.file.url')
      const featuredImage = await parseImage({
        sourceUrl,
        altText: `Ảnh đại diện cho bài viết ${title}`,
        category: categories?.[0],
        pageIdwithDash: id,
        staticImageData: defaultFeaturedImage,
        typeImgur: 'l'
      })

      // bookCover (if available)
      const bookCoverUrl =
        get(post, 'properties.bookCover.files[0].file.url') ||
        get(post, 'properties.bookCover.files[0].external.url')
      const bookCover = await parseImage({
        sourceUrl: bookCoverUrl,
        altText: `Ảnh bìa sách ${title}`,
        pageIdwithDash: id,
        staticImageData: defaultBookCover,
        canBeNull: true,
        typeImgur: 'm'
      })

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
        uri: `/${getSlugPrefix('singlePost')}/${slug}/`,
        date,
        tags,
        excerpt,
        categories,
        authors,
        featuredImage,
        bookCover
      } as Post
    })
  )
}

function mapTag(tag: NotionTagData): Tag {
  return {
    id: makeSlugText(tag.name),
    name: tag.name,
    slug: makeSlugText(tag.name),
    uri: `/${getSlugPrefix('tag')}/${makeSlugText(tag.name)}/`
  }
}
