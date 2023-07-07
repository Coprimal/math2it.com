import { comfortaa, lobster } from '@app/lib/fonts'
import Container from '@c/Container'
import ImageComponent from '@c/ImageComponent'
import PostListForHome from '@c/PostListForHome'
import WaveSplit from '@c/WaveSplit'
import WavingHand from '@root/public/waving_hand.webp'
import cn from 'classnames'
import { Suspense } from 'react'

export default function Home() {
  return (
    <>
      <div className={cn('bg-gradient-to-b from-[#282a36] to-[#323541]')}>
        <Container>
          <div
            className={cn(
              'xl:max-w-4xl lg:max-w-3xl mx-auto py-12',
              'flex flex-col flex-wrap items-center justify-items-stretch md:flex-row'
            )}
          >
            <div className="md:order-2">
              <i className="icon-math2it text-[5rem] text-[#f15f5f] md:text-[8rem]"></i>
            </div>
            <div className="flex flex-col gap-4 md:order-1 md:flex-1">
              <div className={cn('flex gap-2 justify-center md:justify-start')}>
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
                <h1 className={cn('flex items-center text-4xl text-white', lobster.className)}>
                  Math2IT xin chào!
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
                <a
                  className={cn(
                    'bg-gray-700 hover:bg-gray-600 shadow-md text-white py-1 px-6 rounded-3xl'
                  )}
                  href="https://www.facebook.com/Math2IT/"
                  target="_blank"
                >
                  Facebook Math2IT
                </a>
                <a
                  className={cn(
                    'bg-gray-700 hover:bg-gray-600 shadow-md text-white py-1 px-6 rounded-3xl'
                  )}
                  href="https://fb.com/groups/math2it"
                  target="_blank"
                >
                  Nhóm Math2IT trên Facebook
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <WaveSplit />

      <Suspense fallback={<div>Loading...</div>}>
        <PostListForHome type="latest" />
      </Suspense>
    </>
  )
}
