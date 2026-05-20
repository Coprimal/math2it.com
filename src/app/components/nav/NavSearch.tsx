'use client'

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import cn from 'classnames'
import { debounce } from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import AiOutlineLoading3Quarters from '@/src/components/icons/AiOutlineLoading3Quarters'
import BsArrowReturnLeft from '@/src/components/icons/BsArrowReturnLeft'
import FiSearch from '@/src/components/icons/FiSearch'
import IoCloseCircle from '@/src/components/icons/IoCloseCircle'
import IoDocumentTextOutline from '@/src/components/icons/IoDocumentTextOutline'

// Minimal types for the Pagefind module loaded at runtime
interface PagefindData {
  url: string
  // excerpt is HTML with <mark> highlights produced at build time by Pagefind from site content.
  // It is not user-supplied runtime input, so it is treated as trusted (same pattern as the
  // existing SearchModal which renders titleHighlighted/textHighlighted via dangerouslySetInnerHTML).
  excerpt: string
  meta: { title: string }
}

interface PagefindRawResult {
  id: string
  data: () => Promise<PagefindData>
}

interface PagefindSearchResult {
  results: PagefindRawResult[]
}

interface PagefindModule {
  init: () => Promise<void>
  search: (query: string) => Promise<PagefindSearchResult>
}

type SearchResultItem = PagefindData

const MAX_RESULTS = 20

function checkIsInView(selectedEl: HTMLElement, containerEl: HTMLElement) {
  const isOutBelow =
    selectedEl.offsetTop + selectedEl.offsetHeight - containerEl.scrollTop >
    containerEl.offsetHeight
  const isOutAbove = selectedEl.offsetTop < containerEl.scrollTop
  if (isOutAbove) return 'above'
  if (isOutBelow) return 'below'
  return 'in'
}

