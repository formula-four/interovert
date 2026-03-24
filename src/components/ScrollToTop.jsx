'use client'

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls the window to the top on route changes (e.g. events list ↔ event detail).
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search, hash])

  return null
}
