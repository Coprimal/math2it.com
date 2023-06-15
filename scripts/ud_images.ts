#!/usr/bin/env node
import { getJoinedRichText } from '@app/lib/block-helpers'
import { defaultPostTitle, notionDateName, notionMaxRequest } from '@app/lib/config'
import {
  getNotionBlocksWithoutCache,
  getNotionDatabaseWithoutCache,
  getNotionPageWithoutCache
} from '@app/lib/db'
import { getFilter, getPredefinedCategories, transformNotionPostsData } from '@app/lib/helpers'
import { Client } from '@notionhq/client'
import {
  BlockObjectResponse,
  ImageBlockObjectResponse,
  ListBlockChildrenResponse
} from '@notionhq/client/build/src/api-endpoints'
import { Author, Category, NotionHeader, NotionPost, NotionSorts, Post, Tag } from '@src/interface'
import chalk from 'chalk'
import got from 'got'
import { get } from 'lodash'
import * as yargsType from 'yargs'
import yargs from 'yargs/yargs'

const notionClient = new Client({ auth: process.env.NOTION_TOKEN })

/**
 * 1. We don't consider default images of Notion (notion.so), images already uploaded to imgur (imgur.com),
 * images from unsplash (unsplash.com). We only consider images uploaded from local/clipboard or images
 * from other websites. Check the `ignoreImage()` function.
 * 2. Images will be uploaded to imgur in a corresponding album with their category. Check the albumHashMap.
 *
 *
 * 👍 How to use this script?
 *  npx tsx -r dotenv/config ./scripts/ud_images.ts dotenv_config_path=.env.local <options>
 *
 * --a: action
 *   'headerPost': update cover image / book cover of a post, "--pid" is required
 *     eg: npx tsx -r dotenv/config ./scripts/ud_images.ts dotenv_config_path=.env.local --a coverPost --pid 'xxx'
 *   'headerAll': update cover images / book covers of all posts in the DB, "--dbid" is required
 *     eg: npx tsx -r dotenv/config ./scripts/ud_images.ts dotenv_config_path=.env.local --a coverAll --dbid 'xxx'
 *   'imagesInPost': update images in a post, "--pid" is required
 *     eg: npx tsx -r dotenv/config ./scripts/ud_images.ts dotenv_config_path=.env.local --a imagesInPost --pid 'xxx'
 * --pid: post id
 * --dbid: database id
 */

// Images of a post will be uploaded to imgur in a corresponding album with its category
// Cover images will be uploaded to imgur in album "Cover"
const albumHashMap = {
  'bai-dich': 'MWnwinC',
  'cong-cu': 'v9IVBUz',
  'cong-nghe': 'cJBoUem',
  'giao-duc': 'Srryrzh',
  'sach-hay': 'Ja0Yb2X',
  'toan-hoc': 'yGAJnbo',
  cover: 'UPUPHV9', // for cover images
  bookCover: 'ckRVJLZ' // for book cover images
}

type NotionImageInfo = {
  fileUrl: string | null
  categorySlug: string | null
  title: string
  postId?: string
  blockId?: string
}

async function main(argv: yargsType.Argv['argv']) {
  const { a, pid, dbid } = argv as never

  switch (a) {
    case 'headerPost': {
      console.log(chalk.blue('-----headerPost'))
      await updateCoverAndBookCoverForSinglePost(pid, 'cover')
      await updateCoverAndBookCoverForSinglePost(pid, 'bookCover')
      break
    }

    case 'headerAll': {
      console.log(chalk.blue('-----headerAll'))
      await updateCoverAndBookCoverForAllPosts(dbid, 'cover')
      await updateCoverAndBookCoverForAllPosts(dbid, 'bookCover')
      break
    }

    case 'imagesInPost': {
      console.log(chalk.blue('-----imagesInPost'))
      updateImagesInPost(pid)
      break
    }

    default:
      console.log('🥏 No action')
      break
  }
}

const argv = yargs(process.argv.slice(2))
main(argv.argv)

