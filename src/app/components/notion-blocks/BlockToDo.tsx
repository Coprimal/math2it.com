import { getIndentLevelClass } from '@app/lib/block-helpers'
import { ToDoBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import { BsCheckSquare, BsSquare } from 'react-icons/bs'

import BlockRichText from './BlockRichText'

export default function BlockToDo(props: {
  block: ToDoBlockObjectResponse
  level: number
  children?: React.ReactNode
  className?: string
}) {
  const { block, level, className, children } = props
  return (
    <div className={cn(getIndentLevelClass(level), className)}>
      <div className="flex items-center gap-2">
        {block?.to_do?.checked && <BsCheckSquare />}
        {!block?.to_do?.checked && <BsSquare />}
        {block?.to_do?.rich_text.map((richText, index) => (
          <BlockRichText key={index} richText={richText} />
        ))}
      </div>
      {children}
    </div>
  )
}
