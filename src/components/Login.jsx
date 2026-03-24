'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import d1 from '../assets/images/b3.jpg'
import { toast } from 'react-hot-toast'
import OTPVerification from './OTPVerification'
import apiClient from '../services/apiClient'
import AuthShell from '../features/auth/AuthShell'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showOTP, setShowOTP] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!location.state?.from) return
    toast('Please sign in to continue.', { id: 'auth-required-redirect', icon: '🔐' })
  }, [location.state?.from])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await apiClient.post('/api/login', {
        email: formData.email.trim(),
        password: formData.password,
      })

      if (data?.devOtp) {
        toast.success(`Dev OTP: ${data.devOtp}`)
      }

      setUserEmail(formData.email.trim())
      setShowOTP(true)
      toast.success(data?.message || 'OTP sent to your email!')
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationComplete = () => {
    const from = location.state?.from
    if (from?.pathname) {
      navigate(`${from.pathname}${from.search || ''}${from.hash || ''}`, { replace: true })
    } else {
      navigate('/events', { replace: true })
    }
  }

  return (
    <AuthShell
      imageSrc={d1}
      imageAlt="Introvert Meetup"
      title="Welcome Back"
      footer={(
        <p className="mt-6 text-center text-sm text-gray-400">
          Not a member?{' '}
          <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign up now
          </Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
            Email <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" aria-hidden />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-4 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
            Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" aria-hidden />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-10 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="mt-1.5 text-right text-sm">
            <Link to="/forgot-password" className="font-medium text-indigo-400 hover:text-indigo-300">
              Forgot password?
            </Link>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          We&apos;ll email you a one-time code to finish signing in.
        </p>
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <LogIn className="mr-2" size={20} />
            {isLoading ? 'Sending code…' : 'Continue'}
          </motion.button>
        </div>
      </form>

      {showOTP && (
        <OTPVerification
          email={userEmail}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </AuthShell>
  )
}
