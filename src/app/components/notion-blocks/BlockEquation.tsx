'use client'

import { getIndentLevelClass } from '@app/lib/block-helpers'
import Katex from '@matejmazur/react-katex'
import { EquationBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'

export const mathFontSize = 'text-base'

export default function BlockEquation(props: {
  block: EquationBlockObjectResponse
  level: number
  className?: string
}) {
  const { block, level, className } = props
  return (
    <div
      className={cn(
        getIndentLevelClass(level),
        className,
        'text-center overflow-auto md:overflow-visible'
      )}
    >
      <Katex
        className={mathFontSize}
        math={block?.equation?.expression}
        settings={{
          throwOnError: false,
          strict: false
        }}
        block
      />
    </div>
  )
}
