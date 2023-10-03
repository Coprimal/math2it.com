import { getJoinedRichText, makeSlugText } from '@notion-x/src/lib/helpers'
import { Client } from '@notionhq/client'
import chalk from 'chalk'
import got from 'got'
import { get } from 'lodash'
import yargs, * as yargsType from 'yargs'

// --------------------------------------------------------------------------------------------
// How to use?
// npx tsx -r dotenv/config ./scripts/ud_images.ts dotenv_config_path=.env.local --a images-in-post --pid <postId>
// --------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------
// Cockpit
// --------------------------------------------------------------------------------------------

const notionClient = new Client({ auth: process.env.NOTION_TOKEN })

async function main(argv: yargsType.Argv['argv']) {
  const { a, pid } = argv as never
  switch (a) {
    case 'header': {
      await updateCover(pid)
      await updateBookCover(pid)
      break
    }

    case 'header-all': {
      await updateCoverAll(process.env.NOTION_DB_POSTS as string)
      await updateBookCoverAll(process.env.NOTION_DB_POSTS as string)
      break
    }

    case 'cover': {
      await updateCover(pid)
      break
    }

    case 'cover-all': {
      await updateCoverAll(process.env.NOTION_DB_POSTS as string)
      break
    }

    case 'book-cover': {
      await updateBookCover(pid)
      break
    }

    case 'book-cover-all': {
      await updateBookCoverAll(process.env.NOTION_DB_POSTS as string)
      break
    }

    case 'images-in-post': {
      await updateImagesInPost(pid)
      break
    }
  }
}

const argv = yargs(process.argv.slice(2))
main(argv.argv)

// --------------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------------

async function updateImagesInPost(postId: string) {
  console.log(chalk.blue(`🌶 Update Image Blocks for post id ${postId}`))
  if (!postId) return handleError('Missing post id', 'updateImagesInPost()')

  console.log(chalk.yellow('⧗ Checking and downloading image from Notion...'))
  const postInfo = await getPostInfo(postId)
  const blocks = await getBlocks(postId)
  const flatBlocks = flattenAllBlocks(blocks)
  const imageBlocks = flatBlocks.filter((block: any) => 'type' in block && block.type === 'image')

  if (!imageBlocks || !imageBlocks?.length) {
    return handleError('There is no image block', 'updateImagesInPost()')
  }

  const blockImages = getBlockImageInfo(imageBlocks, postInfo)
  const imgs = blockImages.filter(img => !ignoreImage(img.fileUrl))
  console.log(chalk.blue(`\n### There are ${imgs.length} images to be downloaded.`))

  for (const img of imgs) {
    await processUpdateImage({
      type: 'imageInPost',
      id: img.blockId,
      fileUrl: img.fileUrl,
      title: img.title,
      categorySlug: img.categorySlug,
      multiple: true
    })
  }
}

function getBlockImageInfo(blocks: any[], postInfo: PostInfo) {
  const blockImages = []
  for (const block of blocks) {
    const blockId = block.id
    const title = getJoinedRichText(block?.image?.caption) || postInfo?.postTitle
    const fileUrl = get(block, 'image.file.url') || get(block, 'image.external.url') || null
    const categorySlug = postInfo?.categorySlug
    blockImages.push({ blockId, title, fileUrl, categorySlug })
  }

  return blockImages
}

async function getBlocks(postId: string) {
  const data = await getNotionBlocks(postId)
  const blocks = data?.results as any
  if (!blocks || !blocks?.length) return []

  for (const block of blocks) {
    if (block.has_children) {
      const children = await getBlocks(block.id)
      block['children'] = children
    }
  }

  return blocks
}

async function updateBookCover(postId: string) {
  console.log(chalk.blue(`🌶 Update Book Cover for post id ${postId}`))
  if (!postId) return handleError('Missing post id', 'updateBookCover()')

  console.log(chalk.yellow('⧗ Checking and downloading image from Notion...'))
  const { postTitle, fileUrl } = await getNotionBookCover(postId)
  if (!fileUrl) return handleError('Missing file url', 'updateBookCover()')
  await processUpdateImage({ type: 'bookCover', id: postId, fileUrl, title: postTitle })
}

