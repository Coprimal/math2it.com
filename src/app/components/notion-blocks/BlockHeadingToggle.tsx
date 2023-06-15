'use client'

import { Disclosure } from '@headlessui/react'
import cn from 'classnames'
import { BsFillCaretRightFill } from 'react-icons/bs'

type BlockHeadingToggleProps = {
  headingElement: JSX.Element
  children: React.ReactNode
}

export default function BlockHeadingToggle(props: BlockHeadingToggleProps) {
  return (
    <Disclosure defaultOpen={false}>
      {({ open }) => (
        <>
          <div className="flex w-full items-center py-1">
            <Disclosure.Button className="rounded-md p-1 hover:bg-[#99989824]">
              <BsFillCaretRightFill
                className={cn('transform ease-in-out transition-all duration-[400ms] text-lg', {
                  'rotate-90': open,
                  'rotate-0': !open
                })}
              />
            </Disclosure.Button>
            {props.headingElement}
          </div>
          <Disclosure.Panel className="pb-4 pr-4">
            <div className="-my-2 pl-6">{props.children}</div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
