import React from 'react'
import { Outlet } from 'react-router-dom'
import { useFrappeAuth } from 'frappe-react-sdk'
import { FloatingDock } from './ui/floating-dock'
import {
  ArrowLeftRight,
  CalendarClock,
  Receipt,
  House,
  Bell,
} from 'lucide-react'
import Header from './Header'

const links = [
  {
    title: 'Home',
    icon: (
      <House className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: '/',
  },
  {
    title: 'Market',
    icon: (
      <CalendarClock className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: '/events',
  },

  {
    title: 'Notifications',
    // containerClassName: 'bg-yellow-50',
    icon: (
      <Bell className="h-full w-full  dark:text-neutral-300" />
    ),
    href: '/notification',
  },
  {
    title: 'Orders',
    icon: (
      <Receipt className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: '/orders',
  },
  {
    title: 'Trades',

    icon: (
      <ArrowLeftRight className="h-full w-full  text-neutral-500 dark:text-neutral-300" />
    ),
    href: '/trades',
  },
]

const Layout = () => {
  const { currentUser } = useFrappeAuth()
  console.log('outlet hello')
  return (
    <>
      <Header />
      <div className="mx-auto px-4 mt-16">
        <Outlet />
        <div className="relative">
          <div className="flex items-center justify-center h-[4rem] w-full fixed bottom-0 left-0 right-0 ">
            <FloatingDock
              mobileClassName="translate-y-20" // only for demo, remove for production
              items={links}
            />
          </div>
        </div>

        {/* <div className="">{currentUser && <div></div>}</div> */}
      </div>
    </>
  )
}

export default Layout
