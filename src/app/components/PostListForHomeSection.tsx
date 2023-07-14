import cn from 'classnames'
import Link from 'next/link'
import { Suspense } from 'react'
import { MdKeyboardDoubleArrowRight } from 'react-icons/md'

import { lobster } from '../lib/fonts'
import Container from './Container'
import PostListForHome, { PostListForHomeType, postListHomeCount } from './PostListForHome'
import { PostType, PostTypeOpts } from './PostsList'
import SkeletonPostList from './SkeletonPostList'

export type PostListStyle = 'default' | 'carousel'

type SkeletonPostListForHomeProps = {
  listStyle?: PostListStyle
  title: string
  type: PostListForHomeType
  iconComponent?: React.ReactNode
  moreHref?: string
  categorySlug?: string // required if type === 'byCategory'
  backgroundClassName?: string
  postType?: PostType
  postTypeOpts?: PostTypeOpts
}

export default function PostListForHomeSection(props: SkeletonPostListForHomeProps) {
  return (
    <Container
      maxWidthClass={cn(
        'max-w-5xl rounded-lg overflow-hidden',
        props.backgroundClassName ?? 'bg-gradient-to-b from-gray-100 to-white'
      )}
    >
      <div className="flex items-center justify-between px-5">
        <h1 className={cn('text-[1.65rem] font-semibold text-slate-700 py-4', lobster.className)}>
          {props.iconComponent && <span className="mr-1 opacity-90">{props.iconComponent}</span>}
          {props.title}
        </h1>
        {props.moreHref && (
          <Link
            className={cn('text-slate-700 hover:m2it-link-hover italic', 'flex items-center gap-1')}
            href={props.moreHref}
          >
            <MdKeyboardDoubleArrowRight />
            <span>xem thêm</span>
          </Link>
        )}
      </div>
      <div className="px-8 pb-5 pt-2 relative z-20">
        <Suspense fallback={<SkeletonPostList count={postListHomeCount / 2} />}>
          <PostListForHome
            listStyle={props.listStyle}
            type={props.type}
            categorySlug={props.categorySlug}
            postTypeOpts={props.postTypeOpts}
            postType={props.postType}
          />
        </Suspense>
      </div>
    </Container>
  )
}
