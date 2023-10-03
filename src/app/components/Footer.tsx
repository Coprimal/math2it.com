import { getSlugPrefix, postWidthContainer } from '@app/lib/config'
import TbExternalLink from '@notion-x/src/icons/TbExternalLink'
import cn from 'classnames'
import Link from 'next/link'

import Container from './Container'

export default function Footer() {
  const aClass = 'hover:text-white whitespace-nowrap flex items-center gap-1 whitespace-nowrap'
  return (
    <footer className="border-t border-slate-100 bg-[#323541] py-4 text-gray-300">
      <Container className="!mt-0" maxWidthClass={postWidthContainer}>
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 pt-2 pb-1 lg:flex-row">
          <a className={cn(aClass)} href="https://www.facebook.com/Math2IT/" target="_blank">
            Facebook <TbExternalLink />
          </a>{' '}
          <span>|</span>
          <a className={cn(aClass)} href="https://fb.com/groups/math2it" target="_blank">
            Nhóm Facebook <TbExternalLink />
          </a>
          <span>|</span>
          <a className={cn(aClass)} href="https://www.texmath.com/" target="_blank">
            TeXMath <TbExternalLink />
          </a>
          <span>|</span>
          <Link className={cn(aClass)} href={`/${getSlugPrefix('about')}/`}>
            Giới thiệu
          </Link>
        </div>
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 pt-1 pb-2 lg:flex-row">
          <a className={cn(aClass)} href="mailto:contact@math2it.com">
            💌 contact@math2it.com
          </a>
          <span>|</span>
          <Link className={cn(aClass)} href={`/${getSlugPrefix('viet-bai')}/`}>
            ✍ Viết bài cùng Math2IT
          </Link>
        </div>
      </Container>
    </footer>
  )
}
