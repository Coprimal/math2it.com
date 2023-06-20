'use client'

/* eslint-disable @next/next/no-img-element */
import { BookmarkBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import cn from 'classnames'
import useSWR from 'swr'

export default function BlockBookmark(props: {
  block: BookmarkBlockObjectResponse
  level: number
  className?: string
}) {
  const { data, error, isLoading } = useSWR({ url: props.block.bookmark?.url }, fetcher)

  return (
    <>
      {data && !data.error && (
        <a
          className={cn(
            'flex w-full overflow-hidden rounded-md border border-slate-200 p-3',
            'hover:cursor-pointer hover:border-sky-300 hover:shadow-sm'
          )}
        >
          <div className="flex flex-[4_1_180px] flex-col justify-between gap-4 overflow-hidden">
            <div className="flex flex-col gap-1.5">
              <div className="truncate font-normal">{data.title}</div>
              <div className="truncate text-sm font-normal text-slate-600">{data.description}</div>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative h-4 w-4">
                <img className="h-full w-full" src={data.favicon} alt={data.title} />
              </div>
              <div className="text-sm font-normal text-slate-500">{data.url}</div>
            </div>
          </div>
          {data.imageSrc && (
            <div className="relative hidden flex-[1_1_100px] sm:block">
              <img className="h-full w-full" src={data.imageSrc} alt={data.title} />
            </div>
          )}
        </a>
      )}

      {isLoading && (
        <div
          className={cn(
            'flex gap-2 h-32 w-full rounded-md border border-slate-200 p-3 animate-pulse'
          )}
        >
          <div className={cn('flex h-full w-3/4 flex-col justify-between gap-4')}>
            <div className={cn('flex flex-col gap-2')}>
              <div className={cn('animate-pulse bg-slate-200 h-5 w-full rounded-lg')}></div>
              <div className={cn('animate-pulse bg-slate-200 h-3 w-3/4 rounded-md')}></div>
            </div>
            <div className={cn('flex items-center gap-1')}>
              <div className={cn('animate-pulse bg-slate-200 h-4 w-4 rounded-full')}></div>
              <div className={cn('animate-pulse bg-slate-200 h-4 w-1/4 rounded-lg')}></div>
            </div>
          </div>

          <div className={cn('relative hidden h-full w-1/4 sm:block')}>
            <div className={cn('animate-pulse bg-slate-200 h-full w-full rounded-lg')}></div>
          </div>
        </div>
      )}

      {error ||
        (data && data.error && props.block.bookmark?.url && (
          <div className={props.className}>
            👉{' '}
            <a target="_blank" href={props.block.bookmark?.url}>
              {props.block.bookmark?.url}
            </a>
          </div>
        ))}
    </>
  )
}

const fetcher = async (params: { url: string }) => {
  if (!params.url || params.url === '') return null
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  }
  const res = await fetch(`/api/get-url-preview?url=${params.url}`, {
    headers,
    method: 'GET'
  })
  const json = await res.json()
  return json
}
