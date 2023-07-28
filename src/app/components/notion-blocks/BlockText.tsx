import { generateTextAnnotationClasses } from '@app/lib/block-helpers'
import {
  MentionRichTextItemResponse,
  TextRichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints'
import { AnnotationIgnoreField, TextIgnoreField } from '@src/interface'
import cn from 'classnames'
import { get } from 'lodash'
import Link from 'next/link'
import React from 'react'

import { getSlugPrefix } from '../../lib/config'

type TextProps = {
  richText: TextRichTextItemResponse | MentionRichTextItemResponse
  ignore?: TextIgnoreField[]
}

export default function BlockText(props: TextProps) {
  if (props.richText.plain_text.includes('\n')) {
    const lines = props.richText.plain_text.split('\n')
    return (
      <>
        {lines.map((line, index) => (
          <span key={index}>
            {line}
            {index !== lines.length - 1 && <br />}
          </span>
        ))}
      </>
    )
  }

  // Hyperlink
  if (
    props.richText.type === 'text' &&
    !props.ignore?.includes('hyperlink') &&
    props.richText.href
  ) {
    // Link contains "https://math2it.com"
    if (props.richText.href.includes('math2it.com')) {
      const slug = getSlugFromUrl(props.richText.href)
      return (
        <Link
          className={generateTextAnnotationClasses(
            props.richText.annotations,
            props.ignore as AnnotationIgnoreField[]
          )}
          href={`/${getSlugPrefix('singlePost')}/${slug}/`}
        >
          {props.richText.plain_text}
        </Link>
      )
    } else {
      return (
        <a
          className={cn(
            'm2it-link',
            generateTextAnnotationClasses(
              props.richText.annotations,
              props.ignore as AnnotationIgnoreField[]
            )
          )}
          href={props.richText.href}
          target="_blank"
        >
          {props.richText.plain_text}
        </a>
      )
    }
  }

  // Mention
  if (
    !props.ignore?.includes('hyperlink') &&
    props.richText.type === 'mention' &&
    props.richText.mention?.type === 'page' &&
    get(props.richText, 'mention.page.uri') // "uri" is a custom property defined by Math2IT
  ) {
    return (
      <Link
        className={generateTextAnnotationClasses(
          props.richText.annotations,
          props.ignore as AnnotationIgnoreField[]
        )}
        href={get(props.richText, 'mention.page.uri', '/')}
      >
        {props.richText.plain_text}
      </Link>
    )
  }

  const noDecoration =
    !props.richText.annotations.bold &&
    !props.richText.annotations.italic &&
    !props.richText.annotations.underline &&
    !props.richText.annotations.strikethrough &&
    !props.richText.annotations.code &&
    props.richText.annotations.color === 'default' &&
    !props.richText.href

  if (noDecoration) return props.richText.plain_text

  return (
    <span
      className={generateTextAnnotationClasses(
        props.richText.annotations,
        props.ignore as AnnotationIgnoreField[]
      )}
    >
      {props.richText.plain_text}
    </span>
  )
}

function getSlugFromUrl(url: string) {
  // Remove the protocol (http:// or https://)
  const withoutProtocol = url.replace(/^(https?:\/\/)/, '')

  // Remove "www" if present
  const withoutWWW = withoutProtocol.replace(/^www\./, '')

  // Remove trailing slashes
  const withoutTrailingSlashes = withoutWWW.replace(/\/+$/, '')

  // Extract the slug from the remaining URL
  const parts = withoutTrailingSlashes.split('/')
  const slug = parts[parts.length - 1]

  return slug
}
