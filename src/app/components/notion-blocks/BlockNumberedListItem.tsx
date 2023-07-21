import { getIndentLevelClass } from '@app/lib/block-helpers'
import { NumberedListItemBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'

import BlockRichText from './BlockRichText'

export type BlockNumberedListItemType = NumberedListItemBlockObjectResponse & { list_item: number }

export default function BlockNumberedListItem(props: {
  block: BlockNumberedListItemType
  level: number
  children?: React.ReactNode
  className?: string
}) {
  const { block, level, className, children } = props
  return (
    <div
      className={cn(
        getIndentLevelClass(level),
        className,
        `before:content-['${block['list_item']}']`,
        'before:mr-2',
        'pl-[1.5rem] before:ml-[-1.5rem]'
      )}
    >
      {block?.numbered_list_item?.rich_text.map((richText, index) => (
        <BlockRichText key={index} richText={richText} />
      ))}
      <div className="-ml-4">{children}</div>
    </div>
  )
}
