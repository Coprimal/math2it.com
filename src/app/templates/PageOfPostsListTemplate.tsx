import Container from '@c/Container'
import Pagination from '@c/Pagination'
import PostList from '@c/PostsList'
import { Post } from '@src/interface'
import cn from 'classnames'
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
  coverComponent?: React.ReactNode
}

export const heightCoverPostList = 'h-[30vh] max-h-[30vh] min-h-[30vh]'
export const spacingCoverPostList = 'pb-6 pt-10'

export default function PageOfPostsListTemplate(props: PageOfPostsListTemplateProps) {
  const pattern = useGeoPattern(props.title, {
    color: props.patternColor
  })

  return (
    <>
      <div
        className={cn(
          'mx-auto flex w-full items-center justify-between',
          'relative',
          heightCoverPostList
        )}
        style={props.coverComponent ? undefined : { backgroundImage: pattern.toDataUrl() }}
      >
        {props.iconComponent && (
          <div className="relative flex h-full w-full items-center overflow-hidden">
            {props.coverComponent}
          </div>
        )}
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-full',
            'flex items-center justify-center',
            'bg-[#0000005e]'
          )}
        >
          <Container>
            <h2
              className="mb-2 mt-4 w-fit text-3xl font-bold drop-shadow-sm"
              style={{ color: props.titleColor ?? '#fff' }}
            >
              {props.iconComponent && (
                <span className="mr-1 opacity-90">{props.iconComponent}</span>
              )}
              {props.title}
            </h2>
            {props.subtitle && (
              <div className="pl-10 text-lg" style={{ color: props.titleColor ?? '#666' }}>
                {props.subtitle}
              </div>
            )}
          </Container>
        </div>
      </div>
      <Container className={spacingCoverPostList}>
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
