import { heightCoverPostList, spacingCoverPostList } from '@app/templates/PageOfPostsListTemplate'
import Container from '@c/Container'
import cn from 'classnames'

export default function SkeletonPostListPage() {
  return (
    <div className="animate-pulse">
      <div>
        <div className={cn('w-full bg-slate-200', heightCoverPostList)}></div>
      </div>
      <Container className={spacingCoverPostList}>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col justify-center">
              <div className="h-32 w-full rounded-md bg-slate-200"></div>
              <div className="flex flex-col items-center gap-1 p-2">
                <div className="h-4 w-full rounded-md bg-slate-200"></div>
                <div className="h-4 w-2/3 rounded-md bg-slate-200"></div>
              </div>
              <div></div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
