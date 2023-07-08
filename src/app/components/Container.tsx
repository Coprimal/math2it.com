import cn from 'classnames'

type ContainerProps = {
  children: React.ReactNode
  className?: string
  /**
   * 👇 With this option, a custom max-width will be set.
   * Note that, tailwind's "container" class has it own a max-width
   */
  maxWidthClass?: string
}
export default function Container(props: ContainerProps) {
  const { children, className, maxWidthClass } = props
  return (
    <div className={cn('container mx-auto px-5', className)}>
      <div className={cn('mx-auto', maxWidthClass)}>{children}</div>
    </div>
  )
}
