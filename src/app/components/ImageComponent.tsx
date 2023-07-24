'use client'

import { defaultFeaturedImage } from '@app/lib/config'
import { ImageType } from '@src/interface'
import Image, { ImageProps } from 'next/image'

type ImageComponentProps = {
  image: ImageType
  alt?: string
  className?: string
  imageProps?: Partial<ImageProps>
}

/**
 * This component is used for all image-related purposes.
 * For example, featured images, book cover image, notion-block's images, etc.
 */
export default function ImageComponent(props: ImageComponentProps) {
  const image = props.image?.staticImageData ? (
    <Image
      alt={props.alt || 'Tên hình không xác định'}
      src={props.image.staticImageData}
      className={props.className}
      {...props.imageProps}
    />
  ) : props.image?.sourceUrl && props.image?.blurDataURL ? (
    <Image
      alt={props.alt || 'Tên hình không xác định'}
      src={props.image.sourceUrl}
      className={props.className}
      placeholder="blur"
      blurDataURL={props.image.blurDataURL}
      {...props.imageProps}
    />
  ) : (
    <Image
      alt={props.alt || 'Tên hình không xác định'}
      src={defaultFeaturedImage}
      className={props.className}
      {...props.imageProps}
    />
  )

  // // Don't use next/image for now
  // const url = props.image?.sourceUrl ?? 'https://i.imgur.com/ncYwGMO.jpeg'
  // const image = (
  //   // eslint-disable-next-line @next/next/no-img-element
  //   <img
  //     alt={props.alt || 'Tên hình không xác định'}
  //     src={url as any}
  //     className={props.className}
  //     {...props.imageProps}
  //   />
  // )

  return <>{image}</>
}
