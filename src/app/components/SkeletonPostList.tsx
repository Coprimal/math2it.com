import cn from 'classnames'

type SkeletonPostListProps = {
  count: number
}

export const postListGridCLass = cn(
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-x-4'
)

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
