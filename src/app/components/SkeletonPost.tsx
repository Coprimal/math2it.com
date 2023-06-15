import cn from 'classnames'

import { postWidthContainer } from '../lib/config'
import Container from './Container'
import { postBodyContainerClass } from './PostBody'
import { fullWidthPostCoverHeight, gapHeaderItems } from './PostHeader'

/**
 * A skeleton loading template for post
 * Note that, options in this component should have the same values as the one
 * in pages/[postSlug], where it's used as a skeleton. This makes sure the
 * loading placeholder has the same shape as the one to be loaded!
 */
export default function SkeletonPost() {
  return (
    <article className="animate-pulse">
      {/* Featured Image */}
      <div>
        <div className={cn('relative w-full', fullWidthPostCoverHeight)}>
          <div className="absolute left-0 top-0 h-full w-full">
            <div className="relative h-full w-full animate-pulse rounded-lg bg-slate-200">
              <div
                className={cn(
                  'absolute -top-5 left-5 z-20 aspect-square h-[300px] scale-[1.4]',
                  'animate-wave bg-math2it bg-[length:300px_300px]'
                )}
              ></div>
              <div className="bg-wave absolute bottom-0 left-0 z-10 h-2/5 w-full"></div>
            </div>
          </div>
        </div>
      </div>
      <Container maxWidth={postWidthContainer}>
        <div className="pb-4 pt-8">
          {/* Categories */}
          <div className={cn(gapHeaderItems, 'flex justify-center gap-3 md:justify-start')}>
            <div className="h-6 w-24 rounded-2xl bg-slate-200"></div>
            <div className="h-6 w-28 rounded-2xl bg-slate-200"></div>
          </div>

          {/* Title */}
          <div className="w-100 mb-2 h-8 rounded-2xl bg-slate-200 pt-1"></div>
          <div className={cn(gapHeaderItems, 'h-8 w-1/2 rounded-2xl bg-slate-200')}></div>

          {/* Meta */}
          <div className={cn(gapHeaderItems, 'flex flex-wrap justify-start gap-3 md:flex-nowrap')}>
            <div className="flex items-center gap-1">
              <i className="icon-user-outline text-slate-400"></i>
              <div className="h-5 w-16 rounded-2xl bg-slate-200"></div>
            </div>
            <div className="flex items-center gap-1">
              <i className="icon-clock text-slate-400"></i>
              <div className="h-5 w-28 rounded-2xl bg-slate-200"></div>
            </div>
          </div>

          {/* Tags */}
          <div className="justify-left flex items-center gap-3 pb-2 pt-0">
            <span className="text-gray-600">
              <i className="icon-tag-2"></i>
            </span>
            <div className="h-6 w-20 rounded-2xl bg-slate-200"></div>
            <div className="h-6 w-32 rounded-2xl bg-slate-200"></div>
            <div className="h-6 w-20 rounded-2xl bg-slate-200"></div>
          </div>
        </div>
      </Container>

      {/* Content */}
      <Container maxWidth={postWidthContainer}>
        <div className={cn(postBodyContainerClass)}>
          <div className="w-100 mb-2 h-5 rounded-2xl bg-slate-200"></div>
          <div className="w-100 mb-2 h-5 rounded-2xl bg-slate-200"></div>
          <div className="w-100 mb-2 h-5 rounded-2xl bg-slate-200"></div>
          <div className="mb-1 h-5 w-1/2 rounded-2xl bg-slate-200"></div>
        </div>
      </Container>
    </article>
  )
}
