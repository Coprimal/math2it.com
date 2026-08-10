'use client'

import * as React from 'react'

import { defaultKatexSettings, renderKatexToString } from '../lib/katex'
import { cs } from '../lib/utils'

type KatexProps = {
  math: string
  block?: boolean
  className?: string
  settings?: Parameters<typeof renderKatexToString>[1]
}

/**
 * Drop-in replacement for @matejmazur/react-katex that suppresses KaTeX's
 * "No character metrics" warnings for unsupported Unicode (e.g. Vietnamese).
 */
export default function Katex({ math, block = false, className, settings }: KatexProps) {
  const html = React.useMemo(() => {
    try {
      return renderKatexToString(math, {
        ...defaultKatexSettings,
        ...settings,
        displayMode: block
      })
    } catch (error) {
      if (error instanceof Error) {
        return error.message
      }
      return 'Invalid equation'
    }
  }, [math, block, settings])

  return (
    <span
      className={cs(className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
