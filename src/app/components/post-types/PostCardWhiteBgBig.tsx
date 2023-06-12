import { comfortaa } from '@app/lib/fonts'
import { Post } from '@src/interface'
import cn from 'classnames'
import Link from 'next/link'

import Date from '../Date'
import Excerpt from '../Excerpt'
import PostFeaturedImage from '../PostFeaturedImage'

export type PostCardWhiteBgBigOpts = {
  hideDate?: boolean
  hideAuthor?: boolean
  hideExcerpt?: boolean
}

type PostTitleCateDateProps = {
  post: Post
  options?: PostCardWhiteBgBigOpts
}

export default function PostCardWhiteBgBig({ post, options }: PostTitleCateDateProps) {
  const { title, featuredImage, date, categories, uri, excerpt, authors } = post
  return (
    <div className="group overflow-hidden rounded-md bg-white shadow-lg">
      <Link className={cn(comfortaa.className, 'text-center')} href={uri || '/'}>
        <div className="flex flex-col justify-center">
          <div className="relative h-36 w-full overflow-hidden ">
            <PostFeaturedImage
              featuredImage={featuredImage}
              categories={categories}
              title={title}
              blurDataURL={featuredImage?.blurDataURL}
            />
          </div>
        </div>
        <div className="p-4">
          <div className="group-hover:m2it-link-hover text-lg font-bold">{title}</div>
          {(!options?.hideDate || !options?.hideAuthor) && (
            <div className="flex justify-center gap-2 p-2">
              {!options?.hideDate && date && (
                <div className="text-sm opacity-80">
                  <i className="icon-clock mr-1"></i>
                  <Date dateString={date} />
                </div>
              )}
              {!options?.hideAuthor && authors?.length && (
                <div className="flex gap-1 text-sm opacity-80">
                  {authors?.length > 1 && (
                    <>
                      <i className="icon-users-outline"></i>
                      <span>Nhiều tác giả</span>
                    </>
                  )}
                  {authors?.length <= 1 && (
                    <>
                      <i className="icon-user-outline -mr-1"></i>
                      <span>{authors[0].name}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {!options?.hideExcerpt && excerpt && (
            <div className="p-2 text-sm opacity-80">
              <Excerpt excerpt={excerpt}></Excerpt>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
