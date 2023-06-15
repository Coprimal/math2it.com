import {
  anonymAuthor,
  defaultBlurDataURL,
  postCoverCustomSizeFM,
  postWidthContainer
} from '@app/lib/config'
import defaultFeaturedImage from '@root/public/featured-images/default_bg.png'
import { PostHeaderType } from '@src/interface'
import cn from 'classnames'
import Image from 'next/image'
import Link from 'next/link'

import Container from './Container'
import Date from './Date'
import PostHeaderTopics from './PostHeaderTopics'

export const fullWidthPostCoverHeight = 'h-[33vh] max-h-[33vh] min-h-[33vh]'
export const gapHeaderItems = 'mb-3'

type PostHeaderProps = {
  postHeader: PostHeaderType
}

export default function PostHeader(props: PostHeaderProps) {
  const { title, featuredImage, date, authors, categories, tags, selected, bookCover } =
    props.postHeader

  const imgUrl =
    featuredImage?.sourceUrl ?? categories?.[0]?.featureImage?.sourceUrl ?? defaultFeaturedImage
  const imgBlurDataUrl = featuredImage?.blurDataURL ?? defaultBlurDataURL

  return (
    <>
      {/* Featured image */}
      <div className={cn('flex w-full items-center justify-center', fullWidthPostCoverHeight)}>
        {/* 👇 Because Image auto create position absolute, we have to wrap this with a relative div */}
        <div className="relative flex h-full w-full items-center overflow-hidden">
          <Image
            alt={`Hình đại diện của bài viết "${title}"`}
            src={imgUrl}
            className={cn('object-cover group-hover:scale-105 duration-500', {
              'blur-sm': !!bookCover,
              // Fix: blur image problem on the edge of the image
              'w-full': !bookCover,
              '!w-[calc(100%+10px)] !max-w-[calc(100%+10px)] !h-[calc(100%+10px)] !left-[-5px] !top-[-5px]':
                !!bookCover
            })}
            fill={true}
            sizes={postCoverCustomSizeFM}
            placeholder="blur"
            blurDataURL={imgBlurDataUrl}
            quality={100}
            loading="lazy"
          />
          {bookCover && (
            <div
              className={cn('absolute left-0 top-0 flex h-full w-full items-center justify-center')}
            >
              <Image
                alt={`Bìa sách "${title}"`}
                src={bookCover.sourceUrl ?? defaultFeaturedImage}
                className={cn('rounded-md shadow-xl h-4/5 w-auto')}
                width={175}
                height={100}
                placeholder="blur"
                blurDataURL={bookCover.blurDataURL}
                quality={100}
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main header with infos */}
      <Container maxWidth={postWidthContainer}>
        <header className="pb-4 pt-8">
          {/* Categories */}
          <div className={cn('w-full', gapHeaderItems)}>
            <PostHeaderTopics
              categories={categories}
              className="justify-start"
              selected={selected}
            />
          </div>

          {/* Title */}
          <h1
            className={cn(
              gapHeaderItems,
              'pt-1 text-left font-nunito text-4xl font-bold leading-tight tracking-tight'
            )}
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {/* Authors & Date */}
          <div
            className={cn(
              gapHeaderItems,
              '!mb-4 flex w-full flex-wrap gap-3 md:w-auto md:flex-nowrap'
            )}
          >
            <div className="flex gap-2 text-base opacity-80">
              {authors?.length && authors?.length > 1 && <i className="icon-users-outline"></i>}
              {authors?.length && authors?.length <= 1 && (
                <i className="icon-user-outline -mr-1"></i>
              )}
              <div>
                {authors?.length &&
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
            {date && (
              <div className="flex gap-1 text-base opacity-80">
                <i className="icon-clock"></i>
                <Date dateString={date} />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="justify-left flex items-center pb-2 pt-0">
            <PostHeaderTopics className="justify-left" tags={tags} />
          </div>
        </header>
      </Container>
    </>
  )
}
