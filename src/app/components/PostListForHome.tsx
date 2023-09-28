import { getAuthors, getCategories, getPosts } from '@app/lib/fetcher'
import PostList, { PostType, PostTypeOpts } from '@notion-x/components/PostsList'
import { Post } from '@notion-x/interface'

import { getFilterOf } from '../lib/helpers'
import { PostListStyle } from './PostListForHomeSection'

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
        categories,
        authors,
        pageSize: postListHomeCount
      })
      break

    case 'selected':
      posts = await getPosts({
        categories,
        authors,
        pageSize: postListHomeCount,
        filter: getFilterOf('selected')
      })
      break

    case 'byCategory': {
      if (!props.categorySlug) throw new Error('categorySlug is required if type === "byCategory"')
      const category = categories.find(c => c.slug === props.categorySlug)
      if (!category) return null
      posts = await getPosts({
        categories,
        authors,
        filter: getFilterOf('category', category),
        pageSize: postListHomeCount
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
