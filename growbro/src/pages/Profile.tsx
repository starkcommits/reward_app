import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Mail, Phone, MapPin, Globe, 
  TrendingUp, Award, Target, ChevronRight, Shield,
  Edit2, Bell, Key, HelpCircle
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'trades'>('overview');

  const userStats = {
    winRate: 68,
    totalTrades: 156,
    avgReturn: 12.5,
    rank: 'Expert Trader',
    level: 4,
    xp: 2750,
    nextLevel: 3000
  };

  const recentAchievements = [
    { title: 'First Blood', description: 'Complete your first trade', icon: '🎯', date: '2024-03-01' },
    { title: 'Hot Streak', description: 'Win 5 trades in a row', icon: '🔥', date: '2024-02-28' },
    { title: 'High Roller', description: 'Place a trade worth ₹10,000', icon: '💰', date: '2024-02-25' }
  ];

  const settingsOptions = [
    { icon: Edit2, label: 'Edit Profile', path: '/profile/edit' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Key, label: 'Security', path: '/security' },
    { icon: Shield, label: 'Privacy', path: '/privacy' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' }
  ];

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
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-white">JD</span>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">John Doe</h2>
              <div className="flex items-center gap-2 text-white/80">
                <Mail className="h-4 w-4" />
                <span className="text-sm">john.doe@example.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{userStats.winRate}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{userStats.totalTrades}</div>
              <div className="text-xs text-gray-500">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">+{userStats.avgReturn}%</div>
              <div className="text-xs text-gray-500">Avg. Return</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="font-medium">{userStats.rank}</span>
              </div>
              <span className="text-sm text-gray-500">Level {userStats.level}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(userStats.xp / userStats.nextLevel) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{userStats.xp} XP</span>
              <span>{userStats.nextLevel} XP</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-2 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'trades'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Trade History
            </button>
          </div>

          {activeTab === 'overview' ? (
            <>
              {/* Recent Achievements */}
              <div className="p-4 border-t border-gray-100">
                <h3 className="font-semibold mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-gray-500">{achievement.description}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(achievement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="p-4 border-t border-gray-100">
                <h3 className="font-semibold mb-4">Settings</h3>
                <div className="space-y-2">
                  {settingsOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(option.path)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <option.icon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 border-t border-gray-100">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Trade History Coming Soon</h3>
                <p className="text-sm text-gray-500">We're working on this feature</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;