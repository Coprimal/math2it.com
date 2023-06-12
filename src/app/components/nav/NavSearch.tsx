'use client'

import Tippy from '@tippyjs/react'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'

import SearchModal from '../SearchModal'

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
    setSearchKeyText(platform.includes('mac') ? '⌘ + K' : 'Ctrl + K')

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <div className={cn('flex-1 flex justify-end')}>
        <Tippy content={searchKeyText} placement="bottom" arrow={false} hideOnClick={true}>
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
            <div className="whitespace-nowrap">Tìm kiếm</div>
          </button>
        </Tippy>
      </div>
      {isSearchOpen && (
        <SearchModal isOpen={isSearchOpen} closeModal={() => setIsSearchOpen(false)} />
      )}
    </>
  )
}
