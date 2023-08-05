import { getAuthors, getCategories, getPosts, getPostsBy } from '@app/lib/fetcher'
import { Post } from '@src/interface'

import { getFilterOf } from '../lib/helpers'
import { PostListStyle } from './PostListForHomeSection'
import PostList, { PostType, PostTypeOpts } from './PostsList'

export type PostListForHomeType = 'latest' | 'selected' | 'byCategory'

type PostListForHomeProps = {
  listStyle?: PostListStyle
  type: PostListForHomeType
  categorySlug?: string // required if type === 'byCategory'
  postTypeOpts?: PostTypeOpts
  postType?: PostType
}

export const postListHomeCount = 8

export default async function PostListForHome(props: PostListForHomeProps) {
  const categories = getCategories()
  const authors = await getAuthors()

  let posts: Post[] = []

  switch (props.type) {
    case 'latest':
      posts = await getPosts({
        dbId: process.env.NOTION_DB_POSTS as string,
        categories,
        authors,
        pageSize: postListHomeCount,
        getFull: true
      })
      break

    case 'selected':
      posts = await getPosts({
        dbId: process.env.NOTION_DB_POSTS as string,
        categories,
        authors,
        pageSize: postListHomeCount,
        filter: getFilterOf('selected'),
        getFull: true
      })
      break

    case 'byCategory': {
      if (!props.categorySlug) throw new Error('categorySlug is required if type === "byCategory"')
      const category = categories.find(c => c.slug === props.categorySlug)
      if (!category) return null
      posts = await getPostsBy({
        categories,
        authors,
        filter: getFilterOf('category', category),
        pageSize: postListHomeCount,
        getFull: true
      })
      break
    }
  }

  return (
    <PostList
      listStyle={props.listStyle}
      posts={posts}
      postType={props.postType ?? 'PostTitleCateDate'}
      postTypeOpts={props.postTypeOpts}
    />
  )
}
