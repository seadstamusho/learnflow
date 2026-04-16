'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

type CopyButtonProps = {
  text: string
  label?: string
  successLabel?: string
  resetMs?: number
  className?: string
}

export default function CopyButton({
  text,
  label = 'Copy',
  successLabel = '✅ Copied!',
  resetMs = 2000,
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), resetMs)
    } catch {
      // iOS Safari など Clipboard API が使えない場合のフォールバック
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), resetMs)
    }
  }, [text, resetMs])

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
        transition-colors duration-150 select-none
        ${copied
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
        }
        ${className}
      `}
      aria-label={copied ? successLabel : `${label}: コードをコピー`}
    >
      {copied ? (
        <Check size={12} />
      ) : (
        <Copy size={12} />
      )}
      <span>{copied ? successLabel : label}</span>
    </button>
  )
}