async function updateBookCoverAll(dbId: string) {
  console.log(chalk.blue(`🌶 Update BOOK COVER for ALL POSTS in database ${dbId}`))
  if (!dbId) return handleError('Missing database id', 'updateBookCoverAll()')

  console.log(chalk.yellow('⧗ Checking and downloading image from Notion...'))
  const posts = await getPosts(dbId)
  for (const post of posts) {
    if (!post?.postId || !post?.bookCoverUrl) continue
    await processUpdateImage({
      type: 'bookCover',
      id: post?.postId,
      fileUrl: post.bookCoverUrl,
      title: post.postTitle,
      multiple: true
    })
  }
}

async function updateCover(postId: string) {
  console.log(chalk.blue(`🌶 Update Cover for post id ${postId}`))
  if (!postId) return handleError('Missing post id', 'updateCover()')

  console.log(chalk.yellow('⧗ Checking and downloading image from Notion...'))
  const { postTitle, fileUrl } = await getNotionCover(postId)
  if (!fileUrl) return handleError('Missing file url', 'updateCover()')
  await processUpdateImage({ type: 'cover', id: postId, fileUrl, title: postTitle })
}

async function updateCoverAll(dbId: string) {
  console.log(chalk.blue(`🌶 Update COVER for ALL POSTS in database ${dbId}`))
  if (!dbId) return handleError('Missing database id', 'updateCoverAll()')

  console.log(chalk.yellow('⧗ Checking and downloading image from Notion...'))
  const posts = await getPosts(dbId, undefined, 'categories')
  for (const post of posts) {
    if (!post?.postId || !post?.coverUrl) continue
    await processUpdateImage({
      type: 'cover',
      id: post?.postId,
      fileUrl: post.coverUrl,
      title: post.postTitle,
      multiple: true
    })
  }
}

async function processUpdateImage(options: {
  type: 'cover' | 'bookCover' | 'imageInPost'
  id: string // "postId" or "blockId" when type is "imageInPost"
  fileUrl: string
  title: string
  multiple?: boolean // when this method is called from updateCoverAll()
  categorySlug?: string // when type is "imageInPost"
}) {
  const { type, id: postId, fileUrl, title: postTitle, multiple, categorySlug } = options
  if (multiple) console.log(chalk.blue(`\n🌶 Update ${type.toLocaleUpperCase()} for id ${postId}`))

  if (ignoreImage(fileUrl)) {
    console.log(chalk.green('✓ No action needed!'))
    return
  }

  console.log('----> notionUrl: ', fileUrl)
  console.log('----> postTitle / Block image title: ', postTitle)

  if (ignoreImage(fileUrl)) return

  const albumKey = ['cover', 'bookCover'].includes(type) ? type : categorySlug
  if (!albumKey) return handleError('Missing album key', 'processUpdateImage()')
  const imgurAlbumHash = get(albumHashMap, albumKey)
  console.log(chalk.yellow(`⧗ Uploading image to Imgur under album key "${albumKey}"`))
  try {
    const { url: imgurUrl, deleteHash } = await uploadImageToImgur(
      fileUrl,
      imgurAlbumHash,
      postTitle
    )
    console.log(chalk.green('✓ Done!'))
    console.log('----> imgurUrl: ', imgurUrl)

    console.log(chalk.yellow(`⧗ Modifying ${type} on Notion...`))
    try {
      if (type === 'cover') await updateNotionCoverImage(postId, imgurUrl)
      if (type === 'bookCover') await updateNotionBookCoverImage(postId, imgurUrl, postTitle)
      if (type === 'imageInPost') await updateNotionBlockImage(postId, imgurUrl)
      console.log(chalk.green('✓ Done!'))
    } catch (error) {
      console.log(chalk.red('🚩 Cannot update image on Notion!'))
      console.log(chalk.yellow('⧗ Deleting image from Imgur...'))
      await deleteImageFromImgur(deleteHash)
      console.log(chalk.green('✓ Done deleting image from Imgur!'))
      throw error
    }
  } catch (error) {
    return console.log(chalk.red('🚨 Error (processUpdateCover): ', error))
  }
}

