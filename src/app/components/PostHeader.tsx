'use client'

import {
  anonymAuthor,
  defaultPostTypeOpts,
  getSlugPrefix,
  postWidthContainer
} from '@app/lib/config'
import DateComponent from '@/src/components/notion/DateComponent'
import PostHeaderTopics from '@/src/components/notion/PostHeaderTopics'
import SimpleImage from '@/src/components/notion/SimpleImage'
import { ImagePlaceholderPostHeader } from '@/src/components/notion/image-placeholders'
import AiOutlineClockCircle from '@/src/components/icons/AiOutlineClockCircle'
import { Author } from '@/src/types/notion'
import { useNotionContext } from '@/src/lib/notion/context'
import { usePostDateStatus } from '@/src/lib/notion/hooks'
import cn from 'classnames'
import { get } from 'lodash'
import Link from 'next/link'
import { ExtendedRecordMap } from 'notion-types'
import { getTextContent } from 'notion-utils'

import { getPostProperties } from '../lib/helpers'
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

  const ctx = useNotionContext()
  const { mapImageUrl } = ctx

  const id = Object.keys(recordMap.block)[0]
  const block = recordMap.block[id]?.value

  const {
    rawTitle: title,
    selected,
    createdDate,
    date: modifiedDate,
    tags,
    categories,
    coverPosition,
    pageCover
  } = getPostProperties(block)

  const pageCoverObjectPosition = `center ${coverPosition}%`
  let pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition]
  if (!pageCoverStyle) {
    pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition] = {
      objectPosition: pageCoverObjectPosition
    }
  }

  const status = usePostDateStatus(
    createdDate!,
    modifiedDate!,
    get(defaultPostTypeOpts, 'maxDaysWinthin', 7)
  )

  return (
    <>
      {block?.format?.page_cover && (
        <div className="flex w-full items-center justify-center h-[25vh] max-h-[25vh] min-h-[25vh]">
          <div className="relative flex h-full w-full items-center overflow-hidden">
            <SimpleImage
              src={mapImageUrl(pageCover as any, block)}
              alt={getTextContent(title)}
              className="notion-page-cover absolute"
              imagePlaceholder={ImagePlaceholderPostHeader()}
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
              'pt-1 text-left font-nunito text-4xl font-semibold leading-tight tracking-tight'
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

            <div className="flex items-center gap-1 text-[0.95rem] opacity-80">
              <AiOutlineClockCircle />
              <DateComponent
                humanize={true}
                dateString={createdDate!}
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
              {['updated', 'updatedWithin'].includes(status) && (
                <div
                  className={cn('px-3 py-0.5 text-sm items-start rounded-xl whitespace-nowrap', {
                    'text-slate-700 bg-gray-200': status === 'updated',
                    'text-green-900 bg-green-200': status === 'updatedWithin'
                  })}
                >
                  <DateComponent
                    dateLabel="cập nhật"
                    humanize={true}
                    dateString={modifiedDate!}
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

              {status === 'new' && (
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
