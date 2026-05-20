'use client'

import cn from 'classnames'
import React from 'react'

import { Post, PostType, PostTypeOpts, CommonPostTypeOpts } from '../../types/notion'
import PostBlogSimple from './post-types/PostBlogSimple'
import PostCardWave from './post-types/PostCardWave'
import PostCardWhiteBg from './post-types/PostCardWhiteBg'
import PostCardWhiteBgBig from './post-types/PostCardWhiteBgBig'
import PostImageBackground from './post-types/PostImageBackground'
import PostSimple from './post-types/PostSimple'
import PostTitleCateDate from './post-types/PostTitleCateDate'
import { Carousel, CarouselItem } from './Carousel'

export type { PostType, PostTypeOpts, CommonPostTypeOpts }

export type PostListStyle = 'default' | 'carousel'

type PostListProps = {
  className?: string
  listStyle?: PostListStyle
  posts: Post[]
  postType: PostType
  postTypeOpts?: PostTypeOpts
  options?: {
    className?: string
  }
  fontClassName?: string
}

export const postListGridCLass = cn(
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 sm:gap-x-4'
)

export default function PostList(props: PostListProps) {
  return (
    <section className={props.className}>
      {(!props.listStyle || props.listStyle === 'default') && (
        <div className={props.options?.className || postListGridCLass}>
          {props.posts.map((post, index) => (
            <React.Fragment key={post.uri}>
              {getPostTypeElement(props.postType, post, props.postTypeOpts, index)}
            </React.Fragment>
          ))}
        </div>
      )}
      {props.listStyle === 'carousel' && (
        <Carousel
          items={props.posts}
          renderItem={({ item, isSnapPoint, index }) => (
            <CarouselItem key={item.id} isSnapPoint={isSnapPoint} widthClass={'w-80'}>
              {getPostTypeElement(props.postType, item, props.postTypeOpts, index)}
            </CarouselItem>
          )}
        />
      )}
    </section>
  )
}

function getPostTypeElement(
  postType: PostType,
  post: Post,
  postTypeOpts?: PostTypeOpts,
  index?: number
) {
  switch (postType) {
    case 'PostTitleCateDate':
      return <PostTitleCateDate post={post} options={postTypeOpts} />
    case 'PostCardWhiteBg':
      return <PostCardWhiteBg post={post} options={postTypeOpts} />
    case 'PostCardWhiteBgBig':
      return <PostCardWhiteBgBig post={post} options={postTypeOpts} />
    case 'PostImageBackground':
      return <PostImageBackground post={post} options={postTypeOpts} />
    case 'PostCardWave':
      return <PostCardWave post={post} options={{ ...postTypeOpts, colorIndex: index }} />
    case 'PostSimple':
      return <PostSimple post={post} options={postTypeOpts} />
    case 'PostBlogSimple':
      return <PostBlogSimple post={post} options={{ ...postTypeOpts, colorIndex: index }} />
  }
}
