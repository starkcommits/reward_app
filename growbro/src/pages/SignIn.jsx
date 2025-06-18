import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react'
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk'
import toast from 'react-hot-toast'
const SignIn = () => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  // const [password, setPassword] = useState('')
  // const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState(null)
  // const { login, isLoading } = useFrappeAuth()

  const [loading, setLoading] = useState(false)

  const { call: generateOTP } = useFrappePostCall(
    'rewardapp.api.generate_mobile_otp'
  )

  // const [screen, setScreen] = useState('sign_in')

  const sendOTP = async (e) => {
    e.preventDefault()
    setLoginError(null)
    try {
      // await login({
      //   username: email,
      //   password: password,
      // })
      setLoading(true)
      await generateOTP({
        mobile_number: phone,
      })
      navigate('/otp', { state: { mobile_no: phone } })
      setLoading(false)
    } catch (error) {
      console.error('Login error:', error)
      setLoginError(error.message.message || 'Login failed. Please try again.')
      toast.error('Login failed. Please try again.')
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      <div className="bg-indigo-600 pt-safe-top pb-8">
        {/* <div className="px-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div> */}
      </div>
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="text-center mb-8">
            {/* <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h1> */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Get Started
            </h1>
            {/* <span>Login or Signup</span> */}
          </div>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
              {loginError}
            </div>
          )}
          <form onSubmit={sendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your whatsapp phone number"
                />
              </div>
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter the OTP"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div> */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending OTP' : 'Get OTP'}
            </button>
          </form>
          {/* <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Sign Up
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  )
}
export default SignIn
