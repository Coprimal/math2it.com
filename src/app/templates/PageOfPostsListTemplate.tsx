import Container from '@c/Container'
import Pagination from '@c/Pagination'
import PostList from '@c/PostsList'
import { Post } from '@src/interface'

type PageOfPostsListTemplateProps = {
  title: string
  uri: string
  posts: Post[]
  totalPages: number
  currentPage: number
}

export default function PageOfPostsListTemplate(props: PageOfPostsListTemplateProps) {
  return (
    <Container>
      <div className=" py-8">
        <h2 className="my-4 w-fit text-3xl font-bold text-slate-600">{props.title}</h2>
      </div>
      {props.posts.length === 0 && <div className="my-4 text-xl font-bold">No post found</div>}
      {props.posts.length > 0 && (
        <>
          <div>
            {props.posts.length > 0 && (
              <PostList
                posts={props.posts}
                postType="PostTitleCateDate"
                postTypeOpts={{ hideCategory: true }}
              />
            )}
          </div>
          {props.totalPages > 1 && (
            <Pagination
              className="my-8"
              path={props.uri}
              total={props.totalPages}
              current={props.currentPage}
            />
          )}
        </>
      )}
    </Container>
  )
}
