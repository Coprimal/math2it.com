'use client'

import cn from 'classnames'
import SearchModal from 'notion-nextjs-lib/dist/components/SearchModal'
import { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'

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
                'hidden sm:inline-block'
              )}
            >
              {searchKeyText}
            </span>
          </div>
        </button>
      </div>
      {isSearchOpen && (
        <SearchModal
          // Cannot use process.env here because of 'use client' at the top
          url="https://math2it-server.vercel.app/api/search-notion"
          slugPrefix={getSlugPrefix('singlePost')}
          isOpen={isSearchOpen}
          closeModal={() => setIsSearchOpen(false)}
        />
      )}
    </>
  )
}
