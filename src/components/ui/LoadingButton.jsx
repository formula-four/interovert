import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Native button with loading state (spinner + disabled + aria-busy).
 */
export default function LoadingButton({
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  loadingLabel,
  spinnerClassName = 'h-4 w-4 animate-spin shrink-0',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      aria-busy={loading}
      className={className}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className={spinnerClassName} aria-hidden />
          {loadingLabel != null ? loadingLabel : children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
