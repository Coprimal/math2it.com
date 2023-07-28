import cn from 'classnames'
import { AiOutlineAlert } from 'react-icons/ai'

import { notionMaxRequest } from '../lib/config'
import { getPosts } from '../lib/fetcher'
import Container from './Container'

export default async function AlertHomePage() {
  const allPosts = await getPosts({
    dbId: process.env.NOTION_DB_POSTS as string,
    pageSize: notionMaxRequest,
    getFull: true
  })
  const percent = Math.round((allPosts.length / 120) * 100)
  return (
    <Container maxWidthClass={cn('max-w-5xl')} className="px-4 sm:px-6">
      <div
        className={cn(
          'flex flex-col sm:flex-row items-center sm:items-start gap-4',
          'bg-amber-100 p-6 rounded-xl shadow-md text-slate-800'
        )}
      >
        <div>
          <AiOutlineAlert className="text-6xl sm:text-5xl" />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            {' '}
            Math2IT vừa trải qua một đợt đại phẫu lớn và đang trong giai đoạn chuyển giao bài viết
            từ phiên bản cũ sang phiên bản mới. Trong thời gian chuyển giao, có thể nhiều bài viết
            chưa được cập nhật, bạn vui lòng chờ đợi!{' '}
            <strong>
              Khi thông báo này biến mất cũng có nghĩa là quá trình chuyển giao đã hoàn tất!
            </strong>{' '}
            Mong bạn thông cảm cho sự bất tiện này.
          </div>
          <div className="text-emerald-600">
            Đã chuyển giao được <span className="font-semibold">{percent}%</span> trên tổng số bài
            viết cũ!
          </div>
        </div>
      </div>
    </Container>
  )
}