async function getNotionCover(pageId: string) {
  if (!pageId) return { title: '', fileUrl: null }

  const response: unknown = await getNotionPage(pageId)
  const notionHeader = response as NotionHeader
  const fileUrl = notionHeader?.cover?.file?.url || notionHeader?.cover?.external?.url
  const postTitle = notionHeader?.properties?.name?.title?.[0]?.plain_text || 'Không tựa đề'
  return { postTitle, fileUrl }
}

async function getNotionBookCover(pageId: string) {
  if (!pageId) return { title: '', fileUrl: null }

  const response: unknown = await getNotionPage(pageId)
  const notionHeader = response as NotionHeader
  const fileUrl =
    notionHeader?.properties?.bookCover?.files?.[0]?.external?.url ||
    notionHeader?.properties?.bookCover?.files?.[0]?.file?.url
  const postTitle = notionHeader?.properties?.name?.title?.[0]?.plain_text || 'Không tựa đề'
  return { postTitle, fileUrl }
}

/**
 * Used in updateImagesInPost()
 */
async function getPostInfo(postId: string): Promise<PostInfo> {
  if (!postId) return handleError('Missing post id', 'getPostInfo()') as any

  const response: unknown = await getNotionPage(postId)
  const notionHeader = response as NotionHeader
  const postTitle = notionHeader?.properties?.name?.title?.[0]?.plain_text || 'Không tựa đề'
  const categories = notionHeader?.properties?.categories?.multi_select
    ?.map(category => predefinedCategories.find(c => c === makeSlugText(category.name)))
    ?.filter(c => c)

  if (!categories || !categories.length) {
    return handleError(`Không có category cho bài viết: ${postTitle}`, 'getPostInfo()') as any
  }

  return { postTitle, categorySlug: categories[0]! }
}

async function getPosts(
  dbId: string,
  startCursor?: string,
  ignore?: TransformNotionPostsDataIgnore
) {
  console.log('_____getPosts()....')
  try {
    let data = await getNotionDatabase(dbId)
    let postsList = get(data, 'results', [])
    if (data && data['has_more']) {
      let newStartCursor = startCursor
      while (data!['has_more']) {
        newStartCursor = data!['next_cursor'] as string
        data = await getNotionDatabase(dbId, newStartCursor)
        if (get(data, 'results')) {
          const lst = data!['results'] as any[]
          postsList = [...postsList, ...lst]
        }
      }
    }
    const posts = (await transformNotionPostsData(postsList, ignore)) || []
    return posts
  } catch (error) {
    console.log('🐞 _____getPosts() error: ', error)
    return []
  }
}

// --------------------------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------------------------

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

const predefinedCategories = Object.keys(albumHashMap).filter(
  category => category !== 'cover' && category !== 'bookCover'
)

function handleError(errorMessage: string, context: string) {
  console.log(chalk.red(`🚨 [${context}] ${errorMessage}`))
  return
}

function ignoreImage(url: string): boolean {
  const hostName = new URL(url).hostname
  return hostName.endsWith('imgur.com')
}

function flattenAllBlocks(blocks: any[]): any {
  const childBlocks = blocks
    .filter(block => 'has_children' in block && block.has_children)
    .map((block: any) => {
      const nestedChildren = flattenAllBlocks(block['children'])
      return nestedChildren
    })

  return [...blocks, ...childBlocks.flat()]
}

// --------------------------------------------------------------------------------------------
// Transformers
// --------------------------------------------------------------------------------------------

