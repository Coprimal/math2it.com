import { getSlugPrefix, postWidthContainer } from '@app/lib/config'
import cn from 'classnames'
import Link from 'next/link'

import Container from './Container'

export default function Footer() {
  const aClass = 'hover:text-white whitespace-nowrap'
  return (
    <footer className="border-t border-slate-100 bg-[#323541] py-2 text-gray-300">
      <Container className="!mt-0" maxWidthClass={postWidthContainer}>
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 py-2 lg:flex-row">
          <a className={cn(aClass)} href="https://www.facebook.com/Math2IT/" target="_blank">
            Facebook
          </a>{' '}
          <span>|</span>
          <a className={cn(aClass)} href="https://fb.com/groups/math2it" target="_blank">
            Nhóm Facebook
          </a>
          <span>|</span>
          <Link className={cn(aClass)} href={`/${getSlugPrefix('thanks')}/`}>
            Cảm ơn
          </Link>
          <span>|</span>
          <Link className={cn(aClass)} href={`/${getSlugPrefix('newsletter')}/`}>
            Đăng ký nhận tin
          </Link>
          <span>|</span>
          <Link className={cn(aClass)} href={`/${getSlugPrefix('privacy')}/`}>
            Quyền riêng tư
          </Link>
        </div>
      </Container>
    </footer>
  )
}
