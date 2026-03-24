'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import AuthRequiredModal from '../components/AuthRequiredModal'

const AuthGateContext = createContext(null)

export function AuthGateProvider({ children }) {
  const [open, setOpen] = useState(false)

  const promptAuth = useCallback(() => {
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  const value = useMemo(() => ({ promptAuth, close }), [promptAuth, close])

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <AuthRequiredModal open={open} onClose={close} />
    </AuthGateContext.Provider>
  )
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  if (!ctx) {
    throw new Error('useAuthGate must be used within AuthGateProvider')
  }
  return ctx
}
