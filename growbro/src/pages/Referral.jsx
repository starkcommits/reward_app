import React, { useState } from 'react'
import ReferralHero from '../components/ReferralHero'
import EarningsTracker from '../components/EarningsTracker'
import ReferralCode from '../components/ReferralCode'
import ShareOptions from '../components/ShareOptions'
import TopInviters from '../components/TopInviters'
import HowItWorks from '../components/HowItWorks'
import { ArrowLeft, WalletIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Referral = () => {
  const navigate = useNavigate()

  return (
    <>
      <div className="px-6">
        <div className="">
          <div className="pt-2">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/wallet')}
                className="p-1.5 text-neutral-600 border rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-neutral-600">Referral</h1>
            </div>
          </div>
        </div>
        <ReferralHero />
        <div className="mt-6 mb-2 space-y-6">
          <EarningsTracker />
          <TopInviters />
          <ReferralCode />
          {/* <ShareOptions /> */}
          {/* <HowItWorks  /> */}
        </div>
      </div>
    </>
  )
}

export default Referral
