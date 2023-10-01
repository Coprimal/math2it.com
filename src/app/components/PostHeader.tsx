'use client'

import { anonymAuthor, getSlugPrefix, postWidthContainer } from '@app/lib/config'
import DateComponent from '@notion-x/src/components/DateComponent'
import PostHeaderTopics from '@notion-x/src/components/PostHeaderTopics'
import { LazyImage } from '@notion-x/src/components/lazy-image'
import AiOutlineClockCircle from '@notion-x/src/icons/AiOutlineClockCircle'
import { Author } from '@notion-x/src/interface'
import { useNotionContext } from '@notion-x/src/lib/context'
import { getCreatedDate, getModifedDate, isDateAfter, mapTag } from '@notion-x/src/lib/helpers'
import cn from 'classnames'
import Link from 'next/link'
import { ExtendedRecordMap } from 'notion-types'
import { getTextContent } from 'notion-utils'
import { useEffect, useState } from 'react'

import { getPredefinedCategories } from '../lib/helpers'
import Container from './Container'

export const fullWidthPostCoverHeight = 'h-[25vh] max-h-[25vh] min-h-[25vh]'
export const gapHeaderItems = 'mb-3'

type PostHeaderProps = {
  recordMap: ExtendedRecordMap
  authors: Author[]
  hideWriteWithUs?: boolean
}

export const containerHeaderClass = 'max-w-full bg-slate-50 drop-shadow-sm py-4'

const pageCoverStyleCache: Record<string, object> = {}

