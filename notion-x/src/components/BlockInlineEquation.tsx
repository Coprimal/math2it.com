'use client'

import { EquationRichTextItemResponse } from '@notionhq/client/build/src/api-endpoints'
import React from 'react'

import { generateTextAnnotationClasses } from '../lib/helpers'
import Katex from './Katex'

type BlockInlineEquationProps = {
  equation: EquationRichTextItemResponse
  fontSize?: string
}

export default function BlockInlineEquation(props: BlockInlineEquationProps) {
  return (
    <span className={generateTextAnnotationClasses(props.equation.annotations)}>
      <Katex
        className={props.fontSize ?? 'text-base'}
        math={props.equation.plain_text}
      />
    </span>
  )
}
