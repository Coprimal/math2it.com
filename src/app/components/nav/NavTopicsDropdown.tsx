'use client'

import { MenuAbout } from '@app/lib/config'
import { Popover, Transition } from '@headlessui/react'
import Link from 'next/link'
import { Fragment } from 'react'
import { FiChevronDown } from 'react-icons/fi'

import { menus } from './Nav'
import { menuItemCommonClass } from './NavTopicItem'

const dropdownItemClass = 'flex items-center p-3 whitespace-nowrap'

export default function NavTopicsDropdown() {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`
          ${open ? '!bg-slate-700 text-white' : 'text-opacity-90'}
          group ${
            menuItemCommonClass + ' flex lg:hidden !outline-none border border-slate-600 pr-1.5'
          }`}
          >
            <span>Chủ đề</span>
            <FiChevronDown
              className={`${open ? '' : 'text-opacity-70'}
                ml-1 h-6 w-6 transition duration-150 ease-in-out group-hover:text-opacity-80`}
              aria-hidden="true"
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className={`absolute left-0 z-10 mt-4 w-fit
                shadow-xl sm:px-0 lg:max-w-3xl`}
            >
              <div className="overflow-hidden rounded-lg shadow-lg">
                <div
                  className={`relative grid divide-y divide-slate-600
                    bg-[#323541] px-3 py-1 lg:grid-cols-2`}
                >
                  {menus.map(item => (
                    <Link key={item.id} href={item.uri} className={dropdownItemClass}>
                      <div className="flex gap-2">
                        <i className={item.navigationItems?.navIcon}></i>
                        {item.label}
                      </div>
                    </Link>
                  ))}
                  <Link
                    key={MenuAbout.id}
                    href={MenuAbout.uri}
                    className={`${dropdownItemClass} sm:hidden`}
                  >
                    <div className="flex gap-2">
                      <i className={MenuAbout.navigationItems?.navIcon}></i>
                      {MenuAbout.label}
                    </div>
                  </Link>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
