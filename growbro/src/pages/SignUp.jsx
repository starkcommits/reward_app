import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Gift,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useFrappeCreateDoc,
  useFrappeEventListener,
  useFrappeGetCall,
  useFrappePostCall,
} from 'frappe-react-sdk'
import { debounce, first } from 'lodash'

const SignUp = () => {
  const navigate = useNavigate()
  const { call: signUpCall } = useFrappePostCall('rewardapp.api.signup')
  const { call: validatePasswordCall } = useFrappePostCall(
    'rewardapp.api.check_password_strength'
  )
  const [passwordScore, setPasswordScore] = useState(-1)
  // const { createDoc } = useFrappeCreateDoc()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    referral_code: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    referral_code: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const debouncedValidatePassword = useCallback(
    debounce(async (password) => {
      if (!password) {
        setPasswordScore(-1)
        return
      }
      try {
        const result = await validatePasswordCall({ new_password: password })
        console.log(result)
        setPasswordScore(result.message.score) // Assuming the API returns a score or strength indicator
        // Assuming the API returns a score or strength indicator
        // You can set the password score here
      } catch (error) {
        console.error('Password validation error:', error)
      }
    }, 1000),
    [validatePasswordCall]
  )

  // Clear debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedValidatePassword.cancel()
    }
  }, [debouncedValidatePassword])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Update form state immediately for responsive UI
    setFormData((prev) => ({ ...prev, [name]: value }))

    setFormError((prev) => ({
      ...prev,
      [name]: '', // clear error for this specific field
    }))

    // Only debounce the password validation
    if (name === 'password') {
      debouncedValidatePassword(value)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirm_password) {
      toast.error(`Passwords do not match`)
      return
    }

    try {
      setIsLoading(true)

      // TODO: Implement actual registration
      const { confirm_password, ...dataToSend } = formData

      const response = await signUpCall(dataToSend)

      // const response = await createDoc('User', dataToSend)

      console.log('Response:', response)

      toast.success('Account created successfully!')

      setFormError({})

      setTimeout(() => {
        setIsLoading(false)
        navigate('/signin')
      }, 1500)
    } catch (err) {
      setFormError((prev) => {
        const newErrors = { ...prev }
        if (err.message.message?.split(': ')[1] === 'first_name') {
          newErrors.first_name = err.message.message?.split(': ')[0]
        }
        if (err.message.message?.split(': ')[1] === 'last_name') {
          newErrors.last_name = err.message.message?.split(': ')[0]
        }
        if (err.message.message?.split(': ')[1] === 'email') {
          newErrors.email = err.message.message?.split(': ')[0]
        }
        if (err.message.message?.split(': ')[1] === 'phone') {
          newErrors.phone = err.message.message?.split(': ')[0]
        }
        if (err.message.message?.split(': ')[1] === 'password') {
          newErrors.password = err.message.message?.split(': ')[0]
        }
        if (err.message.message?.split(': ')[1] === 'referral_code') {
          newErrors.password = err.message.message?.split(': ')[0]
        }
        return newErrors
      })
      toast.error(err.message.message, {
        duration: 4000,
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join GrowBro and start trading</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your first name"
                />
              </div>
              {formError.first_name && (
                <span className="text-red-500 text-sm">
                  {formError.first_name}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your last name"
                />
              </div>
              {formError.last_name && (
                <span className="text-red-500 text-sm">
                  {formError.last_name}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
              {formError.email && (
                <span className="text-red-500 text-sm">{formError.email}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
              {formError.phone && (
                <span className="text-red-500 text-sm">{formError.phone}</span>
              )}
            </div>

            <div>
              <div className="flex gap-2 justify-between">
                <label className="block text-sm font-medium text-gray-700 mb-2 w-[60%]">
                  Password
                </label>
                <div className="w-[40%]">
                  {passwordScore >= 0 && (
                    <div className="">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            passwordScore < 2 && 'text-red-600'
                          } ${passwordScore === 2 && 'text-yellow-600 '}  ${
                            passwordScore === 3 && 'text-green-600 '
                          }   ${passwordScore === 4 && 'text-blue-600 '}`}
                        >
                          {passwordScore < 2 ? 'Weak' : null}
                          {passwordScore === 2 ? 'Average' : null}
                          {passwordScore === 3 ? 'Strong' : null}
                          {passwordScore === 4 ? 'Excellent' : null}
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              passwordScore < 2 && 'bg-red-400 w-1/4'
                            } ${
                              passwordScore === 2 && 'bg-yellow-400 w-2/4'
                            }  ${
                              passwordScore === 3 && 'bg-green-400 w-3/4'
                            }   ${passwordScore === 4 && 'bg-blue-400 w-full'}`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                  required
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
              {formError.password && (
                <span className="text-red-500 text-sm">
                  {formError.password}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>
              {formError.confirm_password && (
                <span className="text-red-500 text-sm">
                  {formError.confirm_password}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <div className="relative">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="referral_code"
                  value={formData.referral_code}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter the referral code (optional)"
                />
              </div>
              {formError.referral_code && (
                <span className="text-red-500 text-sm">
                  {formError.referral_code}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