function SearchModal({ isOpen, closeModal }: { isOpen: boolean; closeModal: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pagefindRef = useRef<PagefindModule | null>(null)
  const requestCounterRef = useRef(0)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [selected, setSelected] = useState(-1)
  const router = useRouter()

  // Load pagefind on first open; handles missing index gracefully (e.g. in dev before first build)
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    async function loadPagefind() {
      if (pagefindRef.current) return
      try {
        // Pagefind index is generated at build time; this path doesn't exist in dev or at typecheck time.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error -- module exists only after `next build && pagefind --site out`
        const pf = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ '/pagefind/pagefind.js')) as unknown as PagefindModule // eslint-disable-line
        await pf.init()
        if (!cancelled) {
          pagefindRef.current = pf
        }
      } catch {
        if (!cancelled) {
          setLoadError(true)
        }
      }
    }

    loadPagefind()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Auto-scroll when keyboard-navigating results
  useLayoutEffect(() => {
    if (!containerRef.current || selected < 0) return
    const container = containerRef.current
    const selectedItem = container.children[selected] as HTMLElement
    if (!selectedItem) return
    const view = checkIsInView(selectedItem, container)
    if (view === 'above') {
      container.scrollTo({ top: selectedItem.offsetTop - container.offsetTop, behavior: 'smooth' })
    } else if (view === 'below') {
      container.scrollTo({
        top: selectedItem.offsetTop + selectedItem.offsetHeight - container.offsetHeight,
        behavior: 'smooth'
      })
    }
  }, [selected])

  const performSearch = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }
    if (!pagefindRef.current) return

    const requestId = ++requestCounterRef.current
    setIsLoading(true)
    setHasSearched(true)
    try {
      const searchResult = await pagefindRef.current.search(value)
      const topResults = searchResult.results.slice(0, MAX_RESULTS)
      const resolved = await Promise.all(topResults.map(r => r.data()))
      if (requestCounterRef.current === requestId) setResults(resolved)
    } catch {
      if (requestCounterRef.current === requestId) setResults([])
    } finally {
      if (requestCounterRef.current === requestId) setIsLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSearch = useCallback(debounce((value: string) => performSearch(value), 300), [
    performSearch
  ])

  useEffect(() => () => debounceSearch.cancel(), [debounceSearch])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    setSelected(-1)
    debounceSearch(value)
  }

  function handleClearQuery() {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setSelected(-1)
    debounceSearch.cancel()
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (results.length > 0 && selected >= 0 && selected < results.length) {
        e.preventDefault()
        closeModal()
        router.push(results[selected].url)
      } else {
        debounceSearch.cancel()
        performSearch(query)
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(prev => {
        if (!results.length) return prev
        return prev < results.length - 1 ? prev + 1 : 0
      })
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(prev => {
        if (!results.length) return prev
        return prev > 0 ? prev - 1 : results.length - 1
      })
    }
  }

  const showLoading = isLoading
  const showNoResults = hasSearched && !isLoading && results.length === 0 && !loadError
  const showResults = hasSearched && !isLoading && results.length > 0

  return (
    <Transition appear={true} show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-opacity/25 fixed inset-0 bg-black opacity-40" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="flex flex-col gap-0 w-full transform rounded-md divide-y md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] max-h-[80vh] bg-white text-left align-middle shadow-xl transition-all text-slate-800">
                {/* Search bar */}
                <div className={cn('flex items-center gap-3 p-4')}>
                  <div className={cn('grid place-items-center text-slate-500')}>
                    {!showLoading && <FiSearch className="text-2xl" />}
                    {showLoading && (
                      <div className="animate-spin">
                        <AiOutlineLoading3Quarters className="text-2xl" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    className="peer h-full w-full text-ellipsis bg-transparent pr-2 outline-none m2it-hide-wscb"
                    id="search"
                    type="search"
                    placeholder="Tìm bài viết..."
                    autoComplete="off"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                  {query && (
                    <button onClick={handleClearQuery}>
                      <IoCloseCircle className="h-5 w-5 text-slate-500" />
                    </button>
                  )}
                </div>

                {/* Error loading pagefind (e.g. index not yet built in dev) */}
                {loadError && (
                  <div className="p-4 text-center text-base">
                    Có lỗi trong quá trình tải dữ liệu, vui lòng thử lại hoặc liên hệ Math2IT!
                  </div>
                )}

                {/* No results */}
                {showNoResults && (
                  <div className="p-4 text-center text-base">Không tìm thấy bài viết phù hợp!</div>
                )}

                {/* Results list */}
                {showResults && (
                  <div className={cn('flex flex-col divide-y overflow-hidden')}>
                    <div
                      ref={containerRef}
                      className={cn(
                        'flex flex-col divide-y divide-slate-150 overflow-auto m2it-scrollbar'
                      )}
                    >
                      {results.map((item, index) => (
                        <Link
                          key={item.url}
                          href={item.url}
                          onClick={closeModal}
                          className={cn('flex gap-3 py-4 px-4 w-full', {
                            'bg-gray-100': selected === index
                          })}
                          onMouseMoveCapture={() => setSelected(index)}
                        >
                          <div className="mt-0.5">
                            <IoDocumentTextOutline className="text-xl opacity-80" />
                          </div>
                          <div className={cn('w-full flex flex-col text-slate-900 gap-1')}>
                            <div
                              className={cn('w-full text-base flex items-center justify-between')}
                            >
                              <div
                                className={cn(
                                  { 'pr-4 pb-1 border-b border-dashed': item.excerpt },
                                  'text-black font-medium'
                                )}
                              >
                                <span>{item.meta.title}</span>
                              </div>
                              <div
                                className={cn({
                                  visible: selected === index,
                                  invisible: selected !== index
                                })}
                              >
                                <BsArrowReturnLeft className="text-lg opacity-70" />
                              </div>
                            </div>
                            {item.excerpt && (
                              <div
                                className="text-sm opacity-90"
                                dangerouslySetInnerHTML={{ __html: item.excerpt }}
                              />
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="p-3 pl-4 text-sm font-normal text-slate-500">
                      {'Tìm thấy '}
                      <span className="font-semibold text-slate-900">{results.length}</span>
                      {' kết quả.'}
                    </div>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

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
      <SearchModal isOpen={isSearchOpen} closeModal={() => setIsSearchOpen(false)} />
    </>
  )
}
