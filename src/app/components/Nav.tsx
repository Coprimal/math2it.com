import { MenuItem } from '../../../interface'
import { MENUS, MenuAbout, MenuHome } from '../lib/config'
import NavAvatar from './NavAvatar'
import NavSearch from './NavSearch'
import NavTopicItem from './NavTopicItem'
import NavTopicsDropdown from './NavTopicsDropdown'

const navHeight = 'h-14'
export const paddingTopNav = 'pt-14' // Must be the same as navHeight!
const navClasses = 'bg-[#323541] shadow-transparent text-gray-300'
export const textClass = 'md:hover:text-white md:hover:bg-gray-700'
export const groupSpaceClass = 'ml-2 md:ml-4'

export const menus: MenuItem[] = MENUS

export default function Nav() {
  return (
    <>
      <div className={`sticky left-0 top-0 z-50 w-full ${navClasses} ${navHeight}`}>
        <div className="container mx-auto flex h-full flex-wrap items-center justify-items-stretch">
          <div className="w-full">
            <div
              className="mx-anav-
            uto px-4 lg:px-2"
            >
              <div className="relative flex items-center justify-between">
                <nav
                  className={`flex flex-1 items-center justify-center
                  gap-2 sm:gap-0 md:justify-start`}
                  aria-label="Menu"
                >
                  <NavAvatar />
                  <div className={groupSpaceClass}>
                    <div className="flex items-center sm:space-x-2">
                      <NavTopicItem
                        url={MenuHome.url}
                        label={MenuHome.label}
                        customClass="hidden sm:flex"
                      />
                      {menus?.map((item: MenuItem) => (
                        <NavTopicItem
                          url={item?.url as string}
                          label={item?.label}
                          key={item?.id}
                          customClass="hidden lg:flex"
                        />
                      ))}
                      <NavTopicsDropdown />
                      <NavTopicItem
                        url={MenuAbout.url}
                        label={MenuAbout.label}
                        customClass="hidden sm:flex"
                      />
                    </div>
                  </div>
                  <NavSearch />
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
