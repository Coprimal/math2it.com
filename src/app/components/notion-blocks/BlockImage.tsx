import { getIndentLevelClass, getJoinedRichText } from '@app/lib/block-helpers'
import { defaultBlurDataURL } from '@app/lib/config'
import { ImageBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import { get } from 'lodash'
import Image from 'next/image'

import BlockRichText from './BlockRichText'

export default function BlockImage(props: {
  block: ImageBlockObjectResponse
  level: number
  className?: string
}) {
  const { block, level, className } = props
  const imgUrl = get(block, 'image.file.url') || get(block, 'image.external.url')
  const width = get(block, 'imageInfo.img.width', 1000)
  const height = get(block, 'imageInfo.img.height', 700)
  const blurDataURL = get(block, 'imageInfo.base64', defaultBlurDataURL)
  const image = (
    <Image
      src={imgUrl!}
      alt={getJoinedRichText(block?.image?.caption)}
      width={width}
      height={height}
      blurDataURL={blurDataURL}
      placeholder="blur"
    />
  )
  const caption = block?.image?.caption
  return (
    <div
      className={cn(
        getIndentLevelClass(level),
        className,
        'flex flex-col justify-center items-center gap-2'
      )}
    >
      {imgUrl && <div className="relative flex w-full items-center justify-center">{image}</div>}
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
