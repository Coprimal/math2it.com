import cn from 'classnames'

import { postWidthContainer } from '../lib/config'
import Container from './Container'
import { postBodyContainerClass } from './PostBody'
import { containerHeaderClass, fullWidthPostCoverHeight, gapHeaderItems } from './PostHeader'

type SkeletonPostProps = {
  hideCategories?: boolean
  hideMeta?: boolean
  hideTags?: boolean
}

/**
 * A skeleton loading template for post
 * Note that, options in this component should have the same values as the one
 * in pages/[postSlug], where it's used as a skeleton. This makes sure the
 * loading placeholder has the same shape as the one to be loaded!
 */
export default function SkeletonPost(props: SkeletonPostProps) {
  return (
    <article className="animate-pulse">
      {/* Featured Image */}
      <div>
        <div className={cn('w-full bg-slate-200', fullWidthPostCoverHeight)}></div>
      </div>
      <Container className={containerHeaderClass} maxWidthClass={postWidthContainer}>
        <div className="pb-4 pt-8">
          {/* Categories */}
          {!props.hideCategories && (
            <div className={cn(gapHeaderItems, 'flex justify-center gap-3 md:justify-start')}>
              <div className="h-6 w-28 rounded-2xl bg-slate-200"></div>
              <div className="h-6 w-28 rounded-2xl bg-slate-200"></div>
            </div>
          )}

          {/* Title */}
          <div className={cn(gapHeaderItems, 'h-8 w-3/4 rounded-2xl bg-slate-200')}></div>

          {/* Meta */}
          {!props.hideMeta && (
            <div
              className={cn(
                gapHeaderItems,
                '!mb-4 flex flex-wrap justify-start gap-3 md:flex-nowrap'
              )}
            >
              <div className="flex items-center gap-1">
                <i className="icon-user-outline text-slate-400"></i>
                <div className="h-5 w-16 rounded-2xl bg-slate-200"></div>
              </div>
              <div className="flex items-center gap-1">
                <i className="icon-clock text-slate-400"></i>
                <div className="h-5 w-28 rounded-2xl bg-slate-200"></div>
              </div>
            </div>
          )}
          {/* Tags */}
          {!props.hideTags && (
            <div className="justify-left flex items-center gap-3 pb-2 pt-0">
              <span className="text-slate-400">
                <i className="icon-tag-2"></i>
              </span>
              <div className="h-6 w-20 rounded-2xl bg-slate-200"></div>
              <div className="h-6 w-32 rounded-2xl bg-slate-200"></div>
              <div className="h-6 w-20 rounded-2xl bg-slate-200"></div>
            </div>
          )}
        </div>
      </Container>

      {/* Content */}
      <Container maxWidthClass={postWidthContainer}>
        <div className={cn(postBodyContainerClass)}>
          <div className="w-100 mt-4 mb-2 h-5 rounded-2xl bg-slate-200"></div>
          <div className="w-100 mb-2 h-5 rounded-2xl bg-slate-200"></div>
          <div className="w-100 mb-2 h-5 rounded-2xl bg-slate-200"></div>
          <div className="mb-1 h-5 w-1/2 rounded-2xl bg-slate-200"></div>
        </div>
      </Container>
    </article>
  )
}
