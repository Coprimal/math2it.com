import { getIndentLevelClass, mapColorClass } from '@app/lib/block-helpers'
import { CalloutBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import { get } from 'lodash'

import BlockRichText from './BlockRichText'

export default function BlockCallout(props: {
  block: CalloutBlockObjectResponse
  level: number
  children: React.ReactNode
  className?: string
}) {
  const { block, level, children, className } = props
  return (
    <div className={cn(getIndentLevelClass(level), className)}>
      <div className={cn('flex rounded-md', mapColorClass(block?.callout?.color))}>
        {get(block, 'callout.icon.emoji') && (
          <div className="text-2xl pl-4 pr-2 py-3">{get(block, 'callout.icon.emoji')}</div>
        )}
        <div className="pt-4 pl-2 pr-4 pb-1 w-full">
          {block?.callout?.rich_text.map((richText, index) => (
            <BlockRichText key={index} richText={richText} />
          ))}
          <div className="-ml-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
