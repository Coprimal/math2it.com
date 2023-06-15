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
      <div className={cn('flex gap-2 p-4 rounded-md', mapColorClass(block?.callout?.color))}>
        {get(block, 'callout.icon.emoji') && (
          <div className="text-2xl">{get(block, 'callout.icon.emoji')}</div>
        )}
        <div>
          {block?.callout?.rich_text.map((richText, index) => (
            <BlockRichText key={index} richText={richText} />
          ))}
          {children}
        </div>
      </div>
    </div>
  )
}
