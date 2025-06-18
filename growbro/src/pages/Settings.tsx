import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Globe, Moon, Volume2, Lock,
  Smartphone, Shield, HelpCircle, Info, ChevronRight,
  Languages, Wallet, LogOut
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    trades: true,
    news: true,
    predictions: false,
    marketing: false
  });
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);

  const settingSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Manage your notification preferences',
          path: '/settings/notifications',
          toggle: true,
          value: notifications.trades
        },
        {
          icon: Globe,
          label: 'Language',
          description: 'Choose your preferred language',
          value: 'English (US)',
          path: '/settings/language'
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          description: 'Switch between light and dark themes',
          toggle: true,
          value: darkMode,
          onChange: () => setDarkMode(!darkMode)
        },
        {
          icon: Volume2,
          label: 'Sound Effects',
          description: 'Enable or disable sound effects',
          toggle: true,
          value: sound,
          onChange: () => setSound(!sound)
        }
      ]
    },
    {
      title: 'Account & Security',
      items: [
        {
          icon: Lock,
          label: 'Security',
          description: 'Manage your account security',
          path: '/settings/security'
        },
        {
          icon: Smartphone,
          label: 'Connected Devices',
          description: 'Manage your connected devices',
          path: '/settings/devices'
        },
        {
          icon: Shield,
          label: 'Privacy',
          description: 'Control your privacy settings',
          path: '/settings/privacy'
        },
        {
          icon: Wallet,
          label: 'Payment Methods',
          description: 'Manage your payment options',
          path: '/settings/payment'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help with GrowBro',
          path: '/settings/help'
        },
        {
          icon: Info,
          label: 'About',
          description: 'App version and information',
          path: '/settings/about'
        }
      ]
    }
  ];

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

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
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl shadow-sm flex items-center justify-center">
                <Languages className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">App Settings</h2>
                <p className="text-white/80">Customize your experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm divide-y divide-gray-100">
          {settingSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-4">{section.title}</h3>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => item.onChange ? item.onChange() : handleNavigation(item.path)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                    {item.toggle ? (
                      <div 
                        className={`w-11 h-6 rounded-full relative transition-colors ${
                          item.value ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <div 
                          className={`absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-0.5'
                          } top-0.5`}
                        />
                      </div>
                    ) : item.value ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{item.value}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Sign Out Button */}
          <div className="p-4">
            <button 
              onClick={() => console.log('Sign out')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;