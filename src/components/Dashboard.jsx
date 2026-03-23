'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  ChevronRight,
  X,
  Search,
  Download,
  Phone,
  CheckCircle2,
  Clock,
  Ticket,
  ArrowUpRight,
  LayoutDashboard,
  RefreshCw,
  Loader2,
  BadgeCheck,
  AlertCircle,
  Hourglass,
  Gift,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import apiClient from '../services/apiClient'
import { getDisplayEventPhotoUrl } from '../utils/eventImage'

// ─── helpers ─────────────────────────────────────────────────────────────────

const PAYMENT_STATUS = {
  paid:    { label: 'Paid',    icon: BadgeCheck,  cls: 'text-emerald-300 bg-emerald-500/15 ring-emerald-500/30' },
  free:    { label: 'Free',    icon: Gift,        cls: 'text-sky-300     bg-sky-500/15     ring-sky-500/30'     },
  pending: { label: 'Pending', icon: Hourglass,   cls: 'text-amber-300  bg-amber-500/15   ring-amber-500/30'   },
  failed:  { label: 'Failed',  icon: AlertCircle, cls: 'text-rose-300   bg-rose-500/15    ring-rose-500/30'    },
}

function PaymentBadge({ status }) {
  const s = PAYMENT_STATUS[status] || PAYMENT_STATUS.free
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${s.cls}`}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  )
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500',
  'bg-rose-500',   'bg-amber-500',  'bg-emerald-500',
  'bg-sky-500',    'bg-teal-500',
]

function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function fmt(date) {
  return date
    ? new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
}

function fmtTime(date) {
  return date
    ? new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : ''
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/30"
    >
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 ${color}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} bg-opacity-20 ring-1 ring-white/10`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      </div>
    </motion.div>
  )
}

// ─── Participants Drawer ──────────────────────────────────────────────────────

