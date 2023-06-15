'use client'

import { getIndentLevelClass, getJoinedRichText } from '@app/lib/block-helpers'
import Mermaid from '@c/Mermaid'
import { CodeBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { defaultCodeLanguage } from '../../lib/config'
import BlockRichText from './BlockRichText'

export default function BlockCode(props: {
  block: CodeBlockObjectResponse
  level: number
  className?: string
}) {
  const { block, level, className } = props
  const language = block?.code?.language?.toLowerCase() || defaultCodeLanguage
  return (
    <div className={cn(getIndentLevelClass(level), className)}>
      <div className={`language-${formatCodeLang(language)} syntax-highlighter`}>
        <SyntaxHighlighter
          language={formatCodeLang(language)}
          style={dracula}
          className="syntax-highlighter-pre text-sm"
          showLineNumbers={true}
        >
          {/* We don't use <BlockRichText> because the package react-syntax-highlighter requires a string. */}
          {getJoinedRichText(block?.code?.rich_text)}
        </SyntaxHighlighter>
      </div>

      {block?.code?.caption && (
        <div className="italic opacity-60">
          {block?.code?.caption?.map((richText, index) => (
            <BlockRichText key={index} richText={richText} />
          ))}
        </div>
      )}

      {block?.code?.language === 'mermaid' && (
        <Mermaid chart={getJoinedRichText(block?.code?.rich_text)} />
      )}
    </div>
  )
}

/**
 * Convert the code language notation of the Notion api to the code language notation of react-syntax-highlighter.
 * https://developers.notion.com/reference/block#code-blocks
 * https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/
 */
const formatCodeLang = (lang: string) => {
  switch (lang) {
    case 'plain text':
      return 'plaintext'
    case 'objective-c':
      return 'objectivec'
    default:
      return lang
  }
}
