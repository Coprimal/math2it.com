import { getSlugPrefix, postWidthContainer } from '@app/lib/config'
import cn from 'classnames'
import Link from 'next/link'
import { TbExternalLink } from 'react-icons/tb'

import Container from './Container'

export default function Footer() {
  const aClass = 'hover:text-white whitespace-nowrap flex items-center gap-1 whitespace-nowrap'
  return (
    <footer className="border-t border-slate-100 bg-[#323541] py-2 text-gray-300">
      <Container className="!mt-0" maxWidthClass={postWidthContainer}>
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 py-2 lg:flex-row">
          <a className={cn(aClass)} href="https://www.facebook.com/Math2IT/" target="_blank">
            Facebook <TbExternalLink />
          </a>{' '}
          <span>|</span>
          <a className={cn(aClass)} href="https://fb.com/groups/math2it" target="_blank">
            Nhóm Facebook <TbExternalLink />
          </a>
          <span>|</span>
          <Link className={cn(aClass)} href={`/${getSlugPrefix('about')}/`}>
            Giới thiệu
          </Link>
        </div>
      </Container>
    </footer>
  )
}
