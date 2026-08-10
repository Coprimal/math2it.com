import { getPage } from '@notion-x/src/lib/notionx'
import { notFound } from 'next/navigation'

import { defaultBlockOptions } from '../../lib/config'
import { getAuthors } from '../../lib/fetcher'
import { generateMetaTitle } from '../../lib/helpers'
import SinglePostTemplate from '../../templates/SinglePostTemplate'

export const metadata = {
  title: generateMetaTitle('Viết bài cùng Math2IT'),
  description: 'Cùng Math2IT tạo nên những bài viết chất lượng về Toán, Tin và Công nghệ.',
  openGraph: {
    images: [
      {
        url: 'https://i.imgur.com/IGneUknh.jpg',
        width: 1024,
        height: 591
      }
    ]
  }
}

export default async function WriteWithUsPage() {
  try {
    const recordMap = await getPage(process.env.WRITE_WITH_US_PAGE as string)
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
    console.log('🚨 Lỗi khi load trang "Viết bài cùng Math2IT"', error)
    notFound()
  }
}
