import { comfortaa, lobster, righteous } from '@app/lib/fonts'
import Container from '@c/Container'
import ImageComponent from '@c/ImageComponent'
import WaveSplit from '@c/WaveSplit'
import WavingHand from '@root/public/waving_hand.webp'
import cn from 'classnames'
import Link from 'next/link'

import PostListForHomeSection from './components/PostListForHomeSection'
import ScrollToTop from './components/ScrollToTop'
import { getSlugPrefix } from './lib/config'
import { getCategories } from './lib/fetcher'

export const revalidate = 60

export const metadata = {
  metadataBase: new URL('https://math2it.com'),
  title: 'Math2IT | Toán học, Giáo dục và Công nghệ',
  description: 'Toán học, Giáo dục và Công nghệ',
  openGraph: {
    title: 'Math2IT | Toán học, Giáo dục và Công nghệ',
    description: 'Toán học, Giáo dục và Công nghệ',
    url: 'https://math2it.com',
    siteName: 'Math2IT',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://i.imgur.com/PyXUtfTh.png',
        width: 1024,
        height: 581
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Math2IT | Toán học, Giáo dục và Công nghệ',
    description: 'Toán học, Giáo dục và Công nghệ'
  }
}

export default function Home() {
  const categories = getCategories()
  const badgeClassName =
    'shadow-md text-white py-1 px-6 rounded-3xl hover:translate-y-[-2px] hover:transition-all'
  return (
    <>
      <div className={cn('bg-gradient-to-b from-[#282a36] to-[#323541]')}>
        <Container maxWidthClass="max-w-5xl">
          <div
            className={cn(
              'mx-auto py-20 px-0 md:px-6',
              'flex flex-col flex-wrap items-center justify-items-stretch md:flex-row'
            )}
          >
            <div className="flex flex-col gap-6 md:order-2 md:flex-1">
              <div
                className={cn(
                  'flex flex-col md:flex-row items-center gap-2 justify-center md:justify-start'
                )}
              >
                <div
                  className={cn(
                    'inline-flex h-9 w-9 origin-[70%_70%] animate-wave items-center justify-center'
                  )}
                >
                  <ImageComponent
                    image={{
                      staticImageData: WavingHand
                    }}
                    alt="Hình vẫy tay"
                    className={cn('h-full')}
                  />
                </div>
                <h1 className={cn('flex items-center text-4xl text-white')}>
                  <span className={cn(righteous.className, 'mr-2')}>Math2IT</span>
                  <span className={cn(lobster.className, 'whitespace-nowrap')}>xin chào</span>
                </h1>
              </div>
              <p
                className={cn(
                  'max-w-full text-white text-center md:text-left',
                  comfortaa.className
                )}
              >
                Chúng tôi viết về Toán, Tin và Giáo dục theo cách trực quan và thực tiễn nhất.
              </p>
              <div
                className={cn('flex flex-wrap items-center justify-center gap-4 md:justify-start')}
              >
                <Link
                  className={cn('bg-[#eeeeee30]', badgeClassName)}
                  href={`/${getSlugPrefix('about')}/`}
                >
                  Giới thiệu
                </Link>
                <a
                  className={cn('bg-[#eeeeee30]', badgeClassName)}
                  href="https://www.facebook.com/Math2IT/"
                  target="_blank"
                >
                  Facebook Math2IT
                </a>
                <a
                  className={cn('bg-[#eeeeee30]', badgeClassName)}
                  href="https://fb.com/groups/math2it"
                  target="_blank"
                >
                  Nhóm Math2IT
                </a>
                <Link
                  className={cn(badgeClassName, 'bg-gradient-to-r from-purple-700 to-pink-500')}
                  href={`/${getSlugPrefix('viet-bai')}/`}
                >
                  ✍ Viết bài cùng Math2IT
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <WaveSplit />

      <div className="flex flex-col gap-12 pb-12 pt-8">
        <PostListForHomeSection
          listStyle="carousel"
          title="Mới nhất"
          type="latest"
          backgroundClassName="bg-none"
          moreHref={`/${getSlugPrefix('all')}/`}
          postType="PostCardWhiteBgBig"
          postTypeOpts={{ hideAuthor: true, hideDate: true }}
        />
        <PostListForHomeSection
          title="Tuyển chọn"
          iconComponent={<i className="icon-star-circled"></i>}
          type="selected"
          postTypeOpts={{ hideDate: true }}
          backgroundClassName="bg-gradient-to-b from-amber-100/50 to-white"
          moreHref={`/${getSlugPrefix('selected')}/`}
          postType="PostImageBackground"
        />
        {categories.map(category => (
          <PostListForHomeSection
            key={category.slug}
            title={category.name}
            type="byCategory"
            categorySlug={category.slug as string}
            postTypeOpts={{ hideDate: true, hideCategory: true }}
            backgroundClassName={category.backgroundClassName}
            moreHref={category.uri}
            iconComponent={<i className={category.fontello}></i>}
          />
        ))}
      </div>

      <ScrollToTop />
    </>
  )
}
