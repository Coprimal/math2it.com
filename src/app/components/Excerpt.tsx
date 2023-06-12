import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints'

import { defaultPostExcerpt } from '../lib/config'
import BlockRichText from './notion-blocks/BlockRichText'

type ExcerptProps = {
  excerpt: RichTextItemResponse[]
}

export default function Excerpt(props: ExcerptProps) {
  if (!props.excerpt || !props.excerpt.length) return <span>{defaultPostExcerpt}</span>

  return (
    <span>
      {props.excerpt.map((richText, index) => (
        <BlockRichText key={index} richText={richText} ignore={['hyperlink']} />
      ))}
    </span>
  )
}
