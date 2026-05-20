import * as types from 'notion-types'
import * as React from 'react'

export type MapPageUrlFn = (
  pageId: string,
  recordMap?: types.ExtendedRecordMap | undefined
) => string
export type MapImageUrlFn = (url: string, block: types.Block) => string
export type SearchNotionFn = (params: types.SearchParams) => Promise<types.SearchResults>

export type ComponentOverrideFn = (props: any, defaultValueFn: () => React.ReactNode) => any

export interface NotionComponents {
  // TODO: better typing for arbitrary react components
  Image: any
  Link: any
  PageLink: any
  // Checkbox: React.FC<{ isChecked: boolean; blockId: string }>

  // blocks
  Code: any
  Equation: any
  Callout?: any

  // collection
  // Collection: any
  Property?: any

  propertyTextValue: ComponentOverrideFn
  propertySelectValue: ComponentOverrideFn
  propertyRelationValue: ComponentOverrideFn
  propertyFormulaValue: ComponentOverrideFn
  propertyTitleValue: ComponentOverrideFn
  propertyPersonValue: ComponentOverrideFn
  propertyFileValue: ComponentOverrideFn
  propertyCheckboxValue: ComponentOverrideFn
  propertyUrlValue: ComponentOverrideFn
  propertyEmailValue: ComponentOverrideFn
  propertyPhoneNumberValue: ComponentOverrideFn
  propertyNumberValue: ComponentOverrideFn
  propertyLastEditedTimeValue: ComponentOverrideFn
  propertyCreatedTimeValue: ComponentOverrideFn
  propertyDateValue: ComponentOverrideFn

  // assets
  Pdf: any
  Tweet: any
  Modal: any
  Embed: any

  // page navigation
  Header: any

  // optional next.js-specific overrides
  nextImage?: any
  nextLink?: any
}

export interface CollectionViewProps {
  collection: types.Collection
  collectionView: types.CollectionView
  collectionData: types.CollectionQueryResult
  padding?: number
  width?: number
}

export interface CollectionCardProps {
  collection: types.Collection
  block: types.PageBlock
  cover: types.CollectionCardCover
  coverSize: types.CollectionCardCoverSize
  coverAspect: types.CollectionCardCoverAspect
  properties?: Array<{
    property: types.PropertyID
    visible: boolean
  }>
  className?: string
}
export interface CollectionGroupProps {
  collection: types.Collection
  collectionViewComponent: React.ElementType
  collectionGroup: any
  hidden: boolean
  schema: any
  value: any
  summaryProps: any
  detailsProps: any
}

// Vendored from interface.ts — needed by helpers.ts
export type AnnotationIgnoreField =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'underline'
  | 'code'
  | 'color'

// Vendored from interface.ts — needed by db-official.ts
export type NotionSorts = {
  property: string
  direction: 'ascending' | 'descending'
}

// Vendored from interface.ts — needed by BlockText, BlockRichText
export type TextIgnoreField = 'hyperlink' | AnnotationIgnoreField

// Moved from PostBody.tsx — needed by renderer.tsx and context.tsx
// (keeps dependency direction unidirectional: components/* → lib/notion/*)
export type DiscreteColsType = 'single' | 'multiple'

// Moved from SimpleImage.tsx — needed by renderer.tsx and context.tsx
export type SimpleImageProps = {
  src?: string
  alt?: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  imagePlaceholder?: React.ReactNode
  zoomable?: boolean
  emoji?: string
}
