'use client'

import PostAside from '@c/PostAside'
import PostBody from '@c/PostBody'
import PostHeader from '@c/PostHeader'
import PostToc from '@c/PostToc'
import {
  BlockObjectResponse,
  ListBlockChildrenResponse
} from '@notionhq/client/build/src/api-endpoints'
import { PostHeaderType } from '@src/interface'
import cn from 'classnames'
import { AiOutlineAlert } from 'react-icons/ai'

import ScrollToTop from '../components/ScrollToTop'
import {
  BlockOptionContext,
  BlockOptionContextType,
  defaultBlockOptionContext
} from '../lib/context'

type SinglePostTemplateProps = {
  postHeader: PostHeaderType
  contentBlocks: ListBlockChildrenResponse['results']
  blockOptions?: BlockOptionContextType
  hideWriteWithUs?: boolean
}

// Note: If we change the breakpoint here, we have to change the breakpoint of showing TOC on
// small screens in component post-toc.tsx too.
const asideClass = cn('hidden 2xl:block flex-1', 'h-[calc(100vh-130px)] sticky top-[70px] pt-8')

export default function SinglePostTemplate(props: SinglePostTemplateProps) {
  const { postHeader, contentBlocks } = props
  const blockOpts = props.blockOptions || defaultBlockOptionContext
  const checkedText = props.postHeader?.contentCheck
    ? 'hoàn tất rà soát 🎉'
    : 'chưa hoàn tất rà soát'

  return (
    <BlockOptionContext.Provider value={blockOpts}>
      <div className="animate-fadeIn">
        {postHeader && (
          <PostHeader postHeader={postHeader} hideWriteWithUs={props.hideWriteWithUs} />
        )}
        <div className={cn('flex justify-center px-5')}>
          <aside className={cn(asideClass)}>
            <PostAside position="left">
              <div className="hidden">Left aside</div>
            </PostAside>
          </aside>

          <article className={cn('container max-w-3xl')}>
            <div
              className={cn(
                'mx-auto container p-6 mt-8',
                'flex flex-col sm:flex-row items-center sm:items-start gap-4',
                'bg-amber-100 rounded-xl shadow-md text-slate-800'
              )}
            >
              <div>
                <AiOutlineAlert className="text-6xl sm:text-5xl" />
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  Math2IT đang trong giai đoạn rà soát nội dung tất cả các bài viết để cập nhật lại
                  chất lượng và độ chính xác.{' '}
                  <span className="text-emerald-600">
                    Tình trạng của bài viết hiện tại là{' '}
                    <span className="font-semibold">{checkedText}</span>.
                  </span>
                </div>
                <div>
                  🤝 Nếu bạn phát hiện điểm nào chưa chính xác, vui lòng{' '}
                  <a
                    className="m2it-link hover:m2it-link-hover"
                    href="mailto:math2itblog@gmail.com"
                  >
                    email cho chúng tôi.
                  </a>{' '}
                  Chân thành cảm ơn bạn. 😊
                </div>
              </div>
            </div>

            <PostBody
              className={cn('w-full')}
              contentBlocks={contentBlocks as BlockObjectResponse[]}
              showToc={postHeader.showToc}
            ></PostBody>
          </article>

          <aside className={cn(asideClass)}>
            <PostAside position="right">
              <PostToc
                showToc={postHeader.showToc}
                contentBlocks={contentBlocks as BlockObjectResponse[]}
              />
            </PostAside>
          </aside>
        </div>
      </div>
      <ScrollToTop />
    </BlockOptionContext.Provider>
  )
}
