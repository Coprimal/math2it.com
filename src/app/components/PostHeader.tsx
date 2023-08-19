import { anonymAuthor, getSlugPrefix, postWidthContainer } from '@app/lib/config'
import cn from 'classnames'
import Link from 'next/link'
import Date from 'notion-nextjs-lib/dist/components/Date'
import PostHeaderCover from 'notion-nextjs-lib/dist/components/PostHeaderCover'
import PostHeaderTopics from 'notion-nextjs-lib/dist/components/PostHeaderTopics'
import { PostHeaderType } from 'notion-nextjs-lib/dist/interface'

import { defaultFeaturedImage } from '../lib/config'
import Container from './Container'

export const fullWidthPostCoverHeight = 'h-[25vh] max-h-[25vh] min-h-[25vh]'
export const gapHeaderItems = 'mb-3'

type PostHeaderProps = {
  postHeader: PostHeaderType
  hideWriteWithUs?: boolean
}

export const containerHeaderClass = 'max-w-full bg-slate-50 drop-shadow-sm py-4'

export default function PostHeader(props: PostHeaderProps) {
  const { title, featuredImage, date, authors, categories, tags, selected, bookCover } =
    props.postHeader

  return (
    <>
      {featuredImage && (
        <PostHeaderCover
          defaultCover={defaultFeaturedImage}
          cover={featuredImage}
          alt={`Hình đại diện của bài viết "${title}"`}
          coverHeight="h-[25vh] max-h-[25vh] min-h-[25vh]"
          bookCover={bookCover}
          altBookCover={`Bìa sách "${title}"`}
        />
      )}

      {/* Main header with infos */}
      <Container className={containerHeaderClass} maxWidthClass={postWidthContainer}>
        <header className="pb-4 pt-8">
          {/* Categories */}
          {!!categories && (
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
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {/* Authors & Date */}
          {(authors || date) && (
            <div
              className={cn(
                gapHeaderItems,
                '!mb-4 flex w-full flex-wrap gap-3 md:w-auto md:flex-nowrap items-center'
              )}
            >
              {authors && (
                <div className="flex items-center gap-2 text-base opacity-80">
                  {!!authors?.length && authors?.length > 1 && (
                    <i className="icon-users-outline"></i>
                  )}
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

              {date && (
                <div className="flex items-center gap-1 text-base opacity-80">
                  <i className="icon-clock"></i>
                  <Date dateString={date} />
                </div>
              )}

              {!props.hideWriteWithUs && (
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
          )}

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
