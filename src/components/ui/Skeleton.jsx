import React from 'react'

const pulse = 'animate-pulse bg-zinc-800/90'

export function Skeleton({ className = '', ...props }) {
  return <div className={`rounded-lg ${pulse} ${className}`.trim()} {...props} />
}

/** Single event card placeholder — mirrors EventCard layout */
export function EventCardSkeleton({ className = '' }) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-b from-zinc-800/40 to-zinc-900/90 ring-1 ring-white/[0.04] ${className}`.trim()}
    >
      <div className={`aspect-[16/10] shrink-0 ${pulse}`} />
      <div className="flex flex-1 flex-col p-5 pt-4">
        <Skeleton className="mb-2 h-7 w-4/5" />
        <Skeleton className="mb-2 h-4 w-3/5" />
        <Skeleton className="mb-4 h-4 w-full" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </article>
  )
}

export function EventGridSkeleton({ count = 6 }) {
  return (
    <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <EventCardSkeleton />
        </li>
      ))}
    </ul>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-zinc-950">
      <div className="mb-10 mt-16 h-[min(55vh,420px)] bg-zinc-800 pt-24 sm:mb-14 sm:mt-20 sm:pt-28" />
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="h-48 rounded-2xl bg-zinc-900 ring-1 ring-zinc-800" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 lg:col-span-2" />
          <div className="h-64 rounded-2xl bg-zinc-900 ring-1 ring-zinc-800" />
        </div>
      </div>
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 pt-20 text-zinc-100 sm:pt-24">
      <div className="relative mx-auto max-w-4xl px-3 pb-28 sm:px-6 lg:px-8">
        <Skeleton className="mb-3 h-8 w-24 rounded-full" />
        <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/40 ring-1 ring-white/[0.06]">
          <div className={`h-36 sm:h-44 ${pulse} bg-zinc-800`} />
          <div className="px-4 pb-6 pt-0 sm:px-8">
            <div className="-mt-16 flex justify-center sm:-mt-20 sm:justify-start">
              <div className={`h-[7.5rem] w-[7.5rem] shrink-0 rounded-full border-4 border-zinc-900 sm:h-[8.5rem] sm:w-[8.5rem] ${pulse}`} />
            </div>
            <div className="mt-6 space-y-3 sm:ml-[calc(8.5rem+2.5rem)]">
              <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
            <div className="mt-8 space-y-0 rounded-2xl border border-zinc-800/70 bg-zinc-950/35 px-4 py-2 sm:px-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-zinc-800/50 py-4 last:border-b-0">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-4">
              <Skeleton className="h-12 w-28 rounded-full" />
              <Skeleton className="h-12 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden text-zinc-100">
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 border-b border-zinc-800/80 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-64 sm:h-14" />
            <Skeleton className="h-20 w-full max-w-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-28 rounded-2xl" />
            <Skeleton className="h-12 w-36 rounded-2xl" />
          </div>
        </div>
        <div className="mb-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 ring-1 ring-white/[0.04]"
            >
              <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
              <Skeleton className="mb-2 h-8 w-20" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[min(50vh,420px)] w-full rounded-2xl border border-zinc-800/80 ring-1 ring-white/[0.04]" />
      </div>
    </div>
  )
}

/** Horizontal strip for “For you” / recommended row */
export function RecommendedEventsSkeleton() {
  return (
    <section className="mb-10 animate-pulse" aria-hidden>
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-4 overflow-hidden pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-[min(100%,280px)] shrink-0 overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-900/60 ring-1 ring-white/[0.04]"
          >
            <div className={`aspect-[16/10] ${pulse} bg-zinc-800`} />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Chat conversation list rows */
export function ChatListSkeleton({ rows = 8, tone = 'zinc' }) {
  const divide = tone === 'gray' ? 'divide-gray-700/80' : 'divide-zinc-800/80'
  const block = tone === 'gray' ? 'animate-pulse bg-gray-700/80' : pulse
  return (
    <ul className={`space-y-0 divide-y ${divide}`}>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className={`h-11 w-11 shrink-0 rounded-full ${block}`} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`h-4 w-2/5 rounded-lg ${block}`} />
            <div className={`h-3 w-4/5 rounded-lg ${block}`} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Participants drawer — table body placeholder */
export function ParticipantsTableSkeleton({ rows = 6 }) {
  return (
    <div className="px-6 py-4">
      <div className="mb-3 flex gap-4 border-b border-zinc-800/80 pb-3">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 border-b border-zinc-800/40 py-3">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
