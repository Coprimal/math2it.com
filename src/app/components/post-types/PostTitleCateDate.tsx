import { defaultCategoryBgColor, defaultCategoryTextColor } from '@app/lib/config'
import { comfortaa } from '@app/lib/fonts'
import { Post } from '@src/interface'
import cn from 'classnames'
import Link from 'next/link'

import Date from '../Date'
import PostFeaturedImage from '../PostFeaturedImage'

export type PostTitleCateDateOpts = {
  hideCategory?: boolean
  hideDate?: boolean
}

type PostTitleCateDateProps = {
  post: Post
  options?: PostTitleCateDateOpts
}

export default function PostTitleCateDate({ post, options }: PostTitleCateDateProps) {
  const { title, featuredImage, date, categories, uri } = post
  const category = categories ? categories[0] : null
  return (
    <div className="group">
      <Link className={cn(comfortaa.className, 'text-center')} href={uri || '/'}>
        <div
          className={cn('flex flex-col justify-center overflow-hidden rounded-t-md shadow-sm', {
            'rounded-b-md': !category || options?.hideCategory
          })}
        >
          <div className="relative h-28 w-full overflow-hidden">
            <PostFeaturedImage
              featuredImage={featuredImage}
              categories={categories}
              title={title}
              blurDataURL={featuredImage?.blurDataURL}
            />
          </div>
          {!options?.hideCategory && category && (
            <div
              style={{
                backgroundColor: `${category.style?.bgColor || defaultCategoryBgColor}`,
                color: `${category.style?.textColor || defaultCategoryTextColor}`
              }}
              className="rounded-b-md px-2 py-1 text-xs font-bold"
            >
              {category?.name}
            </div>
          )}
        </div>
        <div className={'group-hover:m2it-link-hover p-2 text-base font-bold'}>{title}</div>
        {!options?.hideDate && (
          <div className="text-sm opacity-80">
            <i className="icon-clock mr-1"></i>
            {date && <Date dateString={date} />}
          </div>
        )}
      </Link>
    </div>
  )
}
