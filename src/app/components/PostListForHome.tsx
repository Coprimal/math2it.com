import { Post } from '../../interface'
import { NOTION_DB_POSTS } from '../lib/config'
import { getAuthors, getCategories, getPosts, getTags } from '../lib/fetcher'
import Container from './Container'
import PostList from './PostsList'

type PostListForHomeProps = {
  type: 'latest' | 'selected' | 'byCategory'
  category?: string // required if type === 'byCategory'
}

export default async function PostListForHome(props: PostListForHomeProps) {
  const categories = getCategories()
  const tagsData = getTags()
  const authorsData = getAuthors()
  const [tags, authors] = await Promise.all([tagsData, authorsData])

  let posts: Post[] = []
  if (props.type === 'latest') {
    posts = await getPosts({
      dbId: NOTION_DB_POSTS,
      categories,
      tags,
      authors,
      pageSize: 5
    })
  }

  return (
    <Container>
      <PostList posts={posts} postType="PostTitleCateDate" postTypeOpts={{ hideDate: true }} />
    </Container>
  )
}
