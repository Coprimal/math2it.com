'use client'

import { defaultFeaturedImage } from '@app/lib/config'
import { FeaturedImage } from '@src/interface'
import cn from 'classnames'
import Image from 'next/image'
import { useState } from 'react'

type PostFeaturedImageProps = {
  title: string
  featuredImage?: FeaturedImage
  imgCustomClasses?: string
}

/**
 * This component is used for displaying featured image of a post IN A POST LIST ONLY.
 */
export default function PostFeaturedImage(props: PostFeaturedImageProps) {
  const { title, featuredImage, imgCustomClasses } = props
  const [isImageReady, setIsImageReady] = useState(false)

  const alt = `Hình đại diện cho bài viết ${title}`
  const imageClassName = cn('object-cover group-hover:scale-105 duration-500', imgCustomClasses)

  const image = featuredImage?.staticImageData ? (
    <Image
      alt={alt}
      src={featuredImage.staticImageData}
      className={imageClassName}
      onLoadingComplete={() => setIsImageReady(true)}
    />
  ) : featuredImage?.sourceUrl && featuredImage.blurDataURL ? (
    <Image
      alt={alt}
      src={featuredImage.sourceUrl}
      className={imageClassName}
      fill={true}
      placeholder="blur"
      blurDataURL={featuredImage.blurDataURL}
      onLoadingComplete={() => setIsImageReady(true)}
    />
  ) : (
    <Image
      alt={alt}
      src={defaultFeaturedImage}
      className={imageClassName}
      onLoadingComplete={() => setIsImageReady(true)}
    />
  )

  return (
    <>
      <div className="relative flex h-full w-full items-center overflow-hidden">
        {image}
        {!isImageReady && (
          <div className="absolute left-0 top-0 h-full w-full">
            <div className="relative h-full w-full animate-pulse rounded-lg bg-slate-200">
              <div
                className={cn(
                  'absolute -left-5 -top-5 z-20 aspect-square h-[150px] scale-[0.4] animate-wave bg-math2it'
                )}
              ></div>
              <div className="bg-wave absolute bottom-0 left-0 z-10 h-2/5 w-full"></div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
