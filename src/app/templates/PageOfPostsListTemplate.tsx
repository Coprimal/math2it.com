import Container from '@c/Container'
import Pagination from '@c/Pagination'
import PostList from '@c/PostsList'
import { Post } from '@src/interface'
import { useGeoPattern } from 'react-geopattern'

type PageOfPostsListTemplateProps = {
  title: string
  subtitle?: string
  uri: string
  posts: Post[]
  totalPages: number
  currentPage: number
  iconComponent?: React.ReactNode
  patternColor?: string
  titleColor?: string
}

export default function PageOfPostsListTemplate(props: PageOfPostsListTemplateProps) {
  const pattern = useGeoPattern(props.title, {
    color: props.patternColor
  })

  return (
    <>
      <div
        className="mx-auto flex h-[25vh] max-h-[25vh] min-h-[25vh] items-center justify-between"
        style={{ backgroundImage: pattern.toDataUrl() }}
      >
        <Container>
          <h2
            className="mb-2 mt-4 w-fit text-3xl font-bold drop-shadow-sm"
            style={{ color: props.titleColor ?? '#fff' }}
          >
            {props.iconComponent && <span className="mr-1 opacity-90">{props.iconComponent}</span>}
            {props.title}
          </h2>
          {props.subtitle && (
            <div className="pl-10 text-lg" style={{ color: props.titleColor ?? '#666' }}>
              {props.subtitle}
            </div>
          )}
        </Container>
      </div>
      <Container className="pb-6 pt-10">
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
    </>
  )
}
