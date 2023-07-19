// https://nextjs.org/docs/app/api-reference/file-conventions/not-found
import cn from 'classnames'
import Link from 'next/link'

import Container from './components/Container'
import { generateMetaTitle } from './lib/helpers'

export const metadata = {
  title: generateMetaTitle('Không tìm thấy trang'),
  openGraph: {
    images: [
      {
        url: 'https://i.imgur.com/DvWuLpyh.png',
        width: 1024,
        height: 581
      }
    ]
  }
}

export default function NotFoundPage() {
  return (
    <Container maxWidthClass="max-w-5xl h-screen">
      <div className={cn('flex flex-col gap-6 items-center justify-center w-full h-full')}>
        <h1 className="text-4xl text-slate-800">Không tìm thấy trang bạn cần</h1>
        <p className="text-xl text-slate-800">
          Bạn vui lòng dùng chức năng tìm kiếm hoặc{' '}
          <a className="m2it-link hover:m2it-link-hover" href="mailto:math2itblog@gmail.com">
            liên hệ với chúng tôi
          </a>
          .
        </p>
        <p className="text-xl">
          <Link className="m2it-link hover:m2it-link-hover font-semibold" href="/">
            Trở về trang chủ
          </Link>
        </p>
      </div>
    </Container>
  )
}