function ParticipantsDrawer({ eventId, eventName, ticketPrice, onClose }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await apiClient.get(`/api/dashboard/events/${eventId}/participants`)
        setParticipants(data.participants || [])
      } catch {
        toast.error('Could not load participants')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId])

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase()
    return (
      !q ||
      p.fullName?.toLowerCase().includes(q) ||
      p.phoneNumber?.includes(q) ||
      p.paymentStatus?.includes(q)
    )
  })

  const revenue = participants
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((s, p) => s + (p.amountPaid || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/60 backdrop-blur-sm sm:items-start sm:pt-16"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative flex h-full w-full max-w-2xl flex-col bg-zinc-950 shadow-2xl sm:h-[calc(100vh-4rem)] sm:rounded-l-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{eventName}</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
              {ticketPrice > 0 && ` · ₹${revenue} collected`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-zinc-800/60 px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Search by name, phone, status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/60 py-2 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              {search ? `No results for "${search}"` : 'No participants yet.'}
            </p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm">
                <tr className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  <th className="px-6 py-3 w-8">#</th>
                  <th className="px-6 py-3">Participant</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Payment</th>
                  {ticketPrice > 0 && <th className="px-6 py-3">Amount</th>}
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map((p, idx) => (
                  <tr key={p._id} className="transition-colors hover:bg-zinc-900/60">
                    <td className="px-6 py-3.5 text-xs text-zinc-600">{idx + 1}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(p.fullName)}`}>
                          {initials(p.fullName)}
                        </span>
                        <span className="font-medium text-white">{p.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <a href={`tel:${p.phoneNumber}`} className="flex items-center gap-1.5 text-zinc-400 hover:text-indigo-300">
                        <Phone className="h-3 w-3 text-zinc-600" />
                        {p.phoneNumber}
                      </a>
                    </td>
                    <td className="px-6 py-3.5">
                      <PaymentBadge status={p.paymentStatus || 'free'} />
                    </td>
                    {ticketPrice > 0 && (
                      <td className="px-6 py-3.5 text-zinc-300">
                        {p.paymentStatus === 'paid' ? `₹${p.amountPaid || ticketPrice}` : '—'}
                      </td>
                    )}
                    <td className="px-6 py-3.5 text-xs text-zinc-500">{fmt(p.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {participants.length > 0 && (
          <div className="border-t border-zinc-800/60 px-6 py-3 flex items-center justify-between">
            <p className="text-xs text-zinc-600">
              Showing {filtered.length} of {participants.length}
            </p>
            {ticketPrice > 0 && (
              <p className="text-xs font-semibold text-emerald-400">Total collected: ₹{revenue}</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const CATEGORY_DOT = {
  Adventure: 'bg-emerald-500', Social: 'bg-sky-500',   Learning: 'bg-amber-500',
  Wellness:  'bg-violet-500',  Gaming: 'bg-rose-500',  Movies: 'bg-fuchsia-500',
  Other:     'bg-zinc-500',
}

const CATEGORIES_LIST = ['Adventure', 'Social', 'Learning', 'Wellness', 'Gaming', 'Movies', 'Other']
const SORT_OPTIONS = [
  { value: 'date_desc',      label: 'Date: Newest first' },
  { value: 'date_asc',       label: 'Date: Oldest first' },
  { value: 'participants',   label: 'Most participants' },
  { value: 'revenue',        label: 'Highest revenue' },
  { value: 'name_asc',       label: 'Name A → Z' },
]

export default function Dashboard() {
  const [stats, setStats]               = useState(null)
  const [events, setEvents]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [drawerEvent, setDrawerEvent]   = useState(null)

  // ── filter state ──────────────────────────────────────────────────────────
  const [search,        setSearch]        = useState('')
  const [categoryFilter,setCategoryFilter]= useState('all')   // 'all' | category name
  const [ticketFilter,  setTicketFilter]  = useState('all')   // 'all' | 'free' | 'paid'
  const [sortBy,        setSortBy]        = useState('date_desc')
  const [filtersOpen,   setFiltersOpen]   = useState(false)

  const activeFilterCount = [
    categoryFilter !== 'all',
    ticketFilter   !== 'all',
    search.trim()  !== '',
    sortBy         !== 'date_desc',
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setTicketFilter('all')
    setSortBy('date_desc')
  }

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await apiClient.get('/api/dashboard/stats')
      setStats(data.stats)
      setEvents(data.events)
    } catch {
      toast.error('Could not load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredEvents = React.useMemo(() => {
    let list = [...events]

    // search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q),
      )
    }

    // category
    if (categoryFilter !== 'all') {
      list = list.filter((e) => e.category === categoryFilter)
    }

    // ticket type
    if (ticketFilter === 'free')  list = list.filter((e) => (e.ticketPrice ?? 0) === 0)
    if (ticketFilter === 'paid')  list = list.filter((e) => (e.ticketPrice ?? 0) >  0)

    // sort
    list.sort((a, b) => {
      if (sortBy === 'date_asc')      return new Date(a.datetime) - new Date(b.datetime)
      if (sortBy === 'date_desc')     return new Date(b.datetime) - new Date(a.datetime)
      if (sortBy === 'participants')  return (b.participantCount ?? 0) - (a.participantCount ?? 0)
      if (sortBy === 'revenue')       return (b.revenue ?? 0) - (a.revenue ?? 0)
      if (sortBy === 'name_asc')      return a.name.localeCompare(b.name)
      return 0
    })

    return list
  }, [events, search, categoryFilter, ticketFilter, sortBy])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/25">
              <LayoutDashboard className="h-5 w-5 text-indigo-400" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white">Host Dashboard</h1>
              <p className="text-sm text-zinc-500">Your events at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Browse events
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Calendar}
            label="Events Hosted"
            value={stats?.totalEvents ?? 0}
            sub="Total events you created"
            color="bg-indigo-500"
            delay={0}
          />
          <KpiCard
            icon={Users}
            label="Total Participants"
            value={stats?.totalParticipants ?? 0}
            sub="Across all your events"
            color="bg-violet-500"
            delay={0.06}
          />
          <KpiCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            sub="From paid bookings"
            color="bg-emerald-500"
            delay={0.12}
          />
          <KpiCard
            icon={TrendingUp}
            label="Avg. Attendees"
            value={
              (stats?.totalEvents ?? 0) > 0
                ? Math.round((stats.totalParticipants / stats.totalEvents) * 10) / 10
                : 0
            }
            sub="Per event average"
            color="bg-amber-500"
            delay={0.18}
          />
        </div>

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/30"
        >
          {/* Table header */}
          <div className="border-b border-zinc-800/80 px-6 py-5 space-y-4">

            {/* Top row: title + search + toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">Your Events</h2>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
                  {filteredEvents.length}/{events.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    placeholder="Search events…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-44 rounded-lg border border-zinc-700/60 bg-zinc-800/60 py-2 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none"
                  />
                </div>

                {/* Filters toggle */}
                <button
                  onClick={() => setFiltersOpen((o) => !o)}
                  className={`relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    filtersOpen || activeFilterCount > 0
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                  {filtersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {/* Clear all */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Expandable filter row */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-start gap-6 pt-1 pb-2">

                    {/* Category pills */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Category</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['all', ...CATEGORIES_LIST].map((cat) => {
                          const active = categoryFilter === cat
                          const dot = CATEGORY_DOT[cat]
                          return (
                            <button
                              key={cat}
                              onClick={() => setCategoryFilter(cat)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                                active
                                  ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
                                  : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                              }`}
                            >
                              {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
                              {cat === 'all' ? 'All categories' : cat}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Ticket type */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Ticket type</p>
                      <div className="flex gap-1.5">
                        {[
                          { value: 'all',  label: 'All'  },
                          { value: 'free', label: '🎁 Free' },
                          { value: 'paid', label: '🎟️ Paid' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setTicketFilter(opt.value)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                              ticketFilter === opt.value
                                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
                                : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Sort by</p>
                      <div className="relative">
                        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="appearance-none rounded-lg border border-zinc-700/60 bg-zinc-800/80 py-1.5 pl-8 pr-8 text-xs text-white focus:border-indigo-500/60 focus:outline-none"
                        >
                          {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
                <Calendar className="h-6 w-6 text-zinc-500" />
              </span>
              <p className="font-medium text-zinc-400">
                {activeFilterCount > 0 ? 'No events match your filters' : "You haven't created any events yet"}
              </p>
              {activeFilterCount > 0 ? (
                <button onClick={clearFilters} className="mt-1 text-sm text-indigo-400 hover:text-indigo-300 hover:underline">
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/events"
                  className="mt-1 text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Go create one →
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Event</th>
                    <th className="px-6 py-3">Date & Time</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Capacity</th>
                    <th className="px-6 py-3">Participants</th>
                    <th className="px-6 py-3">Ticket</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredEvents.map((ev, idx) => {
                    const photo = getDisplayEventPhotoUrl(ev.photo, 80)
                    const dot   = CATEGORY_DOT[ev.category] || CATEGORY_DOT.Other
                    const fillPct = ev.maxAttendees > 0
                      ? Math.min(100, Math.round((ev.participantCount / ev.maxAttendees) * 100))
                      : 0

                    return (
                      <tr key={ev._id} className="group transition-colors hover:bg-zinc-800/30">
                        {/* # */}
                        <td className="px-6 py-4 text-xs text-zinc-600">{idx + 1}</td>

                        {/* Event name + photo */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {photo ? (
                              <img
                                src={photo}
                                alt=""
                                className="h-10 w-14 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-600">
                                <Calendar className="h-4 w-4" />
                              </div>
                            )}
                            <div>
                              <Link
                                to={`/event/${ev._id}`}
                                className="font-medium text-white transition hover:text-indigo-300"
                              >
                                {ev.name}
                              </Link>
                              {ev.address && (
                                <p className="text-[11px] text-zinc-500">{ev.address.city}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <p className="text-zinc-300">{fmt(ev.datetime)}</p>
                          <p className="text-[11px] text-zinc-500">{fmtTime(ev.datetime)}</p>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-zinc-300">
                            <span className={`h-2 w-2 rounded-full ${dot}`} />
                            {ev.category}
                          </span>
                        </td>

                        {/* Capacity bar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-700">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  fillPct >= 90 ? 'bg-rose-500' : fillPct >= 60 ? 'bg-amber-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500">{ev.maxAttendees}</span>
                          </div>
                        </td>

                        {/* Participant count */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                            <Users className="h-3.5 w-3.5 text-zinc-500" />
                            {ev.participantCount}
                          </span>
                          {ev.pendingCount > 0 && (
                            <p className="text-[11px] text-amber-400">{ev.pendingCount} pending</p>
                          )}
                        </td>

                        {/* Ticket price */}
                        <td className="px-6 py-4">
                          {(ev.ticketPrice ?? 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/30">
                              <Ticket className="h-3 w-3" />₹{ev.ticketPrice}
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400">Free</span>
                          )}
                        </td>

                        {/* Revenue */}
                        <td className="px-6 py-4 font-semibold text-emerald-400">
                          {ev.revenue > 0 ? `₹${ev.revenue.toLocaleString('en-IN')}` : <span className="text-zinc-600">—</span>}
                        </td>

                        {/* View participants */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setDrawerEvent({ _id: ev._id, name: ev.name, ticketPrice: ev.ticketPrice || 0 })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-zinc-700 transition hover:bg-zinc-700 hover:text-white"
                          >
                            Participants
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer */}
          {filteredEvents.length > 0 && (
            <div className="border-t border-zinc-800/60 px-6 py-3">
              <p className="text-xs text-zinc-600">
                Showing {filteredEvents.length} of {events.length} event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Participants drawer */}
      <AnimatePresence>
        {drawerEvent && (
          <ParticipantsDrawer
            eventId={drawerEvent._id}
            eventName={drawerEvent.name}
            ticketPrice={drawerEvent.ticketPrice}
            onClose={() => setDrawerEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
