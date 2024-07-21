'use client'

import PostAside from '@c/PostAside'
import PostHeader from '@c/PostHeader'
import PostBody from '@notion-x/src/components/PostBody'
import PostToc from '@notion-x/src/components/PostToc'
import { Author, Post } from '@notion-x/src/interface'
import { BlockOptionsContextType } from '@notion-x/src/lib/context'
import { idToUuid } from '@notion-x/src/lib/helpers'
import cn from 'classnames'
import { ExtendedRecordMap, PageBlock } from 'notion-types'
import { getPageTableOfContents } from 'notion-utils'

import PostList from '../../../notion-x/src/components/PostsList'
import Comments from '../components/Comments'
import { defaultBlockOptions, defaultPostTypeOpts } from '../lib/config'
import { lobster } from '../lib/fonts'

type SinglePostTemplateProps = {
  recordMap: ExtendedRecordMap
  authors: Author[]
  relatedPosts?: Post[]
  blockOptions?: BlockOptionsContextType
  hideWriteWithUs?: boolean
  isPage?: boolean
}

// Note: If we change the breakpoint here, we have to change the breakpoint of showing TOC on
// small screens in component post-toc.tsx too.
const asideClass = cn('hidden 2xl:block flex-1', 'h-[calc(100vh-130px)] sticky top-[70px] pt-8')

export default function SinglePostTemplate(props: SinglePostTemplateProps) {
  const id = Object.keys(props.recordMap.block)[0]
  const block = props.recordMap.block[id]?.value

  const authorIds = block?.properties?.[`${process.env.NEXT_PUBLIC_ID_AUTHORS}`]
    ?.filter((aBlock: any) => aBlock?.length > 1)
    ?.map((aBlock: any) => idToUuid(aBlock?.[1]?.[0]?.[1]))
  const authorsOfPost = props.authors.filter(author => authorIds?.includes(idToUuid(author.id)))
  const tocs = getPageTableOfContents(block as PageBlock, props.recordMap)

  return (
    <>
      <div className="animate-fadeIn">
        <PostHeader
          recordMap={props.recordMap}
          authors={authorsOfPost}
          hideWriteWithUs={props.hideWriteWithUs}
        />
        <div className={cn('flex justify-center px-5')}>
          <aside className={cn(asideClass)}>
            <PostAside position="left">
              <div className="hidden">Left aside</div>
            </PostAside>
          </aside>

          <article className={cn('container max-w-3xl flex flex-col gap-8 py-8')}>
            <PostBody
              className="w-full"
              recordMap={props.recordMap}
              blockOptions={defaultBlockOptions}
              useSimpleImage={true}
              showBackToTopButton={true}
            />

            {props.relatedPosts && props.relatedPosts.length > 0 && (
              <div className={cn('flex flex-col gap-6 mb-8 bg-transparent')}>
                <h2 className={cn(lobster.className, 'text-2xl sm:text-[1.65rem] text-slate-700')}>
                  Có thể bạn quan tâm?
                </h2>
                <PostList
                  listStyle="carousel"
                  posts={props.relatedPosts}
                  postType="PostCardWhiteBgBig"
                  // postTypeOpts={{
                  //   hideCategory: true,
                  //   hideDate: true,
                  //   fontClassName: comfortaa.className
                  // }}
                  postTypeOpts={{ hideAuthor: true, hideDate: true, ...defaultPostTypeOpts }}
                />
              </div>
              // <PostListForHomeSection
              //   listStyle="carousel"
              //   title="Mới nhất"
              //   type="latest"
              //   backgroundClassName="bg-none"
              //   moreHref={`/${getSlugPrefix('all')}/`}
              //   postType="PostCardWhiteBgBig"
              //   postTypeOpts={{ hideAuthor: true, hideDate: true, ...defaultPostTypeOpts }}
              // />
            )}

            <Comments />
          </article>

          <aside className={cn(asideClass)}>
            <PostAside position="right">
              <PostToc recordMap={props.recordMap} tocs={tocs} labelTocTitle="Trong bài này" />
            </PostAside>
          </aside>
        </div>
      </div>
    </>
  )
}
