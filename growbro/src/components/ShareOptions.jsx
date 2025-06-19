import React from 'react'
import { Share2, Facebook, Twitter, Mail, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ShareOptions = () => {
  const shareOptions = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook size={20} />,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        // Handle Facebook share
        console.log('Share to Facebook')
      },
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter size={20} />,
      color: 'bg-sky-500 hover:bg-sky-600',
      onClick: () => {
        // Handle Twitter share
        console.log('Share to Twitter')
      },
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail size={20} />,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => {
        // Handle Email share
        console.log('Share via Email')
      },
    },
    {
      id: 'link',
      name: 'Copy Link',
      icon: <Link2 size={20} />,
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => {
        // Handle Copy Link
        navigator.clipboard.writeText('https://example.com/refer?code=HDIPWM')
        toast.success('Link copied to clipboard!')
      },
    },
  ]

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
      <div className="flex items-center mb-4">
        <Share2 size={18} className="text-amber-600 mr-2" />
        <h2 className="text-md font-medium text-gray-800">
          Share with friends
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {shareOptions.map((option) => (
          <button
            key={option.id}
            onClick={option.onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-xl text-white ${option.color} transition-transform hover:scale-105`}
          >
            {option.icon}
            <span className="mt-1 text-xs">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ShareOptions
