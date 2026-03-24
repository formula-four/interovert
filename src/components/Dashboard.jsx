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
  Phone,
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
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import apiClient from '../services/apiClient'
import { getDisplayEventPhotoUrl } from '../utils/eventImage'
import { DashboardPageSkeleton, ParticipantsTableSkeleton } from './ui/Skeleton'

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

// ─── KPI Card ───────────────────────────────────────────────────────────────

const KPI_ACCENT = {
  indigo:  'from-indigo-500/20 to-violet-500/10 text-indigo-300 ring-indigo-400/25',
  violet:  'from-violet-500/20 to-fuchsia-500/10 text-violet-300 ring-violet-400/25',
  emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 ring-emerald-400/25',
  amber:   'from-amber-500/20 to-orange-500/10 text-amber-300 ring-amber-400/25',
}

function KpiCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
  const accentCls = KPI_ACCENT[accent] || KPI_ACCENT.indigo
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 28 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 shadow-lg shadow-black/20 ring-1 ring-white/[0.04] transition-shadow duration-300 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-indigo-950/25"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{
          background: accent === 'indigo'
            ? 'linear-gradient(135deg, rgb(99 102 241 / 0.5), rgb(139 92 246 / 0.2))'
            : accent === 'violet'
              ? 'linear-gradient(135deg, rgb(139 92 246 / 0.5), rgb(217 70 239 / 0.2))'
              : accent === 'emerald'
                ? 'linear-gradient(135deg, rgb(16 185 129 / 0.45), rgb(20 184 166 / 0.2))'
                : 'linear-gradient(135deg, rgb(245 158 11 / 0.45), rgb(249 115 22 / 0.2))',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <p className="mt-2.5 truncate text-3xl font-bold tracking-tight text-white tabular-nums">{value}</p>
          {sub && <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{sub}</p>}
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentCls} ring-1 backdrop-blur-sm`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
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
      className="fixed inset-0 z-50 flex items-end justify-end bg-zinc-950/75 backdrop-blur-md sm:items-start sm:pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-zinc-800/80 bg-gradient-to-b from-zinc-900/95 to-zinc-950 shadow-2xl shadow-indigo-950/20 ring-1 ring-white/[0.04] sm:h-[calc(100vh-5rem)] sm:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
        {/* Header */}
        <div className="relative flex items-start justify-between border-b border-zinc-800/80 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400/90">Guest list</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">{eventName}</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
              {ticketPrice > 0 && (
                <span className="text-emerald-400/90"> · ₹{revenue} collected</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 ring-1 ring-zinc-700/50 transition hover:bg-zinc-800/80 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative border-b border-zinc-800/60 px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Search by name, phone, status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-700/50 bg-zinc-950/50 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <ParticipantsTableSkeleton rows={8} />
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              {search ? `No results for "${search}"` : 'No participants yet.'}
            </p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
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
                  <tr key={p._id} className="transition-colors hover:bg-indigo-500/[0.04]">
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
      <div className="relative min-h-screen overflow-hidden bg-zinc-950 pt-28 text-zinc-100">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_40%,rgba(139,92,246,0.09),transparent_45%)]"
          aria-hidden
        />
        <DashboardPageSkeleton />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 pt-28 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_40%,rgba(139,92,246,0.09),transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">

        {/* Page header — matches Events page rhythm */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col gap-6 border-b border-zinc-800/80 pb-10 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400/90">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Host insights
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-zinc-400">
              Track attendance, revenue, and capacity across every event you host—clear, calm, and in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700/80 bg-zinc-900/60 px-5 py-3 text-sm font-semibold text-zinc-200 shadow-sm ring-1 ring-white/[0.04] backdrop-blur-sm transition hover:border-zinc-600 hover:bg-zinc-800/80 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-violet-500"
              >
                Browse events
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.span>
          </div>
        </motion.header>

        {/* KPI Cards */}
        <div className="mb-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Calendar}
            label="Events hosted"
            value={stats?.totalEvents ?? 0}
            sub="Total events you created"
            accent="indigo"
            delay={0}
          />
          <KpiCard
            icon={Users}
            label="Total participants"
            value={stats?.totalParticipants ?? 0}
            sub="Across all your events"
            accent="violet"
            delay={0.06}
          />
          <KpiCard
            icon={IndianRupee}
            label="Total revenue"
            value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            sub="From paid bookings"
            accent="emerald"
            delay={0.12}
          />
          <KpiCard
            icon={TrendingUp}
            label="Avg. attendees"
            value={
              (stats?.totalEvents ?? 0) > 0
                ? Math.round((stats.totalParticipants / stats.totalEvents) * 10) / 10
                : 0
            }
            sub="Per event average"
            accent="amber"
            delay={0.18}
          />
        </div>

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 320, damping: 28 }}
          className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/85 to-zinc-950 shadow-xl shadow-black/25 ring-1 ring-white/[0.04]"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/35 to-transparent"
            aria-hidden
          />
          {/* Table header */}
          <div className="border-b border-zinc-800/80 px-5 py-5 sm:px-6 space-y-4">

            {/* Top row: title + search + toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/25">
                  <LayoutDashboard className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white">Your events</h2>
                  <p className="text-xs text-zinc-500">Manage listings and guest lists</p>
                </div>
                <span className="rounded-full bg-zinc-950/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-400 ring-1 ring-zinc-800">
                  {filteredEvents.length}/{events.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-[10rem] flex-1 sm:flex-initial sm:min-w-[11rem]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    placeholder="Search events…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-950/40 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 backdrop-blur-sm focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/25"
                  />
                </div>

                {/* Filters toggle */}
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  className={`relative inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                    filtersOpen || activeFilterCount > 0
                      ? 'border-indigo-500/45 bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-500/20'
                      : 'border-zinc-700/80 bg-zinc-950/50 text-zinc-300 ring-1 ring-white/[0.03] hover:border-zinc-600 hover:bg-zinc-900/60'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                  {filtersOpen ? <ChevronUp className="h-3 w-3 opacity-70" /> : <ChevronDown className="h-3 w-3 opacity-70" />}
                </button>

                {/* Clear all */}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-700/80 bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-400 ring-1 ring-white/[0.03] transition hover:border-zinc-600 hover:text-white"
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
            <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-400 ring-1 ring-indigo-500/25">
                <Calendar className="h-8 w-8" />
              </span>
              <p className="max-w-sm font-medium text-zinc-300">
                {activeFilterCount > 0 ? 'No events match your filters' : "You haven't created any events yet"}
              </p>
              <p className="max-w-xs text-sm text-zinc-500">
                {activeFilterCount > 0
                  ? 'Try clearing filters or broadening your search.'
                  : 'Host your first gathering from the events page—it will show up here automatically.'}
              </p>
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-zinc-600 transition hover:bg-zinc-700"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/events"
                  className="mt-2 inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 transition hover:from-indigo-500 hover:to-violet-500"
                >
                  Create an event
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-950/70 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 backdrop-blur-sm">
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
                <tbody>
                  {filteredEvents.map((ev, idx) => {
                    const photo = getDisplayEventPhotoUrl(ev.photo, 80)
                    const dot   = CATEGORY_DOT[ev.category] || CATEGORY_DOT.Other
                    const fillPct = ev.maxAttendees > 0
                      ? Math.min(100, Math.round((ev.participantCount / ev.maxAttendees) * 100))
                      : 0

                    return (
                      <tr key={ev._id} className="group border-b border-zinc-800/40 transition-colors last:border-0 hover:bg-indigo-500/[0.04]">
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
                            className="inline-flex items-center gap-1 rounded-xl bg-zinc-950/60 px-3.5 py-2 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-500/25 transition hover:bg-indigo-500/15 hover:text-white"
                          >
                            Participants
                            <ChevronRight className="h-3.5 w-3.5 opacity-80" />
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
            <div className="border-t border-zinc-800/60 bg-zinc-950/40 px-5 py-3.5 sm:px-6">
              <p className="text-xs font-medium text-zinc-500">
                Showing <span className="tabular-nums text-zinc-400">{filteredEvents.length}</span> of{' '}
                <span className="tabular-nums text-zinc-400">{events.length}</span> event
                {events.length !== 1 ? 's' : ''}
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
