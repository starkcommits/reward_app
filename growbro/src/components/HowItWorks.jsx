import React, { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

const HowItWorks = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  const steps = [
    {
      id: 1,
      title: 'Share your referral code',
      description:
        'Share your unique referral code with friends through social media, messaging apps, or email.',
    },
    {
      id: 2,
      title: 'Friend signs up using your code',
      description:
        'When your friend registers using your referral code, they become your referral.',
    },
    {
      id: 3,
      title: 'Both of you get rewarded',
      description:
        'Once your friend completes their first transaction, both of you receive ₹50 instantly!',
    },
    {
      id: 4,
      title: 'Withdraw or use your earnings',
      description:
        'Transfer your earnings to your bank account or use them for your next purchase.',
    },
  ]

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-md font-medium text-gray-800">How it works?</h2>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex">
              <div className="mr-3 flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-600">
                  {step.id}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-100 flex items-start">
            <CheckCircle
              size={20}
              className="text-green-500 mr-2 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-green-800">
              There's no limit to how much you can earn! Keep referring and
              watch your earnings grow.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HowItWorks
