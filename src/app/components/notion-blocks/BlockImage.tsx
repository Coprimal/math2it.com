'use client'

import { getIndentLevelClass, getJoinedRichText } from '@app/lib/block-helpers'
import { defaultBlurDataURL } from '@app/lib/config'
import { ImageBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import { get } from 'lodash'
import mediumZoom from 'medium-zoom'
import Image from 'next/image'
import { useRef, useState } from 'react'

import BlockRichText from './BlockRichText'

export default function BlockImage(props: {
  block: ImageBlockObjectResponse & {
    imageInfo?: { width: number; height: number }
    imgUrl?: string
  }
  level: number
  className?: string
}) {
  const imageRef = useRef(undefined)
  const [isImageReady, setIsImageReady] = useState(false)
  const { block, level, className } = props
  const width = Math.min(get(block, 'imageInfo.width', 1000), 1000)
  const height = Math.min(get(block, 'imageInfo.height', 700), 700)
  const blurDataURL = get(block, 'imageInfo.base64', defaultBlurDataURL)
  const caption = block?.image?.caption

  const openZoomableImage = () => {
    const zoom = mediumZoom('[data-zoomable]')
    if (imageRef.current) zoom.open({ target: imageRef.current })
  }

  return (
    <div
      className={cn(
        getIndentLevelClass(level),
        className,
        'flex flex-col justify-center items-center gap-2'
      )}
    >
      {block.imgUrl && (
        <div className="relative flex w-full items-center justify-center overflow-hidden">
          <Image
            className={cn({
              'blur-lg': !isImageReady,
              'blur-0': isImageReady
            })}
            src={block.imgUrl}
            alt={getJoinedRichText(block?.image?.caption)}
            width={width}
            height={height}
            blurDataURL={blurDataURL}
            placeholder="blur"
            onLoadingComplete={() => setIsImageReady(true)}
            data-zoomable
            onClick={openZoomableImage}
            ref={imageRef}
          />
        </div>
      )}
      {caption && caption.length > 0 && (
        <div className="text-sm italic opacity-90">
          {caption.map((richText, index) => (
            <BlockRichText key={index} richText={richText} />
          ))}
        </div>
      )}
    </div>
  )
}
