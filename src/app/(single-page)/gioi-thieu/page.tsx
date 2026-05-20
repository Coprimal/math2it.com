import { getPage } from '@/src/lib/notion/api'
import { notFound } from 'next/navigation'

import { defaultBlockOptions } from '../../lib/config'
import { getAuthors } from '../../lib/fetcher'
import { generateMetaTitle } from '../../lib/helpers'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export const revalidate = 20

export const metadata = {
  title: generateMetaTitle('Giới thiệu'),
  description: 'Giới thiệu trang web Math2IT và quyền riêng tư của bạn cũng như của chúng tôi.',
  openGraph: {
    images: [
      {
        url: 'https://i.imgur.com/PyXUtfTh.png',
        width: 1024,
        height: 591
      }
    ]
  }
}

export default async function AboutPage() {
  try {
    const recordMap = await getPage(process.env.ABOUT_PAGE as string)
    const authors = await getAuthors()
    return (
      <SinglePostTemplate
        recordMap={recordMap}
        isPage={true}
        authors={authors}
        blockOptions={defaultBlockOptions}
      />
    )
  } catch (error) {
    console.log('🚨 Lỗi khi load trang "Giới thiệu"', error)
    notFound()
  }
}