async function updateImagesInPost(postId: string) {
  console.log(chalk.blue('🥏 Update images in a post'))
  if (!postId) {
    console.log(chalk.red('🚨 Post id is required!'))
    return
  }
  console.log('👉 Post id: ', postId)
  console.log(chalk.yellow('⏳ Downloading post info from Notion...'))
  const postCoverInfo = await getNotionImageInfo(postId, 'cover')
  console.log(chalk.yellow('⏳ Downloading all blocks in the post from Notion...'))
  const blocks = await getBlocks(postId)
  const flatBlocks = flattenAllBlocks(blocks)
  const imageBlocks = flatBlocks.filter(block => 'type' in block && block.type === 'image')
  const notionImageInfos = getNotionImageInfoFromBlocks(imageBlocks, postCoverInfo!)
  const imagesToUpdate = notionImageInfos.filter(
    image => image.fileUrl && !ignoreImage(image.fileUrl)
  )
  console.log(`👉 There are ${imagesToUpdate.length} images to update`)
  for (const notionImageInfo of imagesToUpdate) {
    await updateImage({
      type: 'imagesInPost',
      blockId: notionImageInfo.blockId,
      image: notionImageInfo,
      showLog: true
    })
  }
}

function getNotionImageInfoFromBlocks(
  imageBlocks: ListBlockChildrenResponse['results'],
  postCoverInfo: NotionImageInfo
): NotionImageInfo[] {
  const blocks = imageBlocks as ImageBlockObjectResponse[]
  const notionImageInfos: NotionImageInfo[] = []
  for (const block of blocks) {
    const blockId = block.id
    const title =
      getJoinedRichText(block?.image?.caption) || `An image in the post ${postCoverInfo.title}`
    const fileUrl = get(block, 'image.file.url') || get(block, 'image.external.url') || null
    const categorySlug = postCoverInfo.categorySlug
    notionImageInfos.push({ title, fileUrl, categorySlug, blockId })
  }
  return notionImageInfos
}

// We don't care the nested blocks. We group children blocks with their parent block.
function flattenAllBlocks(
  blocks: ListBlockChildrenResponse['results']
): ListBlockChildrenResponse['results'] {
  const childBlocks = blocks
    .filter(block => 'has_children' in block && block.has_children)
    .map((block: any) => {
      const nestedChildren = flattenAllBlocks(block['children'])
      return nestedChildren
    })

  return [...blocks, ...childBlocks.flat()]
}

async function updateCoverAndBookCoverForAllPosts(dbId: string, type: 'cover' | 'bookCover') {
  if (!dbId) {
    console.log(chalk.red('🚨 Database id is required!'))
    return
  }
  console.log(chalk.blue(`🥏 Update ${type} images of all posts`))
  console.log(chalk.yellow(`⏳ Downloading ${type} image of all posts from Notion...`))
  const notionImageInfos = await getNotionImageInfoForAllPosts(dbId, type)
  const imagesToUpdate = notionImageInfos.filter(
    image => image.fileUrl && !ignoreImage(image.fileUrl)
  )
  console.log(`👉 There are ${imagesToUpdate.length} ${type}(s) to update`)
  for (const image of imagesToUpdate) {
    await updateImage({
      type,
      postId: image.postId,
      image: image,
      showLog: true
    })
  }
}

async function getNotionImageInfoForAllPosts(
  dbId: string,
  type: 'cover' | 'bookCover'
): Promise<NotionImageInfo[]> {
  const posts = await getPosts({
    filter: null,
    pageSize: notionMaxRequest,
    dbId
  })
  const notionImageInfos: NotionImageInfo[] = []
  for (const post of posts) {
    const title = post.title
    const fileUrl =
      type === 'bookCover' ? post.bookCover?.sourceUrl : post.featuredImage?.sourceUrl ?? null
    const categorySlug = post.categories?.[0].slug ?? null
    notionImageInfos.push({ title, fileUrl: fileUrl || null, categorySlug, postId: post.id })
  }
  return notionImageInfos
}

async function updateCoverAndBookCoverForSinglePost(postId: string, type: 'cover' | 'bookCover') {
  console.log(chalk.blue(`🥏 Update ${type} image of a post`))
  if (!postId) {
    console.log(chalk.red('🚨 Post id is required!'))
    return
  }
  console.log('👉 Post id: ', postId)

  console.log(chalk.yellow(`⏳ Checking and downloading ${type} image from Notion...`))
  const notionImageInfo = await getNotionImageInfo(postId, type)
  updateImage({ type, postId, image: notionImageInfo, showLog: true })
}

