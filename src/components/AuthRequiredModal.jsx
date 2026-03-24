'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { LogIn, UserPlus, X } from 'lucide-react'

/**
 * Modal prompting guests to log in or sign up before continuing.
 */
export default function AuthRequiredModal({ open, onClose }) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-required-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900 p-6 shadow-2xl ring-1 ring-white/[0.06]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="auth-required-title" className="pr-10 text-xl font-semibold tracking-tight text-white">
              Sign in to continue
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Please sign up or log in first to view event details and join gatherings.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                state={{ from: location }}
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:from-indigo-500 hover:to-violet-500"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
