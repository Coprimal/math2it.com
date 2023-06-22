import { getNotionPage, getPostsBy } from '@app/lib/fetcher'
import { idToUuid } from '@app/lib/helpers'
import { NotionHeader } from '@src/interface'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get('postId')
  const size = request.nextUrl.searchParams.get('size')
  const pageSize = size ? parseInt(size) : 5

  if (!postId || typeof postId !== 'string') {
    return new NextResponse(JSON.stringify({ error: 'A valid id string is required', code: 400 }), {
      status: 400
    })
  }

  /**
   * We don't use getPostHeader() which needs to do other unnecessary requests.
   * Here, we just need to get categories and tags "raw" data to use in the filter.
   */
  const postData = await getNotionPage(postId)
  const { categoryNames, tagIds } = getPostData(postData)

  const filter = buildFilter(categoryNames, tagIds, postId)
  const posts = await getPostsBy({
    filter,
    pageSize
  })

  return new NextResponse(JSON.stringify(posts.filter(post => post.id !== idToUuid(postId))), {
    status: 200
  })
}

function getPostData(postData: NotionHeader) {
  const properties = postData?.properties || null
  const categoryNames = properties?.categories?.multi_select.map(category => category.name) || []
  const tagIds = properties?.tags?.relation?.map(item => item.id) || []

  return {
    categoryNames,
    tagIds
  }
}

function buildFilter(categoryNames: string[], tagIds: string[], postId: string) {
  const categoryFilter = categoryNames.map(categoryName => ({
    property: 'categories',
    multi_select: {
      contains: categoryName
    }
  }))

  const tagFilter = tagIds.map(tagId => ({
    property: 'tags',
    relation: {
      contains: tagId
    }
  }))

  return {
    or: [...categoryFilter, ...tagFilter]
  }
}
