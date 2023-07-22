import {
  BlockObjectResponse,
  BookmarkBlockObjectResponse
} from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import { get } from 'lodash'
import dynamic from 'next/dynamic'

import { BookmarkPreview } from '../../interface'
import BlockBookmark from './notion-blocks/BlockBookmark'
import BlockBulletedListItem, {
  BlockBulletedListItemType
} from './notion-blocks/BlockBulletedListItem'
import BlockCallout from './notion-blocks/BlockCallout'
import BlockColumnList, { BlockColumnListType } from './notion-blocks/BlockColumnList'
import BlockHeading from './notion-blocks/BlockHeading'
import BlockNumberedListItem, {
  BlockNumberedListItemType
} from './notion-blocks/BlockNumberedListItem'
import BlockParagraph from './notion-blocks/BlockParagraph'
import BlockQuote from './notion-blocks/BlockQuote'
import { BlockTableType } from './notion-blocks/BlockTable'
import BlockToDo from './notion-blocks/BlockToDo'
import BlockToggle from './notion-blocks/BlockToggle'

const DynamicImage = dynamic(() => import('./notion-blocks/BlockImage'))
const DynamicCode = dynamic(() => import('./notion-blocks/BlockCode'))
const DynamicEquation = dynamic(() => import('./notion-blocks/BlockEquation'))
const DynamicTable = dynamic(() => import('./notion-blocks/BlockTable'))
const DynamicVideo = dynamic(() => import('./notion-blocks/BlockVideo'))

export default function BlockRender(props: { block: BlockObjectResponse; level: number }) {
  const { block, level } = props
  let children: React.ReactNode

  if (block.has_children) {
    children = get(block, 'children', [])?.map(childBlock => (
      <BlockRender
        key={(childBlock as BlockObjectResponse).id}
        block={childBlock}
        level={level + 1}
      />
    ))
  }

  const basicBlockGap = 'my-4'
  const basicBlockGapList = 'my-2'
  const basicBlockGapHeading = 'mt-6'

  switch (block.type) {
    case 'paragraph':
      return (
        <BlockParagraph block={block} level={level} className={cn(basicBlockGap)}>
          {children}
        </BlockParagraph>
      )

    case 'numbered_list_item':
      return (
        <BlockNumberedListItem
          block={block as BlockNumberedListItemType}
          level={level}
          className={cn(basicBlockGapList)}
        >
          {children}
        </BlockNumberedListItem>
      )

    case 'bulleted_list_item':
      return (
        <BlockBulletedListItem
          block={block as BlockBulletedListItemType}
          level={level}
          className={cn(basicBlockGapList)}
        >
          {children}
        </BlockBulletedListItem>
      )

    case 'to_do':
      return (
        <BlockToDo block={block} level={level} className={cn(basicBlockGapList)}>
          {children}
        </BlockToDo>
      )

    case 'heading_1':
      return (
        <BlockHeading
          type={'h1'}
          block={block}
          level={level}
          className={cn(basicBlockGap, basicBlockGapHeading)}
        >
          {children}
        </BlockHeading>
      )

    case 'heading_2':
      return (
        <BlockHeading
          type={'h2'}
          block={block}
          level={level}
          className={cn(basicBlockGap, basicBlockGapHeading)}
        >
          {children}
        </BlockHeading>
      )

    case 'heading_3':
      return (
        <BlockHeading
          type={'h3'}
          block={block}
          level={level}
          className={cn(basicBlockGap, basicBlockGapHeading)}
        >
          {children}
        </BlockHeading>
      )

    case 'quote':
      return (
        <BlockQuote block={block} level={level} className={cn(basicBlockGap)}>
          {children}
        </BlockQuote>
      )

    // For both code and mermaid
    case 'code':
      return <DynamicCode block={block} level={level} className={cn(basicBlockGap)} />

    case 'equation':
      return <DynamicEquation block={block} level={level} className={cn(basicBlockGap)} />

    case 'column_list':
      return <BlockColumnList block={block as BlockColumnListType} className={cn(basicBlockGap)} />

    case 'table':
      return (
        <DynamicTable block={block as BlockTableType} level={level} className={cn(basicBlockGap)} />
      )

    case 'toggle':
      return (
        <BlockToggle block={block} level={level} className={cn(basicBlockGap)}>
          {children}
        </BlockToggle>
      )

    case 'callout':
      return (
        <BlockCallout block={block} level={level} className={cn(basicBlockGap)}>
          {children}
        </BlockCallout>
      )

    case 'image':
      return <DynamicImage block={block} level={level} className={cn(basicBlockGap)} />

    case 'video':
      return <DynamicVideo block={block} className={cn(basicBlockGap)} />

    case 'bookmark':
      return (
        <BlockBookmark
          block={
            block as BookmarkBlockObjectResponse & {
              bookmark?: BookmarkPreview
            }
          }
          level={level}
          className={cn(basicBlockGap)}
        />
      )

    default:
      return null
  }
}