export default function PostHeader(props: PostHeaderProps) {
  const { authors, recordMap, hideWriteWithUs } = props

  const [isIn7Days, setIsIn7Days] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const ctx = useNotionContext()
  const { mapImageUrl } = ctx

  const id = Object.keys(recordMap.block)[0]
  const block = recordMap.block[id]?.value

  const title = block.properties?.title
  const selected = block.properties?.[`${process.env.NEXT_PUBLIC_ID_SELECTED}`]?.[0]?.[0] === 'Yes'

  const createdDate = getCreatedDate(block, process.env.NEXT_PUBLIC_ID_CREATED_DATE as string)
  const modifiedDate = getModifedDate(block, process.env.NEXT_PUBLIC_ID_LAST_MODIFIED as string)

  const tagNames = block.properties?.[`${process.env.NEXT_PUBLIC_ID_TAGS}`]?.[0]?.[0].split(',')
  const tags = tagNames?.map((tagName: string) => mapTag(tagName, getSlugPrefix('tag')))
  const categogyNames =
    block.properties?.[`${process.env.NEXT_PUBLIC_ID_CATEGORIES}`]?.[0]?.[0].split(',')
  const categories = getPredefinedCategories(categogyNames?.map((cat: string) => ({ name: cat })))

  const coverPosition = (1 - (block?.format?.page_cover_position || 0.5)) * 100
  const pageCoverObjectPosition = `center ${coverPosition}%`
  let pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition]
  if (!pageCoverStyle) {
    pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition] = {
      objectPosition: pageCoverObjectPosition
    }
  }

  useEffect(() => {
    const lastModifiedDate = new Date(modifiedDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - lastModifiedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays <= 7) {
      setIsIn7Days(true)
    }

    const cDate = new Date(createdDate!)
    const diffTime2 = Math.abs(today.getTime() - cDate.getTime())
    const diffDays2 = Math.ceil(diffTime2 / (1000 * 60 * 60 * 24))
    if (diffDays2 <= 7) {
      setIsNew(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {block?.format?.page_cover && (
        <div className="flex w-full items-center justify-center h-[25vh] max-h-[25vh] min-h-[25vh]">
          <div className="relative flex h-full w-full items-center overflow-hidden">
            <LazyImage
              src={mapImageUrl(block.format.page_cover as any, block)}
              alt={getTextContent(title)}
              priority={true}
              className="notion-page-cover absolute"
              style={pageCoverStyle}
            />
          </div>
        </div>
      )}

      {/* Main header with infos */}
      <Container className={containerHeaderClass} maxWidthClass={postWidthContainer}>
        <header className="pb-4 pt-8">
          {/* Categories */}
          {!!categories && !!categories.length && (
            <div className={cn('w-full', gapHeaderItems)}>
              <PostHeaderTopics
                categories={categories}
                className="justify-start"
                selectedName="Tuyển chọn"
                selectedUri={selected ? `/${getSlugPrefix('selected')}/` : undefined}
              />
            </div>
          )}

          {/* Title */}
          <h1
            className={cn(
              gapHeaderItems,
              'pt-1 text-left font-nunito text-4xl font-bold leading-tight tracking-tight'
            )}
          >
            {getTextContent(title)}
          </h1>

          {/* Authors & Date */}
          <div
            className={cn(
              gapHeaderItems,
              '!mb-4 flex w-full flex-wrap gap-3 md:w-auto md:flex-nowrap items-center'
            )}
          >
            {authors && (
              <div className="flex items-center gap-2 text-base opacity-80">
                {!!authors?.length && authors?.length > 1 && <i className="icon-users-outline"></i>}
                {((!!authors?.length && authors?.length <= 1) || !authors?.length) && (
                  <i className="icon-user-outline -mr-1"></i>
                )}
                <div>
                  {!!authors?.length &&
                    authors?.length >= 1 &&
                    authors.map((author, idx, authors) => (
                      <span key={author.uri}>
                        <Link className="hover:m2it-link-hover" href={author.uri || '/'}>
                          {author.name}
                        </Link>
                        {idx + 1 === authors.length ? ' ' : ' ◦ '}
                      </span>
                    ))}
                  {!authors?.length && (
                    <Link className="hover:m2it-link-hover" href={anonymAuthor.uri}>
                      {anonymAuthor.name}
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 text-base opacity-80">
              <AiOutlineClockCircle />
              <DateComponent
                humanize={true}
                dateString={createdDate}
                dateLabel="đăng"
                format="DD/MM/YYYY"
                humanizeOpts={{
                  today: 'hôm nay',
                  yesterday: 'hôm qua',
                  daysAgo: 'ngày trước',
                  weeksAgo: 'tuần trước',
                  monthsAgo: 'tháng trước'
                }}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
              {createdDate && !isNew && isDateAfter(modifiedDate, createdDate) && (
                <div
                  className={cn('px-3 py-0.5 text-sm items-start rounded-xl whitespace-nowrap', {
                    'text-slate-700 bg-slate-100': !isIn7Days,
                    'text-green-900 bg-green-200': isIn7Days
                  })}
                >
                  <DateComponent
                    dateLabel="cập nhật"
                    humanize={true}
                    dateString={modifiedDate}
                    format="DD/MM/YYYY"
                    humanizeOpts={{
                      today: 'hôm nay',
                      yesterday: 'hôm qua',
                      daysAgo: 'ngày trước',
                      weeksAgo: 'tuần trước',
                      monthsAgo: 'tháng trước'
                    }}
                  />
                </div>
              )}

              {isNew && (
                <div
                  className={cn(
                    'px-3 py-0.5 text-[0.8rem] rounded-xl whitespace-nowrap',
                    'bg-amber-200 text-amber-900'
                  )}
                >
                  bài mới
                </div>
              )}
            </div>

            {!hideWriteWithUs && (
              <div className="hidden md:block">
                <Link
                  className={cn(
                    'shadow-md text-white rounded-3xl hover:translate-y-[-2px] hover:transition-all',
                    'bg-gradient-to-r from-purple-700 to-pink-500',
                    'text-[0.85rem] h-fit w-fit block py-[2px] px-[15px]'
                  )}
                  href={`/${getSlugPrefix('viet-bai')}/`}
                >
                  ✍ Viết bài cùng Math2IT
                </Link>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags && (
            <div className="justify-left flex items-center pb-2 pt-0">
              <PostHeaderTopics className="justify-left" tags={tags} />
            </div>
          )}
        </header>
      </Container>
    </>
  )
}
