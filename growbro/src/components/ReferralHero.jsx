import React from 'react'
import { Zap } from 'lucide-react'

const ReferralHero = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-6 pb-24 shadow-lg">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-yellow-300 opacity-20"></div>
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-yellow-300 opacity-20"></div>

      <div className="relative">
        {/* Instant Bonus header */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Zap size={20} className="text-amber-900" />
          <h2 className="text-amber-900 font-semibold tracking-wider">
            INSTANT BONUS
          </h2>
          <Zap size={20} className="text-amber-900" />
        </div>

        {/* Main reward text */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white drop-shadow-md animate-pulse">
            1 Invite = ₹50
          </h1>
        </div>

        {/* Money illustration */}
        <div className="mt-8 flex justify-center">
          <div className="flex overflow-visible space-x-[-10px]">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-20 bg-green-100 rounded-md border-2 border-green-600 flex justify-center items-center transform rotate-3 shadow-md"
                style={{
                  transform: `rotate(${(i - 1.5) * 5}deg)`,
                  zIndex: 4 - i,
                }}
              >
                <span className="text-green-800 font-semibold text-sm">
                  ₹500
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReferralHero
