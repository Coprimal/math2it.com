'use client'

import { ImageType } from '@src/interface'
import cn from 'classnames'

import ImageComponent from './ImageComponent'

type PostFeaturedImageProps = {
  title: string
  featuredImage: ImageType
}

/**
 * This component is used for displaying featured image of a post IN A POST LIST ONLY.
 */
export default function PostFeaturedImage(props: PostFeaturedImageProps) {
  const { title, featuredImage } = props
  return (
    <>
      <div className="relative flex h-full w-full items-center overflow-hidden">
        <ImageComponent
          image={featuredImage}
          alt={`Hình đại diện cho bài viết "${title}"`}
          className={cn('object-cover')}
          imageProps={{
            fill: true
          }}
        />
      </div>
    </>
  )
}
