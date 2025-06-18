import React, { useState } from 'react'
import { Copy, Check, Share2, X } from 'lucide-react'
import { useFrappeAuth, useFrappeGetCall } from 'frappe-react-sdk'

const ReferralCode = () => {
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const { currentUser } = useFrappeAuth()
  const { data: promotionalWalletData } = useFrappeGetCall(
    'frappe.client.get_list',
    {
      doctype: 'Promotional Wallet',
      filters: [['user', '=', currentUser]],
      fields: ['*'],
    }
  )

  const referralCode =
    promotionalWalletData?.message?.[0]?.referral_code || 'REFERCODE'
  const referralLink = `https://yourdomain.com/register?ref=${referralCode}`
  const referralMessage = `Join me on this amazing platform and get a discount on your first purchase. Use my referral code: ${referralCode} or click the link below!`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setShowConfetti(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)

    setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
  }

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      referralMessage + ' ' + referralLink
    )}`
    window.open(url, '_blank')
  }

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      referralMessage
    )}&url=${encodeURIComponent(referralLink)}`
    window.open(url, '_blank')
  }

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      referralLink
    )}&quote=${encodeURIComponent(referralMessage)}`
    window.open(url, '_blank')
  }

  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions)
    if (!showShareOptions) {
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
        <div className="mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Your Referral Code
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-wider text-gray-800">
              {referralCode}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            {copied ? (
              <>
                <Check size={18} className="mr-1" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={18} className="mr-1" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={toggleShareOptions}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-4 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            <Share2 size={20} className="mr-2" />
            Refer & Earn ₹50 Instantly
          </button>
        </div>

        {showShareOptions && (
          <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 font-medium">
                Share your referral code
              </h3>
              <button
                onClick={() => setShowShareOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-between gap-3">
              <ShareButton
                onClick={handleShareWhatsApp}
                label="WhatsApp"
                bgColor="bg-green-500"
                hoverColor="bg-green-600"
              />
              <ShareButton
                onClick={handleShareTwitter}
                label="Twitter"
                bgColor="bg-blue-400"
                hoverColor="bg-blue-500"
              />
              <ShareButton
                onClick={handleShareFacebook}
                label="Facebook"
                bgColor="bg-blue-600"
                hoverColor="bg-blue-700"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ShareButton = ({ onClick, label, bgColor, hoverColor }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded-lg text-white font-medium ${bgColor} hover:${hoverColor} transition-colors duration-200 flex items-center justify-center`}
    >
      {label}
    </button>
  )
}

const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {[...Array(50)].map((_, i) => {
        const size = Math.random() * 8 + 5
        const left = Math.random() * 100
        const animationDuration = Math.random() * 3 + 2
        const delay = Math.random() * 0.5
        const colors = [
          'bg-red-500',
          'bg-blue-500',
          'bg-green-500',
          'bg-yellow-500',
          'bg-purple-500',
          'bg-pink-500',
        ]
        const color = colors[Math.floor(Math.random() * colors.length)]

        return (
          <div
            key={i}
            className={`absolute rounded-sm animate-confetti ${color}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: '-20px',
              animationDuration: `${animationDuration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export default ReferralCode
