import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Zap,
  DollarSign,
  Calendar,
  Info,
} from 'lucide-react'
import sound from '@/assets/ding.mp3'

const Notifications = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

  const notifications = [
    {
      id: '1',
      type: 'event',
      title: 'Bitcoin Price Prediction Ending Soon',
      message: 'Your prediction "Bitcoin to reach $50,000" ends in 2 hours',
      timestamp: '2024-03-06T14:30:00Z',
      status: 'urgent',
      icon: Calendar,
    },
    {
      id: '2',
      type: 'order',
      title: 'Trade Executed Successfully',
      message: 'Bought YES at ₹4.5 for "India vs England - 5th Test"',
      timestamp: '2024-03-06T14:15:00Z',
      status: 'success',
      icon: CheckCircle,
    },
    {
      id: '3',
      type: 'event',
      title: 'New Market Available',
      message: 'IPL 2024 prediction markets are now live',
      timestamp: '2024-03-06T13:45:00Z',
      status: 'info',
      icon: Zap,
    },
    {
      id: '4',
      type: 'order',
      title: 'Withdrawal Processed',
      message: 'Your withdrawal of ₹500 has been processed',
      timestamp: '2024-03-06T12:30:00Z',
      status: 'success',
      icon: DollarSign,
    },
    {
      id: '5',
      type: 'system',
      title: 'Account Security',
      message: 'Enable 2FA for enhanced account security',
      timestamp: '2024-03-06T10:00:00Z',
      status: 'warning',
      icon: Info,
    },
  ]

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true
    return notification.type === activeTab
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>

            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </div>

          {/* Stats Card */}
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl shadow-sm flex items-center justify-center">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Activity Center
                </h2>
                <p className="text-white/80">Stay updated with your trades</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm">
          {/* Tabs */}
          <div className="flex p-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700">
              Recent Activity
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="p-4">
                <div className="flex gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notification.status === 'urgent'
                        ? 'bg-rose-50 text-rose-600'
                        : notification.status === 'success'
                        ? 'bg-emerald-50 text-emerald-600'
                        : notification.status === 'warning'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <notification.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No Notifications
                </h3>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
