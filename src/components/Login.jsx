'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, User, Lock, Phone, Mail, MapPin } from 'lucide-react'
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
    name: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: {
      line1: '',
      city: '',
    },
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

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await apiClient.post('/api/login', {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || undefined,
        address: {
          line1: formData.address.line1.trim(),
          city: formData.address.city.trim(),
        },
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
          <label htmlFor="login-name" className="mb-2 block text-sm font-medium text-gray-300">
            Full name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" aria-hidden />
            <input
              id="login-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-4 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="As on your account"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
        </div>
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
        </div>
        <div>
          <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-gray-300">
            Phone number <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" aria-hidden />
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              autoComplete="tel"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-4 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="+91XXXXXXXXXX"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div>
          <label htmlFor="whatsappNumber" className="mb-2 block text-sm font-medium text-gray-300">
            WhatsApp number <span className="text-zinc-500">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" aria-hidden />
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              type="tel"
              autoComplete="tel"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-4 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="If different from phone"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700/80 bg-gray-800/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
            <MapPin className="h-4 w-4 text-indigo-400" aria-hidden />
            Confirm your saved address <span className="text-rose-400">*</span>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            Must match line 1 and city on your account (same as signup). Used with your name and phone for extra verification.
          </p>
          <div className="space-y-3">
            <input
              name="line1"
              type="text"
              required
              autoComplete="street-address"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="Address line 1 *"
              value={formData.address.line1}
              onChange={handleAddressChange}
            />
            <input
              name="city"
              type="text"
              required
              autoComplete="address-level2"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="City *"
              value={formData.address.city}
              onChange={handleAddressChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <LogIn className="mr-2" size={20} />
            {isLoading ? 'Signing in…' : 'Sign in'}
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
