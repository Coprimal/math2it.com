import Container from '@c/Container'
import ImageComponent from '@notion-x/src/components/ImageComponent'
import Pagination from '@notion-x/src/components/Pagination'
import PostList, { PostTypeOpts } from '@notion-x/src/components/PostsList'
import { Post } from '@notion-x/src/interface'
import cn from 'classnames'
import { StaticImageData } from 'next/image'
import { useGeoPattern } from 'react-geopattern'

import { defaultFeaturedImage, defaultPostTypeOpts } from '../lib/config'

type PageOfPostsListTemplateProps = {
  title: string
  subtitle?: string | null
  uri?: string
  posts: Post[]
  totalPages: number
  currentPage: number
  iconComponent?: React.ReactNode
  patternColor?: string
  titleColor?: string
  cover?: StaticImageData
  postTypeOpts?: PostTypeOpts
}

export const heightCoverPostList = 'min-h-[25vh]'
export const spacingCoverPostList = 'py-12'

export default function PageOfPostsListTemplate(props: PageOfPostsListTemplateProps) {
  const pattern = useGeoPattern(props.title, {
    color: props.patternColor
  })

  return (
    <>
      <div
        className={cn('mx-auto flex w-full items-center justify-between', 'relative')}
        style={props.cover ? undefined : { backgroundImage: pattern.toDataUrl() }}
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
            'flex items-center justify-center',
            'bg-[#0000005e] w-full z-10 py-10',
            heightCoverPostList
          )}
        >
          <Container maxWidthClass="max-w-5xl">
            <h2
              className="w-fit text-2xl md:text-3xl font-bold drop-shadow-sm"
              style={{ color: props.titleColor ? props.titleColor : props.cover ? '#fff' : '#fff' }}
            >
              {props.iconComponent && (
                <span className="mr-1 opacity-90">{props.iconComponent}</span>
              )}
              {props.title}
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
