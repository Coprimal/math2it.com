'use client'

import { postCoverCustomSizeFM } from '@app/lib/config'
import defaultFeaturedImage from '@root/public/featured-images/default_bg.png'
import { Category, FeaturedImage } from '@src/interface'
import cn from 'classnames'
import Image from 'next/image'
import { useState } from 'react'

type PostFeaturedImageProps = {
  title: string
  featuredImage?: FeaturedImage
  blurDataURL?: string
  categories?: Category[]
  imgCustomClasses?: string
  hideLoading?: boolean
}

/**
 * This component is used for displaying featured image of a post IN A POST LIST ONLY.
 */
export default function PostFeaturedImage(props: PostFeaturedImageProps) {
  const { title, featuredImage, blurDataURL, categories, imgCustomClasses, hideLoading } = props
  const [isImageReady, setIsImageReady] = useState(false)

  const alt = `Hình đại diện cho bài viết ${title}`
  const imageClassName = cn('object-cover group-hover:scale-105 duration-500', imgCustomClasses, {
    'scale-110 blur-2xl grayscale': !isImageReady,
    'scale-100 blur-0 grayscale-0': isImageReady
  })

  let externalImgSrc: string | null = null
  const category = categories ? categories[0] : null
  if (featuredImage?.sourceUrl) {
    externalImgSrc = featuredImage?.sourceUrl || null
  } else if (category?.featureImage) {
    externalImgSrc = category?.featureImage?.sourceUrl || null
  }
  const placeholderToUse = blurDataURL ? 'blur' : 'empty'
  const blurDataURLToUse = blurDataURL ? blurDataURL : undefined
  const usedSizes = postCoverCustomSizeFM

  const image = externalImgSrc ? (
    // For external images, we should give the image a width and height or sizes
    <Image
      alt={alt}
      src={externalImgSrc}
      className={imageClassName}
      fill={true}
      sizes={usedSizes}
      placeholder={placeholderToUse}
      blurDataURL={blurDataURLToUse}
      onLoadingComplete={() => setIsImageReady(true)}
      quality={75}
      loading="lazy"
    />
  ) : (
    <Image
      alt={alt}
      src={defaultFeaturedImage}
      className={imageClassName}
      sizes={usedSizes}
      onLoadingComplete={() => setIsImageReady(true)}
      loading="lazy"
    />
  )

  return (
    <>
      <div className="relative flex h-full w-full items-center overflow-hidden">
        {image}
        {!isImageReady && !blurDataURL && !hideLoading && (
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
