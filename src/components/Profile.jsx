'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Camera, Trash2, MapPin, Save, ArrowLeft, Pencil, Loader2, LogOut, Mail, Phone, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { clearSession, getAuthToken, getCurrentUser, setSession } from '../utils/session'
import { disconnectSocket } from '../utils/socket'
import apiClient from '../services/apiClient'
import { lookingForOptions } from '../features/profile/constants'
import AddressFormModal from './AddressFormModal'

/** Open Google Maps for a saved address (coordinates preferred, else text search). */
function buildAddressMapHref(addr) {
  const lat = addr.geocode?.lat
  const lng = addr.geocode?.lng
  if (lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
  }
  const text =
    String(addr.formattedAddress || '').trim() ||
    [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`
}

export default function Profile() {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
    lookingFor: [],
  })

  const fileInputRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarBroken, setAvatarBroken] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  useEffect(() => {
    const token = getAuthToken()
    const currentUser = getCurrentUser()

    if (!token) {
      navigate('/login')
      return
    }

    if (currentUser) {
      setProfileData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phoneNumber || prev.phone,
      }))
    }

    const loadProfile = async () => {
      try {
        const { data } = await apiClient.get('/api/profile')
        setProfileData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phoneNumber || prev.phone,
          avatar: data.profile?.avatar ?? prev.avatar,
          lookingFor: data.profile?.lookingFor ?? prev.lookingFor,
        }))
        if (Array.isArray(data.addresses)) {
          setAddresses(data.addresses)
        } else {
          try {
            const { data: list } = await apiClient.get('/api/addresses')
            setAddresses(Array.isArray(list) ? list : [])
          } catch (err) {
            toast.error(err.response?.data?.message || 'Could not load saved addresses')
          }
        }
        setSession({
          token,
          user: {
            _id: data._id,
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            whatsappNumber: data.whatsappNumber,
            dateOfBirth: data.dateOfBirth,
          },
        })
      } catch {
        toast.error('Could not load profile from server')
      }
    }

    loadProfile()
  }, [navigate])

  useEffect(() => {
    setAvatarBroken(false)
  }, [profileData.avatar])

  const handleAddressSaved = (saved) => {
    setAddresses((prev) => {
      const idx = prev.findIndex((a) => a._id === saved._id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      await apiClient.delete(`/api/addresses/${addressId}`)
      setAddresses((prev) => prev.filter((a) => a._id !== addressId))
      toast.success('Address deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData((prev) => ({
          ...prev,
          avatar: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleLookingFor = (option) => {
    setProfileData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option.id)
        ? prev.lookingFor.filter((id) => id !== option.id)
        : [...prev.lookingFor, option.id],
    }))
  }

  const handleSave = async () => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }

    setIsSaving(true)
    try {
      const { data } = await apiClient.put('/api/profile', {
        profile: {
          avatar: profileData.avatar,
          lookingFor: profileData.lookingFor,
        },
      })

      setSession({
        token,
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          whatsappNumber: data.whatsappNumber,
          dateOfBirth: data.dateOfBirth,
        },
      })

      setProfileData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phoneNumber || prev.phone,
        avatar: data.profile?.avatar ?? prev.avatar,
        lookingFor: data.profile?.lookingFor ?? prev.lookingFor,
      }))

      toast.success('Profile saved')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    disconnectSocket()
    clearSession()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const inputReadonly =
    'w-full rounded-xl border border-zinc-700/60 bg-zinc-950/50 px-3 py-2.5 text-left text-sm text-zinc-200 cursor-not-allowed'

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 pt-24 text-zinc-100 sm:pt-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,102,241,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_40%,rgba(139,92,246,0.06),transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/50 shadow-2xl ring-1 ring-white/[0.04] backdrop-blur-sm"
        >
          <div className="border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 to-zinc-950/90 px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative shrink-0">
                <div
                  className="absolute inset-0 -m-2 rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 blur-xl"
                  aria-hidden
                />
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 ring-2 ring-zinc-700/80 sm:h-32 sm:w-32">
                  {profileData.avatar && !avatarBroken ? (
                    <img
                      src={profileData.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setAvatarBroken(true)}
                    />
                  ) : (
                    <span className="text-3xl font-semibold text-indigo-200 sm:text-4xl">
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg ring-2 ring-zinc-900 transition hover:from-indigo-500 hover:to-violet-500">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-zinc-800/80">
            <section className="px-6 py-6 sm:px-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact</h2>
              <p className="mt-1 text-sm text-zinc-600">From your account — update via support if something is wrong.</p>
              <div className="mt-5 space-y-4">
                <div className="flex gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-4 py-3">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Name</p>
                    <input type="text" value={profileData.name} readOnly disabled className={`${inputReadonly} mt-1 border-0 bg-transparent p-0`} />
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-4 py-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Email</p>
                    <input type="email" value={profileData.email} readOnly disabled className={`${inputReadonly} mt-1 border-0 bg-transparent p-0`} />
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-4 py-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Phone</p>
                    <input type="tel" value={profileData.phone} readOnly disabled className={`${inputReadonly} mt-1 border-0 bg-transparent p-0`} />
                  </div>
                </div>
              </div>
            </section>

            <section className="px-6 py-6 sm:px-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">What you&apos;re here for</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Meetups, friends, hobbies — we use this to suggest events and people you might click with.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {lookingForOptions.map((option) => {
                  const on = profileData.lookingFor.includes(option.id)
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleLookingFor(option)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        on
                          ? 'border-indigo-500/45 bg-indigo-500/10 text-indigo-100 ring-1 ring-indigo-500/20'
                          : 'border-zinc-800/80 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-lg" aria-hidden>
                        {option.icon}
                      </span>
                      {option.label}
                    </motion.button>
                  )
                })}
              </div>
            </section>

            <section className="px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  Your addresses
                </h2>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingAddress(null)
                    setShowAddressModal(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add address
                </motion.button>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-4 space-y-2 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/30 py-8 px-4 text-center text-sm text-zinc-600">
                  <p>No addresses on your profile yet.</p>
                  <p className="text-xs text-zinc-500">
                    If you signed up before map verification, use &quot;Add address&quot; with a full street and city so we can confirm it on the map.
                    New signups store the address from registration here automatically.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {addresses.map((addr) => (
                    <li
                      key={addr._id}
                      className="flex items-stretch gap-2 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-1 sm:gap-3"
                    >
                      <a
                        href={buildAddressMapHref(addr)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 rounded-lg px-3 py-3 text-left outline-none ring-indigo-500/0 transition hover:bg-zinc-800/50 hover:ring-1 hover:ring-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                            {addr.label || 'Address'}
                          </span>
                          <span className="text-[11px] font-medium text-emerald-400/90">Open in Maps →</span>
                        </div>
                        <p className="text-sm font-medium text-white">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {[addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')}
                        </p>
                      </a>
                      <div className="flex shrink-0 flex-col justify-start gap-1 border-l border-zinc-800/60 pl-1 sm:flex-row sm:items-start sm:border-l-0 sm:pl-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingAddress(addr)
                            setShowAddressModal(true)
                          }}
                          className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-800 hover:text-indigo-300"
                          aria-label="Edit address"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteAddress(addr._id)
                          }}
                          className="rounded-xl p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                          aria-label="Delete address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950/50 px-6 py-3 text-sm font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/35 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving…' : 'Save changes'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSaved={handleAddressSaved}
        editAddress={editingAddress}
      />
    </div>
  )
}
