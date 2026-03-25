'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import apiClient from '../../../services/apiClient'
import { useAuthGate } from '../../../context/AuthGateContext'
import EventCard from '../components/EventCard'
import EventListPagination from '../components/EventListPagination'
import { EVENTS_PAGE_SIZE } from '../constants'
import { EventGridSkeleton } from '../../../components/ui/Skeleton'

export default function MyFavouriteEvents() {
  const { promptAuth } = useAuthGate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const load = useCallback(async (pageNum) => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/events/me/favorites', {
        params: { page: pageNum, limit: EVENTS_PAGE_SIZE },
      })
      setEvents(data.events ?? [])
      setTotalCount(typeof data.total === 'number' ? data.total : 0)
    } catch {
      toast.error('Failed to load favourites')
      setEvents([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [load, page])

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 pt-28 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,102,241,0.18),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 border-b border-zinc-800/80 pb-10"
        >
          <Link
            to="/events"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to events
          </Link>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400/90">
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Saved for you
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">My favourites</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
            Events you have marked with the heart. Open one to join or remove it from favourites anytime.
          </p>
        </motion.header>

        {loading ? (
          <EventGridSkeleton count={6} />
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 py-20 text-center ring-1 ring-white/[0.02]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/25">
              <Heart className="h-7 w-7" />
            </span>
            <h2 className="mt-6 text-lg font-semibold text-white">
              {totalCount > 0 ? 'No favourites on this page' : 'No favourites yet'}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              {totalCount > 0
                ? 'Try an earlier page.'
                : 'Browse events and tap “Add to favourites” on any event you want to save here.'}
            </p>
            {totalCount > 0 ? (
              <button
                type="button"
                onClick={() => setPage(1)}
                className="mt-8 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-zinc-600 transition hover:bg-zinc-700"
              >
                First page
              </button>
            ) : (
              <Link
                to="/events"
                className="mt-8 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-zinc-600 transition hover:bg-zinc-700"
              >
                Explore events
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <li key={event._id}>
                  <EventCard event={event} index={i} onGuestClick={promptAuth} />
                </li>
              ))}
            </ul>
            <EventListPagination
              page={page}
              total={totalCount}
              limit={EVENTS_PAGE_SIZE}
              onPageChange={setPage}
              disabled={loading}
            />
          </>
        )}
      </div>
    </div>
  )
}