type TransformNotionPostsDataIgnore = 'categories'
async function transformNotionPostsData(
  data: NotionPost[],
  ignore?: TransformNotionPostsDataIgnore
) {
  if (!data || !data.length) return []

  return Promise.all(
    data.map(post => {
      const title = get(post, 'properties.name.title[0].plain_text', 'Không tựa đề')
      const coverUrl = post?.cover?.file?.url || post?.cover?.external?.url
      const bookCoverUrl = get(post, 'properties.bookCover.files[0].file.url') as string
      const categories = post.properties?.categories?.multi_select
        ?.map(category => predefinedCategories.find(c => c === makeSlugText(category.name)))
        ?.filter(c => c)

      if ((!ignore || ignore !== 'categories') && (!categories || !categories.length)) {
        handleError(`Không có category cho bài viết: ${title}`, 'transformNotionPostsData()')
        return null
      }

      return {
        postId: post.id,
        postTitle: title,
        coverUrl,
        bookCoverUrl,
        categorySlug: categories?.[0]
      }
    })
  )
}

// --------------------------------------------------------------------------------------------
// Fetchers
// --------------------------------------------------------------------------------------------

async function getNotionPage(pageId: string) {
  const url = `https://api.notion.com/v1/pages/${pageId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': process.env.NOTION_VERSION as string
    }
  })
  return res.json()
}

async function getNotionDatabase(dbId: string, startCursor?: string): Promise<any> {
  try {
    const url = `https://api.notion.com/v1/databases/${dbId}/query`
    const requestBody = {
      sorts: [
        {
          property: 'finalModified',
          direction: 'descending'
        }
      ],
      start_cursor: startCursor,
      page_size: 100
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': process.env.NOTION_VERSION as string,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    return res.json()
  } catch (error: any) {
    console.error(error)
    // Retry after a number of seconds in the returned header
    const retryAfter = error?.response?.headers['retry-after'] || error['retry-after']
    if (retryAfter) {
      console.log(`Retrying after ${retryAfter} seconds`)
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000 + 500))
      return await getNotionDatabase(dbId, startCursor)
    }
    return
  }
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

async function updateNotionBookCoverImage(
  pageId: string,
  imgurUrl: string,
  postTitle: string
): Promise<NotionHeader> {
  const response: unknown = await notionClient.pages.update({
    page_id: pageId,
    properties: {
      bookCover: {
        files: [
          {
            name: `Book cover for post ${postTitle}`,
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

async function deleteImageFromImgur(imageDeleteHash: string) {
  return await got.delete(`https://api.imgur.com/3/image/${imageDeleteHash}`, {
    headers: {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
    }
  })
}

async function getNotionBlocks(pageId: string, startCursor?: string) {
  let url = `https://api.notion.com/v1/blocks/${pageId}/children`
  if (startCursor) url += `&start_cursor=${startCursor}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': process.env.NOTION_VERSION as string
    }
  })
  return res.json()
}

// --------------------------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------------------------

type NotionHeader = {
  cover?: { external: { url: string }; file: { url: string } }
  properties: {
    name: { title: { plain_text: string }[] }
    finalModified: { formula: { date: { start: any } } }
    categories: { multi_select: { name: string }[] }
    authors: { relation: { id: string }[] }
    selected: { checkbox: boolean }
    bookCover: { files: { external: { url: string }; file: { url: string } }[] }
    slug: { rich_text: { plain_text: string }[] }
  }
}

type NotionPost = {
  id: string
  created_time: string
  last_edited_time?: string
  cover?: {
    external?: {
      url: string
    }
    file?: {
      url: string
    }
  }
  properties?: {
    name: {
      title: { plain_text: string }[]
    }
    url: string
    categories?: {
      multi_select: { name: string }[]
    }
    author?: {
      select: { name: string }
    }
    excerpt?: {
      rich_text: { plain_text: string }[]
    }
    bookCover?: { files: { external: { url: string }; file: { url: string } }[] }
  }
}

type PostInfo = {
  postTitle: string
  categorySlug: string
}
