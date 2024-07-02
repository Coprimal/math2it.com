'use client'

import cn from 'classnames'

import Giscus from '@giscus/react'
import Container from './Container'

const Comments = ({ className }: { className?: string }) => {
  return (
    <Container className={cn(className, 'max-w-3xl mt-8')}>
      <Giscus
        id="post-comments"
        repo="math2it/math2it-comments"
        repoId="R_kgDOMQ2h_g"
        category="Comments"
        categoryId="DIC_kwDOMQ2h_s4CghbU"
        mapping="title"
        term="Welcome!"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="light"
        lang="vi"
        loading="lazy"
      />
    </Container>
  )
}

export default Comments
