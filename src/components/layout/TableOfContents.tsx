'use client'

import { useActiveHeading } from '@/lib/hooks/useActiveHeading'
import type { TocItem } from '@/lib/markdown/rehype-toc'

type TableOfContentsProps = {
  items: TocItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const ids = items.map((item) => item.id)
  const activeId = useActiveHeading(ids)

  if (items.length === 0) return null

  return (
    <nav aria-label="このページの目次">
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
        📑 このページの目次
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <li
              key={item.id}
              style={{ paddingLeft: item.level === 3 ? '0.75rem' : '0' }}
            >
              <a
                href={`#${encodeURIComponent(item.id)}`}
                onClick={(e) => {
                  e.preventDefault()
                  // CSS.escape() で安全にクエリ
                  const el = document.querySelector(`#${CSS.escape(item.id)}`)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`
                  block text-sm py-0.5 leading-snug transition-colors duration-150
                  hover:text-blue-600 dark:hover:text-blue-400
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400'
                  }
                `}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
