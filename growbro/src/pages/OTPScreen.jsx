import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { REGEXP_ONLY_DIGITS_AND_CHARS, REGEXP_ONLY_DIGITS } from 'input-otp'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  useFrappeAuth,
  useFrappeGetDoc,
  useFrappePostCall,
} from 'frappe-react-sdk'
import { useLocation, useNavigate } from 'react-router-dom'

const OTPScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { mobile_no } = location.state || {}

  const [otp, setOtp] = useState('')

  const {
    data: userMobileOTP,
    isLoading: userMobileOTPLoading,
    mutate: refetchMobileOTPData,
  } = useFrappeGetDoc('Mobile OTP', mobile_no, mobile_no ? undefined : null)

  console.log('USer: ', userMobileOTP)

  const { call: verifyOTP } = useFrappePostCall('rewardapp.api.verify_otp')
  const { call: generateOTP } = useFrappePostCall(
    'rewardapp.api.generate_mobile_otp'
  )

  const [timeLeft, setTimeLeft] = useState(0)

  const [resendEnabled, setResendEnabled] = useState(timeLeft === 0)

  useEffect(() => {
    if (!userMobileOTP?.expires_at) return

    const expiryTimestamp = new Date(userMobileOTP.expires_at).getTime()
    const updateTimeLeft = () => {
      const now = Date.now()
      const remaining = Math.floor((expiryTimestamp - now) / 1000)
      setTimeLeft(remaining > 0 ? remaining : 0)
      setResendEnabled(remaining <= 0)
    }

    updateTimeLeft()
    const interval = setInterval(() => {
      updateTimeLeft()
    }, 1000)

    return () => clearInterval(interval)
  }, [userMobileOTP?.expires_at])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleResend = () => {
    // TODO: Trigger resend OTP API here
    generateOTP({
      mobile_number: mobile_no,
    })
      .then(() => {
        setResendEnabled(false)
        refetchMobileOTPData()
      })
      .catch((err) => {
        console.log('error:', err)
        toast.error('Error occured while generating otp')
      })
    // You need to re-fetch the Mobile OTP document or invalidate cache
  }

  const handleVerifyOTP = async () => {
    try {
      const response = await verifyOTP({
        mobile: mobile_no,
        otp: otp,
      })
      console.log('Response: ', response)
      if (response?.message?.user_exist === true) {
        navigate('/')
      } else {
        console.log('Hellowwwwwwwwwwwwwwwwwww')
        navigate('/got-referral-code')
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.message?.message || 'error in validating the otp')
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Enter Verification Code
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit code to your registered whatsapp number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleVerifyOTP()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={!resendEnabled}
                >
                  Resend OTP
                </Button>
                {!resendEnabled && (
                  <span className="ml-2 text-sm text-gray-500">
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={otp.length !== 6}>
                Verify OTP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default OTPScreen
