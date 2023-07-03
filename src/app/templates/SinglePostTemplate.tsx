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

type SinglePostTemplateProps = {
  postHeader: PostHeaderType
  contentBlocks: ListBlockChildrenResponse['results']
}

// Note: If we change the breakpoint here, we have to change the breakpoint of showing TOC on
// small screens in component post-toc.tsx too.
const asideClass = cn('hidden 2xl:block flex-1', 'h-[calc(100vh-130px)] sticky top-[70px]')

export default function SinglePostTemplate(props: SinglePostTemplateProps) {
  const { postHeader, contentBlocks } = props

  return (
    <div className="animate-fadeIn">
      {postHeader && <PostHeader postHeader={postHeader} />}
      <div className={cn('flex justify-center px-5')}>
        <aside className={cn(asideClass)}>
          <PostAside position="left">
            <div className="hidden">Left aside</div>
          </PostAside>
        </aside>

        <article className={cn('container max-w-3xl')}>
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
  )
}
