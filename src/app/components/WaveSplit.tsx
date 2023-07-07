import cn from 'classnames'
import * as React from 'react'

export default function WaveSplit() {
  return (
    <>
      {/* <div className={cn('bg-[#323541] h-8')}></div> */}
      <div
        className={cn('after:block after:h-8 after:w-full after:bg-wave dark:after:bg-wave-dark')}
      ></div>
      <div className={cn('h-8 bg-white')}></div>
    </>
  )
}
