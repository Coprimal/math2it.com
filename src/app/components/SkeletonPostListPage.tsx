import { heightCoverPostList, spacingCoverPostList } from '@app/templates/PageOfPostsListTemplate'
import Container from '@c/Container'
import SkeletonPostList from '@notion-x/src/components/SkeletonPostList'
import cn from 'classnames'

export default function SkeletonPostListPage() {
  return (
    <div className="animate-pulse">
      <div>
        <div className={cn('w-full bg-slate-200', heightCoverPostList)}></div>
      </div>
      <Container className={spacingCoverPostList}>
        <SkeletonPostList count={12} />
      </Container>
    </div>
  )
}
