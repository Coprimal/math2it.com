'use client'

import PostCardWhiteBg, { PostCardWhiteBgOpts } from '@c/post-types/PostCardWhiteBg'
import PostCardWhiteBgBig, { PostCardWhiteBgBigOpts } from '@c/post-types/PostCardWhiteBgBig'
import PostImageBackground from '@c/post-types/PostImageBackground'
import PostTitleCateDate, { PostTitleCateDateOpts } from '@c/post-types/PostTitleCateDate'
import { Post } from '@src/interface'
import React from 'react'

import { Carousel, CarouselItem } from './Carousel'
import { PostListStyle } from './PostListForHomeSection'
import { postListGridCLass } from './SkeletonPostList'

export type PostType =
  | 'PostTitleCateDate'
  | 'PostCardWhiteBg'
  | 'PostCardWhiteBgBig'
  | 'PostImageBackground'
export type PostTypeOpts = PostTitleCateDateOpts | PostCardWhiteBgOpts | PostCardWhiteBgBigOpts
type PostListProps = {
  listStyle?: PostListStyle
  posts: Post[]
  postType: PostType
  postTypeOpts?: PostTypeOpts
  options?: {
    className?: string
  }
}

export default function PostList(props: PostListProps) {
  const className = props.options?.className ? props.options.className : postListGridCLass
  return (
    <section>
      {(!props.listStyle || props.listStyle === 'default') && (
        <div className={className}>
          {props.posts.map(post => (
            <React.Fragment key={post.uri}>
              {getPostTypeElement(props.postType, post, props.postTypeOpts)}
            </React.Fragment>
          ))}
        </div>
      )}
      {props.listStyle === 'carousel' && (
        <Carousel
          items={props.posts}
          renderItem={({ item, isSnapPoint }) => (
            <CarouselItem key={item.id} isSnapPoint={isSnapPoint} widthClass={'w-80'}>
              {getPostTypeElement(props.postType, item, props.postTypeOpts)}
            </CarouselItem>
          )}
        />
      )}
    </section>
  )
}

function getPostTypeElement(postType: PostType, post: Post, postTypeOpts?: PostTypeOpts) {
  switch (postType) {
    case 'PostTitleCateDate':
      return <PostTitleCateDate post={post} options={postTypeOpts} />
    case 'PostCardWhiteBg':
      return <PostCardWhiteBg post={post} options={postTypeOpts} />
    case 'PostCardWhiteBgBig':
      return <PostCardWhiteBgBig post={post} options={postTypeOpts} />
    case 'PostImageBackground':
      return <PostImageBackground post={post} />
  }
}
