import PostCardWhiteBg, { PostCardWhiteBgOpts } from '@c/post-types/PostCardWhiteBg'
import PostCardWhiteBgBig, { PostCardWhiteBgBigOpts } from '@c/post-types/PostCardWhiteBgBig'
import PostImageBackground from '@c/post-types/PostImageBackground'
import PostTitleCateDate, { PostTitleCateDateOpts } from '@c/post-types/PostTitleCateDate'
import { Post } from '@src/interface'
import React from 'react'

export type PostType =
  | 'PostTitleCateDate'
  | 'PostCardWhiteBg'
  | 'PostCardWhiteBgBig'
  | 'PostImageBackground'
export type PostTypeOpts = PostTitleCateDateOpts | PostCardWhiteBgOpts | PostCardWhiteBgBigOpts
type PostListProps = {
  posts: Post[]
  postType: PostType
  postTypeOpts?: PostTypeOpts
  options?: {
    className?: string
  }
}

export const postListGridCLass =
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-x-4'

export default function PostList({ posts, postType, postTypeOpts, options }: PostListProps) {
  const className = options?.className ? options.className : postListGridCLass
  return (
    <section>
      <div className={className}>
        {posts.map(post => (
          <React.Fragment key={post.uri}>
            {getPostTypeElement(postType, post, postTypeOpts)}
          </React.Fragment>
        ))}
      </div>
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
