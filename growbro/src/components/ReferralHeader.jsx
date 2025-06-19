import React from 'react';
import { ArrowLeft, Bell, Settings } from 'lucide-react';

const ReferralHeader = () => {
  return (
    <header className="bg-white px-4 py-3 shadow-sm">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-amber-50">
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="ml-2 text-lg font-semibold text-gray-800">Refer & Earn</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-amber-50">
              <Bell size={20} className="text-gray-700" />
            </button>
            <button className="p-2 rounded-full hover:bg-amber-50">
              <Settings size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ReferralHeader;