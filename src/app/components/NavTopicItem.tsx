'use client'

import cn from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { textClass } from './Nav'

export const menuItemCommonClass = cn(
  'px-3 py-1.5 rounded-md text-base font-medium text-center h-full flex items-center justify-center',
  'whitespace-nowrap whitespace-nowrap'
)

type NavTopicItemProps = {
  url: string
  label: string
  customClass?: string
}

export default function NavTopicItem(props: NavTopicItemProps) {
  const { url, label, customClass } = props
  const pathname = usePathname()
  const currentRoute = pathname.split('page/')[0]

  return (
    <Link
      className={cn(isActiveClass(currentRoute === url), menuItemCommonClass, customClass)}
      aria-current={currentRoute === url ? 'page' : undefined}
      href={url}
    >
      {label}
    </Link>
  )
}

export const isActiveClass = (isCurrent: boolean) =>
  cn({
    'bg-slate-800 text-white border border-slate-600': isCurrent,
    [`${textClass}`]: !isCurrent
  })