async function updateImage(options: {
  type: 'cover' | 'bookCover' | 'imagesInPost'
  postId?: string // used to update cover or book cover
  blockId?: string // used to update images in a post
  image: NotionImageInfo
  showLog?: boolean
}): Promise<void> {
  const { postId, blockId, type, image, showLog } = options
  if (!postId && !blockId) {
    console.log(chalk.red('🚨 Post/Block id is required!'))
    return
  }
  const id = postId || blockId
  const { title, fileUrl, categorySlug } = image
  console.log(
    chalk.blue(
      `\n🌕 [${id}] Updating image with type ${type.toUpperCase()} for post/block title "${title}"`
    )
  )
  if (showLog) console.log('👉 notionUrl: ', fileUrl)
  if (fileUrl && !ignoreImage(fileUrl)) {
    const albumKey =
      type === 'bookCover' ? 'bookCover' : type === 'cover' ? 'cover' : (categorySlug as any)
    const imgurAlbumHash = get(albumHashMap, albumKey)

    console.log(chalk.yellow(`⏳ Uploading image to Imgur under album key "${albumKey}"`))
    try {
      const { url: imgurUrl, deleteHash } = await uploadImageToImgur(fileUrl, imgurAlbumHash, title)
      if (showLog) console.log('👉 imgurUrl: ', imgurUrl)

      console.log(chalk.yellow(`⏳ Updating image with type ${type} on Notion...`))
      try {
        if (type === 'cover' && postId) await updateNotionCoverImage(postId, imgurUrl)
        if (type === 'imagesInPost' && blockId) await updateNotionBlockImage(blockId, imgurUrl)
        if (type === 'bookCover' && postId) await updateBookCoverProperty(postId, imgurUrl, title)
        console.log(chalk.green('✅ Done updating image on Notion!'))
      } catch (error) {
        console.log(chalk.red('🚩 Cannot update image on Notion!'))
        console.log(chalk.yellow('⏳ Deleting image from Imgur...'))
        await deleteImageFromImgur(deleteHash)
        console.log(chalk.green('✅ Done deleting image from Imgur!'))
        throw error
      }
    } catch (error) {
      return console.log(chalk.red('🚨 Error: ', error))
    }
  } else {
    console.log(
      chalk.blue(
        '✅ There is no image or image is already hosted on a right place. No action needed!'
      )
    )
  }
}

function ignoreImage(url: string): boolean {
  const hostName = new URL(url).hostname
  return (
    hostName.endsWith('imgur.com') ||
    hostName.endsWith('notion.so') ||
    hostName.endsWith('unsplash.com')
  )
}

/**
 * Get the cover or book cover image of a Notion page
 *
 */
async function getNotionImageInfo(
  pageId: string,
  type: 'cover' | 'bookCover'
): Promise<NotionImageInfo> {
  if (!pageId) return { title: '', fileUrl: null, categorySlug: null }
  const response: unknown = await getNotionPageWithoutCache(pageId)
  const notionHeader = response as NotionHeader
  const fileUrl =
    type === 'bookCover'
      ? notionHeader?.properties?.bookCover?.files?.[0]?.file?.url
      : notionHeader?.cover?.file?.url || notionHeader?.cover?.external?.url
  const categories = getPredefinedCategories(notionHeader?.properties?.categories?.multi_select)
  const title = notionHeader?.properties?.name?.title?.[0]?.plain_text || defaultPostTitle
  return { title, fileUrl: fileUrl || null, categorySlug: categories[0].slug! }
}

async function uploadImageToImgur(
  notionImgUrl: string,
  imgurAlbumHash: string,
  title: string
): Promise<{ id: string; url: string; deleteHash: string }> {
  const formData = new FormData()
  formData.set('image', notionImgUrl)
  formData.set('type', 'url')
  formData.set('album', imgurAlbumHash)
  formData.set('title', `Cover image of ${title}`)

  const data = await got
    .post('https://api.imgur.com/3/upload', {
      headers: {
        Authorization: `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`
      },
      body: formData as any
    })
    .json()

  return {
    id: get(data, 'data.id', ''),
    url: get(data, 'data.link', ''),
    deleteHash: get(data, 'data.deletehash', '')
  }
}

