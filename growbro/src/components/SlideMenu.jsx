import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  User,
  Settings,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Moon,
  Gift,
  Star,
} from 'lucide-react'
import { useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'

const SlideMenu = ({ isOpen, onClose }) => {
  const { logout, currentUser } = useFrappeAuth()

  const [isDialogOpen, setDialogOpen] = useState(false)

  const { data: currentUserData, isLoading: currentUserDataLoading } =
    useFrappeGetDoc('User', currentUser)

  console.log(currentUserData)

  const navigate = useNavigate()

  const menuItems = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Update Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Moon, label: 'Dark Mode', toggle: true },
        { icon: Gift, label: 'Rewards', path: '/rewards' },
        { icon: Star, label: 'Premium', path: '/premium' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', path: '/help' },
        { icon: Shield, label: 'Privacy Policy', path: '/privacy' },
      ],
    },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="pt-safe-top px-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-indigo-600">ONO</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-0.5 bg-gradient-to-br w-8 h-8 from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                {currentUserData?.user_image ? (
                  <img
                    src={currentUserData.user_image}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xs font-medium text-white">
                    {currentUserData?.full_name?.split(' ')[0]?.[0]}
                    {currentUserData?.full_name?.split(' ')[1]?.[0]}
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-medium">{currentUserData?.full_name}</h2>
                <p className="text-sm text-gray-500">
                  {currentUserData?.username}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {menuItems.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="px-6 text-sm font-medium text-gray-500 mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={() => item.path && navigate(item.path)}
                      className="w-full px-6 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 text-gray-500 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.toggle ? (
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <div className="mt-auto border-t border-gray-100 p-6">
                <button className="w-full flex items-center text-rose-600 font-medium">
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to sign out?</DialogTitle>
                <DialogDescription>
                  You'll need to log in again to access your account.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <div className="w-full flex justify-end gap-4">
                  <button
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    onClick={async () => {
                      try {
                        await logout()
                        toast.success(
                          'You have been signed out of your account.'
                        )
                        setDialogOpen(false)
                      } catch (error) {
                        toast.error('Failed to sign out. Please try again.')
                      }
                    }}
                  >
                    Logout
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

export default SlideMenu
