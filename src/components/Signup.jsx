'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, User, Lock, Mail, Calendar, MapPin, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import d1 from '../assets/images/b3.jpg'
import { toast } from 'react-hot-toast'
import apiClient from '../services/apiClient'
import AuthShell from '../features/auth/AuthShell'

export default function Signup() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthdate: '',
    address: {
      label: 'Home',
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
  })
  const [isLoading, setIsLoading] = useState(false)

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
      const { data } = await apiClient.post('/api/signup', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        birthdate: formData.birthdate || undefined,
        address: {
          label: formData.address.label.trim() || 'Home',
          line1: formData.address.line1.trim(),
          line2: formData.address.line2.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          country: formData.address.country.trim(),
          postalCode: formData.address.postalCode.trim(),
        },
      })
      toast.success(data?.message || 'Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      imageSrc={d1}
      imageAlt="Introvert Meetup"
      title="Create an Account"
      footer={(
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
            Full name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" aria-hidden />
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-4 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your full name"
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
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-10 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="At least 8 characters"
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
          <label htmlFor="birthdate" className="mb-2 block text-sm font-medium text-gray-300">
            Date of birth <span className="text-zinc-500">(optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" aria-hidden />
            <input
              id="birthdate"
              name="birthdate"
              type="date"
              autoComplete="bday"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 pl-10 pr-4 text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              value={formData.birthdate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700/80 bg-gray-800/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-200">
            <MapPin className="h-4 w-4 text-indigo-400" aria-hidden />
            Address <span className="text-rose-400">*</span>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            Street and city are required. We verify your address on the map at signup — use a real, searchable location (include area or postal code if needed).
          </p>
          <div className="space-y-3">
            <input
              name="label"
              type="text"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="Label (e.g. Home)"
              value={formData.address.label}
              onChange={handleAddressChange}
            />
            <input
              name="line1"
              type="text"
              required
              autoComplete="address-line1"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="Address line 1 *"
              value={formData.address.line1}
              onChange={handleAddressChange}
            />
            <input
              name="line2"
              type="text"
              autoComplete="address-line2"
              className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
              placeholder="Address line 2 (optional)"
              value={formData.address.line2}
              onChange={handleAddressChange}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              <input
                name="state"
                type="text"
                autoComplete="address-level1"
                className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
                placeholder="State / region (optional)"
                value={formData.address.state}
                onChange={handleAddressChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="postalCode"
                type="text"
                autoComplete="postal-code"
                className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
                placeholder="Postal code (optional)"
                value={formData.address.postalCode}
                onChange={handleAddressChange}
              />
              <input
                name="country"
                type="text"
                autoComplete="country"
                className="w-full rounded-lg border border-transparent bg-gray-800 py-2 px-3 text-sm text-white focus:border-transparent focus:ring-2 focus:ring-indigo-600"
                placeholder="Country (optional)"
                value={formData.address.country}
                onChange={handleAddressChange}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
            I agree to the{' '}
            <a href="/#blog" className="font-medium text-indigo-400 hover:text-indigo-300">
              Terms and Conditions
            </a>
          </label>
        </div>
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
                Processing…
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 shrink-0" aria-hidden />
                Sign up
              </>
            )}
          </motion.button>
        </div>
      </form>
    </AuthShell>
  )
}