// We use imageDeleteHash instead of imageHash to overcome the auth issue
// (It means we don't need an auth token to delete an image)
async function deleteImageFromImgur(imageDeleteHash: string) {
  return await got.delete(`https://api.imgur.com/3/image/${imageDeleteHash}`, {
    headers: {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
    }
  })
}

async function updateNotionCoverImage(pageId: string, imgurUrl: string): Promise<NotionHeader> {
  const response: unknown = await notionClient.pages.update({
    page_id: pageId,
    cover: {
      type: 'external',
      external: {
        url: imgurUrl
      }
    }
  })

  return response as NotionHeader
}

async function updateBookCoverProperty(
  pageId: string,
  imgurUrl: string,
  title?: string
): Promise<NotionHeader> {
  const response: unknown = await notionClient.pages.update({
    page_id: pageId,
    properties: {
      bookCover: {
        files: [
          {
            name: `Book cover ${title}.png`,
            type: 'external',
            external: { url: imgurUrl }
          }
        ]
      }
    }
  })

  return response as NotionHeader
}

async function updateNotionBlockImage(blockId: string, imgurUrl: string) {
  const response: unknown = await notionClient.blocks.update({
    block_id: blockId,
    image: {
      external: {
        url: imgurUrl
      }
    }
  })

  return response
}

/**
 * This method is copied from ./src/app/lib/fetcher.ts. We cannot use the method is this file because
 * there will be an error of "TypeError: (0 , import_react.cache) is not a function".
 * This is because we are importing this file in a non-React file.
 */
export async function getPosts(options: {
  dbId: string
  categories?: Category[]
  tags?: Tag[]
  authors?: Author[]
  filter?: unknown
  startCursor?: string
  pageSize?: number
  sorts?: NotionSorts[]
}): Promise<Post[]> {
  const { dbId, filter, categories, tags, authors, startCursor, pageSize, sorts } = options

  const defaultSort = {
    property: notionDateName,
    direction: 'descending'
  } as NotionSorts
  const sortsToUse: any = sorts?.length ? sorts.push(defaultSort) : [defaultSort]
  const filterToUse = getFilter(filter)

  let data = await getNotionDatabaseWithoutCache(
    dbId,
    filterToUse,
    startCursor,
    pageSize,
    sortsToUse
  )
  let postsList = get(data, 'results', []) as NotionPost[]

  if (data && pageSize && pageSize >= notionMaxRequest && data['has_more']) {
    let newStartCursor = startCursor
    while (data!['has_more']) {
      newStartCursor = data!['next_cursor'] as string
      data = await getNotionDatabaseWithoutCache(
        dbId,
        filterToUse,
        newStartCursor,
        pageSize,
        sortsToUse
      )
      if (get(data, 'results')) {
        const lst = data!['results'] as any[]
        postsList = [...postsList, ...lst]
      }
    }
  }

  const posts = await transformNotionPostsData({
    data: postsList,
    categories,
    tags,
    authors
  })
  return posts
}

/**
 * This method is copied from ./src/app/lib/fetcher.ts. WE DON'T COPY ALL!
 *
 * We cannot use the method is this file because
 * there will be an error of "TypeError: (0 , import_react.cache) is not a function".
 * This is because we are importing this file in a non-React file.
 */
export async function getBlocks(
  blockId: string,
  initNumbering?: string
): Promise<ListBlockChildrenResponse['results']> {
  const data = await getNotionBlocksWithoutCache(blockId)
  const blocks = data?.results as
    | (BlockObjectResponse & {
        list_item?: string
        children?: ListBlockChildrenResponse['results']
      })[]
    | []

  if (!blocks?.length) return []

  let number = 1
  for (const block of blocks) {
    if (block.type === 'numbered_list_item') {
      if (initNumbering && ['1', '2', '3'].includes(initNumbering)) initNumbering = undefined
      block['list_item'] = (initNumbering ?? '') + `${number}.`
      number++
    } else {
      number = 1
    }

    if (block.type === 'bulleted_list_item') {
      block['list_item'] = !initNumbering ? '1' : initNumbering === '1' ? '2' : '3'
    }

    if (block.has_children) {
      const children = await getBlocks(block.id, block['list_item'])
      block['children'] = children
    }
  }

  return blocks
}
