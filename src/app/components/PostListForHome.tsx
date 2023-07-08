import { NOTION_DB_POSTS } from '@app/lib/config'
import { getAuthors, getCategories, getPosts, getPostsBy, getTags } from '@app/lib/fetcher'
import { Post } from '@src/interface'

import { getFilterOf } from '../lib/helpers'
import PostList, { PostType, PostTypeOpts } from './PostsList'

export type PostListForHomeType = 'latest' | 'selected' | 'byCategory'

type PostListForHomeProps = {
  type: PostListForHomeType
  categorySlug?: string // required if type === 'byCategory'
  postTypeOpts?: PostTypeOpts
  postType?: PostType
}

export const postListHomeCount = 8

export default async function PostListForHome(props: PostListForHomeProps) {
  const categories = getCategories()
  const tagsData = getTags()
  const authorsData = getAuthors()
  const [tags, authors] = await Promise.all([tagsData, authorsData])

  let posts: Post[] = []

  switch (props.type) {
    case 'latest':
      posts = await getPosts({
        dbId: NOTION_DB_POSTS,
        categories,
        tags,
        authors,
        pageSize: postListHomeCount
      })
      break

    case 'selected':
      posts = await getPosts({
        dbId: NOTION_DB_POSTS,
        categories,
        tags,
        authors,
        pageSize: postListHomeCount,
        filter: getFilterOf('selected')
      })
      break

    case 'byCategory': {
      if (!props.categorySlug) throw new Error('categorySlug is required if type === "byCategory"')
      const category = categories.find(c => c.slug === props.categorySlug)
      if (!category) return null
      posts = await getPostsBy({
        categories,
        tags,
        authors,
        filter: getFilterOf('category', category),
        pageSize: postListHomeCount
      })
      break
    }
  }

  return (
    <PostList
      posts={posts}
      postType={props.postType ?? 'PostTitleCateDate'}
      postTypeOpts={props.postTypeOpts}
    />
  )
}
