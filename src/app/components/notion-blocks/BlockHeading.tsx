import { convertHeadingIdToSlug, getIndentLevelClass, mapColorClass } from '@app/lib/block-helpers'
import {
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  RichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import { get } from 'lodash'
import { RiHashtag } from 'react-icons/ri'

import BlockHeadingToggle from './BlockHeadingToggle'
import BlockRichText from './BlockRichText'

type headingType = 'h1' | 'h2' | 'h3'

export default function BlockHeading(props: {
  type: headingType
  block: Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse
  level: number
  children: React.ReactNode
  className?: string
}) {
  const { type, block, level, className, children } = props
  let heading: { rich_text: RichTextItemResponse[]; color: string }
  let headingElement: JSX.Element
  const h1Size = 'text-3xl'
  const h2Size = 'text-2xl'
  const h3Size = 'text-xl'
  const headingClass = 'scroll-mt-[70px] mt-0'

  const id = convertHeadingIdToSlug(block.id, (block as any)[`${block.type}`]?.rich_text)

  switch (type) {
    case 'h1':
      heading = (block as Heading1BlockObjectResponse)?.heading_1
      headingElement = (
        <h1 id={id} className={cn(h1Size, headingClass)}>
          {insideHeading(heading)}
        </h1>
      )
      break

    case 'h2':
      heading = (block as Heading2BlockObjectResponse)?.heading_2
      headingElement = (
        <h2 id={id} className={cn(h2Size, headingClass)}>
          {insideHeading(heading)}
        </h2>
      )
      break

    case 'h3':
      heading = (block as Heading3BlockObjectResponse)?.heading_3
      headingElement = (
        <h3 id={id} className={cn(h3Size, headingClass)}>
          {insideHeading(heading)}
        </h3>
      )
      break
  }

  return (
    <div className={cn(getIndentLevelClass(level))}>
      <div className={cn(mapColorClass(heading?.color), className, 'flex items-start gap-2')}>
        <a href={`#${id}`} className="text-sky-600 mt-[5px]">
          <RiHashtag className="text-2xl" />
        </a>
        {get(heading, 'is_toggleable') && (
          <BlockHeadingToggle headingElement={headingElement}>{children}</BlockHeadingToggle>
        )}
        {!get(heading, 'is_toggleable') && headingElement}
      </div>
    </div>
  )
}

function insideHeading(heading: { rich_text: RichTextItemResponse[] }): JSX.Element {
  return (
    <>
      {heading?.rich_text.map((richText, index) => (
        <BlockRichText key={index} richText={richText} />
      ))}
    </>
  )
}
