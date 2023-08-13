import { heightCoverPostList, spacingCoverPostList } from '@app/templates/PageOfPostsListTemplate'
import Container from '@c/Container'
import cn from 'classnames'
import SkeletonPostList from 'notion-nextjs-lib/dist/components/SkeletonPostList'

export default function SkeletonPostListPage() {
  return (
    <div className="animate-pulse">
      <div>
        <div className={cn('w-full bg-slate-200', heightCoverPostList)}></div>
      </div>
      <Container className={spacingCoverPostList}>
        <SkeletonPostList count={8} />
      </Container>
    </div>
  )
}
