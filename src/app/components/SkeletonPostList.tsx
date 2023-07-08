import cn from 'classnames'

import { postListGridCLass } from './PostsList'

type SkeletonPostListProps = {
  count: number
}

export default function SkeletonPostList(props: SkeletonPostListProps) {
  return (
    <div className={cn(postListGridCLass, 'animate-pulse')}>
      {Array.from({ length: props.count }).map((_, i) => (
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
  )
}
