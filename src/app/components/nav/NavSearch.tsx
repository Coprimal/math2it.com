'use client'

import SearchModal from '@/src/components/notion/SearchModal'
import FiSearch from '@/src/components/icons/FiSearch'
import cn from 'classnames'
import { useEffect, useState } from 'react'

import { getSlugPrefix } from '../../lib/config'

export default function NavSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchKeyText, setSearchKeyText] = useState('Ctrl + K')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    const platform = navigator?.platform?.toLowerCase() || ''
    setSearchKeyText(platform.includes('mac') ? '⌘ K' : 'Ctrl K')

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <div className={cn('flex-1 flex justify-end')}>
        <button
          type="button"
          className={cn(
            'group h-full flex gap-2 items-center justify-center px-2 py-1.5 rounded-md',
            'text-slate-300 hover:text-white hover:bg-gray-700',
            'focus:outline-none'
          )}
          onClick={() => setIsSearchOpen(true)}
        >
          <div>
            <FiSearch className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Tìm kiếm</span>
            <span
              className={cn(
                'text-[0.7rem] bg-[#65666b30] px-1 rounded-sm border-[#555] border-[0.5px]',
                'hidden sm:inline-block whitespace-nowrap'
              )}
            >
              {searchKeyText}
            </span>
          </div>
        </button>
      </div>
      {isSearchOpen && (
        <SearchModal
          url="/api/search-notion"
          slugPrefix={getSlugPrefix('singlePost')}
          isOpen={isSearchOpen}
          closeModal={() => setIsSearchOpen(false)}
          errorMessage="Có lỗi trong quá trình tải dữ liệu, vui lòng thử lại hoặc liên hệ Math2IT!"
          noResultsMessage="Không tìm thấy bài viết phù hợp!"
          foundResultsMessage="Tìm thấy {{count}} kết quả."
          placeholder="Tìm bài viết..."
        />
      )}
    </>
  )
}
