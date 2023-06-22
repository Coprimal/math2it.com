'use client'

import useSWR from 'swr'

import PostList from './PostsList'

type RelatedPostsProps = {
  postId: string
}

export default function RelatedPosts(props: RelatedPostsProps) {
  const { data, error, isLoading } = useSWR({ postId: props.postId }, fetcher)

  return (
    <>
      <h3>Có thể bạn quan tâm?</h3>
      {data && !data.error && (
        <PostList
          posts={data}
          postType="PostTitleCateDate"
          postTypeOpts={{ hideCategory: true, hideDate: true }}
        />
      )}

      {isLoading && <div>loading...</div>}

      {error ||
        (data && data.error && (
          <div className="text-red">error: {error || (data && data.error)}</div>
        ))}
    </>
  )
}

const fetcher = async (params: { postId: string }) => {
  if (!params.postId || params.postId === '') return null
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  }
  const res = await fetch(`/api/related-posts?postId=${params.postId}&size=5`, {
    headers,
    method: 'GET'
  })
  const json = await res.json()
  return json
}
