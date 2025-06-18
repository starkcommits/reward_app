import React from 'react'
import { Outlet } from 'react-router-dom'
import { useFrappeAuth } from 'frappe-react-sdk'
import Navbar from './Navbar'
import { Briefcase, Home, Newspaper, Search, Wallet } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Newspaper, label: 'News', path: '/news' },
  { icon: Briefcase, label: 'Portfolio', path: '/portfolio' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
]

const Layout = () => {
  const { currentUser } = useFrappeAuth()
  return (
    <div className="min-h-screen flex flex-col">
      <div>
        <Outlet />
      </div>
      <div className="mt-auto sticky bottom-0 left-0 right-0 bg-white border-t border-[#C6C6C6]">
        {currentUser && <Navbar items={navItems} />}
      </div>
    </div>
  )
}

export default Layout
