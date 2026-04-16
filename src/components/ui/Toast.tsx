'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

type ToastProps = {
  message: string
  onClose: () => void
  durationMs?: number
}

export default function Toast({ message, onClose, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, durationMs)
    return () => clearTimeout(t)
  }, [onClose, durationMs])

  return (
    <div
      role="alert"
      className="
        fixed bottom-4 right-4 z-50 flex items-center gap-2
        bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg
        transition-all duration-200
      "
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 opacity-80 hover:opacity-100"
        aria-label="閉じる"
      >
        <X size={14} />
      </button>
    </div>
  )
}
