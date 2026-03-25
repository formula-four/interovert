'use client'

import React, { useMemo } from 'react'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { EVENTS_PAGE_SIZE } from '../constants'

/**
 * Build [1,2,3,'ellipsis',10] style slices for pagination UI.
 */
function getVisiblePageItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const delta = 2
  const set = new Set([1, total])
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) set.add(i)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push('ellipsis')
    out.push(n)
    prev = n
  }
  return out
}

const navBtn =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-35'
const pageBtnBase =
  'inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg px-2.5 text-sm font-medium tabular-nums transition disabled:pointer-events-none disabled:opacity-35'

export default function EventListPagination({
  page,
  total,
  limit = EVENTS_PAGE_SIZE,
  onPageChange,
  disabled = false,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1)
  const items = useMemo(() => getVisiblePageItems(page, totalPages), [page, totalPages])

  const goToPage = (next) => {
    onPageChange(next)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  if (total <= 0 || totalPages <= 1) return null

  return (
    <nav
      className={`mt-10 flex items-center justify-center ${className}`}
      aria-label="Pagination"
    >
      <div
        className="inline-flex items-center gap-0.5 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-1.5 py-1.5 shadow-lg shadow-black/30 ring-1 ring-white/[0.06]"
      >
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => goToPage(1)}
          className={navBtn}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => goToPage(page - 1)}
          className={navBtn}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="mx-0.5 flex items-center gap-0.5 px-1">
          {items.map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`e-${idx}`}
                className="inline-flex min-w-8 items-center justify-center px-1 text-sm font-medium text-zinc-500"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => goToPage(item)}
                className={`${pageBtnBase} ${
                  page === item
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/30 hover:bg-indigo-500'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
                aria-label={`Page ${item}`}
                aria-current={page === item ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className={navBtn}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => goToPage(totalPages)}
          className={navBtn}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  )
}
