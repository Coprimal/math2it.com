import { comfortaa } from '@app/lib/fonts'
import { Post } from '@src/interface'
import cn from 'classnames'
import Link from 'next/link'

import PostFeaturedImage from '../PostFeaturedImage'

type PostImageBackgroundProps = {
  post: Post
}

export default function PostImageBackground({ post }: PostImageBackgroundProps) {
  const { title, featuredImage, categories, uri } = post
  return (
    <div className="group overflow-hidden rounded-md shadow-lg">
      <Link className={cn(comfortaa.className, 'text-center')} href={uri || '/'}>
        <div className="flex flex-col justify-center">
          <div className="relative h-36 w-full overflow-hidden mix-blend-overlay">
            <PostFeaturedImage
              featuredImage={featuredImage}
              categories={categories}
              title={title}
              blurDataURL={featuredImage?.blurDataURL}
            />
            <div
              className={cn(
                'absolute bottom-0 left-0 flex h-fit w-full flex-col justify-end',
                'bg-gradient-to-t from-gray-900 to-transparent p-4 pt-6 text-sm font-bold',
                'leading-5 text-white duration-300 hover:from-black hover:to-transparent'
              )}
            >
              {title}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
