'use client'

import { useState, useEffect } from 'react'
import CopyButton from '../ui/CopyButton'

type OS = 'windows' | 'mac'

type OsTabBlockProps = {
  windows: string
  mac: string
  lang?: string
}

function detectOS(): OS {
  if (typeof window === 'undefined') return 'mac' // SSR フォールバック
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('win') ? 'windows' : 'mac'
}

export default function OsTabBlock({ windows, mac, lang = 'bash' }: OsTabBlockProps) {
  // Hydration不一致防止：初期値は null、useEffect でOS判定
  const [activeOS, setActiveOS] = useState<OS | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('preferred-os') as OS | null
    setActiveOS(saved ?? detectOS())
  }, [])

  const handleTabClick = (os: OS) => {
    setActiveOS(os)
    localStorage.setItem('preferred-os', os)
  }

  const code = activeOS === 'windows' ? windows : mac
  const TAB_LABELS: Record<OS, string> = { windows: 'Windows', mac: 'Mac / Linux' }

  return (
    <div className="my-4 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* タブヘッダー */}
      <div
        role="tablist"
        className="flex border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
      >
        {(['windows', 'mac'] as OS[]).map((os) => (
          <button
            key={os}
            role="tab"
            aria-selected={activeOS === os}
            aria-controls={`ostab-panel-${os}`}
            onClick={() => handleTabClick(os)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors duration-150
              ${activeOS === os
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }
            `}
          >
            {TAB_LABELS[os]}
          </button>
        ))}
      </div>

      {/* コードパネル */}
      {(['windows', 'mac'] as OS[]).map((os) => (
        <div
          key={os}
          id={`ostab-panel-${os}`}
          role="tabpanel"
          hidden={activeOS !== os}
          className="relative"
        >
          <div className="absolute top-2 right-2 z-10">
            <CopyButton text={os === 'windows' ? windows : mac} />
          </div>
          <pre className="p-4 pr-20 overflow-x-auto bg-zinc-950 text-zinc-100 text-sm">
            <code className={`language-${lang}`}>{os === 'windows' ? windows : mac}</code>
          </pre>
        </div>
      ))}

      {/* SSR時（activeOS=null）はプレースホルダーを表示してレイアウトシフトを防ぐ */}
      {activeOS === null && (
        <div className="p-4 bg-zinc-950 text-zinc-100 text-sm h-12 animate-pulse" />
      )}
    </div>
  )
}
