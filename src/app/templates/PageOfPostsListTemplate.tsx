import Container from '@c/Container'
import ImageComponent from '@/src/components/notion/ImageComponent'
import Pagination from '@/src/components/notion/Pagination'
import PostList from '@/src/components/notion/PostsList'
import { Post, PostTypeOpts } from '@/src/types/notion'
import cn from 'classnames'
import { StaticImageData } from 'next/image'

import { defaultFeaturedImage, defaultPostTypeOpts } from '../lib/config'

type PageOfPostsListTemplateProps = {
  title: string
  subtitle?: string | null
  uri?: string
  posts: Post[]
  totalPages: number
  currentPage: number
  iconComponent?: React.ReactNode
  titleColor?: string
  cover?: StaticImageData
  postTypeOpts?: PostTypeOpts
}

export const heightCoverPostList = 'min-h-[25vh]'
export const spacingCoverPostList = 'py-12'

export default function PageOfPostsListTemplate(props: PageOfPostsListTemplateProps) {
  return (
    <>
      <div
        className={cn('mx-auto flex w-full items-center justify-between', 'relative')}
      >
        {props.cover && (
          <div
            className={cn(
              'flex h-full w-full items-center overflow-hidden',
              'absolute left-0 top-0 h-full w-full'
            )}
          >
            <ImageComponent
              defaultImage={defaultFeaturedImage}
              image={{
                staticImageData: props.cover
              }}
              alt={`Hình ảnh đại diện cho trang ${props.title}`}
              className={cn('object-cover group-hover:scale-105 duration-500 w-full')}
              imageProps={{
                fill: true,
                priority: true
              }}
            />
          </div>
        )}
        <div
          className={cn(
            'flex items-center justify-center bg-[#0000005e] w-full z-10 py-16',
            heightCoverPostList,
            'bg-[linear-gradient(rgb(40,_42,_54),_rgb(50,_53,_65))]'
          )}
        >
          <Container maxWidthClass="max-w-5xl">
            <h2
              className="w-fit text-2xl md:text-3xl font-bold drop-shadow-sm"
            >
              {props.iconComponent && (
                <span className="mr-1 opacity-90 text-[#ff88c3]">{props.iconComponent}</span>
              )}
              <span className="thi-text-rainbow">{props.title}</span>
            </h2>
            {props.subtitle && (
              <div
                className="mt-2 text-base md:text-lg"
                style={{
                  color: props.titleColor ? props.titleColor : props.cover ? '#fff' : '#fff'
                }}
              >
                {props.subtitle}
              </div>
            )}
          </Container>
        </div>
      </div>
      <Container className={cn(spacingCoverPostList, 'max-w-5xl')}>
        {props.posts.length === 0 && (
          <div className="my-4 text-xl font-bold">Không tìm thấy bài viết</div>
        )}
        {props.posts.length > 0 && (
          <>
            {props.totalPages > 1 && props.uri && (
              <Pagination
                className="my-8"
                path={props.uri}
                total={props.totalPages}
                current={props.currentPage}
                pageAlias="trang"
              />
            )}
            <div>
              {props.posts.length > 0 && (
                <PostList
                  posts={props.posts}
                  postType="PostTitleCateDate"
                  postTypeOpts={
                    {
                      ...props.postTypeOpts,
                      ...defaultPostTypeOpts
                    } ?? {
                      hideCategory: true,
                      ...defaultPostTypeOpts
                    }
                  }
                />
              )}
            </div>
            {props.totalPages > 1 && props.uri && (
              <Pagination
                className="my-8"
                path={props.uri}
                total={props.totalPages}
                current={props.currentPage}
                pageAlias="trang"
              />
            )}
          </>
        )}
      </Container>
    </>
  )
}
