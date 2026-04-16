'use client'

import { useEffect, useState } from 'react'

// IntersectionObserver で現在ビューポートにある見出しIDを検出
export function useActiveHeading(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    if (ids.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // ビューポートに入った見出しのうち最初のものをアクティブにする
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: 1.0,
      }
    )

    for (const id of ids) {
      // CSS.escape() で特殊文字・日本語IDを安全にクエリ
      const el = document.querySelector(`#${CSS.escape(id)}`)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [ids])

  return activeId
}
