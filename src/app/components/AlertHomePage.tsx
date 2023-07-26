import cn from 'classnames'
import { AiOutlineAlert } from 'react-icons/ai'

import Container from './Container'

export default function AlertHomePage() {
  return (
    <Container maxWidthClass={cn('max-w-5xl')}>
      <div
        className={cn(
          'bg-amber-100 p-6 rounded-xl flex items-center gap-4 shadow-md text-slate-800'
        )}
      >
        <div>
          <AiOutlineAlert className="text-5xl" />
        </div>
        <div>
          {' '}
          Math2IT vừa trải qua một đợt đại phẫu lớn và đang trong giai đoạn chuyển giao bài viết từ
          phiên bản cũ sang phiên bản mới. Trong thời gian chuyển giao, có thể nhiều bài viết chưa
          được cập nhật, bạn vui lòng chờ đợi!{' '}
          <strong>
            Khi thông báo này biến mất cũng có nghĩa là quá trình chuyển giao đã hoàn tất!
          </strong>{' '}
          Mong bạn thông cảm cho sự bất tiện này.
        </div>
      </div>
    </Container>
  )
}
