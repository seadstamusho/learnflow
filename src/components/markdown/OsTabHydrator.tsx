'use client'

import { useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import OsTabBlock from './OsTabBlock'

/**
 * サーバーレンダリングされたHTMLの中にある data-os-tab プレースホルダーを
 * OsTabBlock React コンポーネントに差し替えるクライアントコンポーネント。
 *
 * MarkdownRenderer が生成した HTML内の:
 *   <div data-os-tab="true" data-windows="..." data-mac="..." data-lang="..."></div>
 * を見つけて createRoot で OsTabBlock をマウントする。
 */
export default function OsTabHydrator({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // マウントした Root を cleanup で unmount するために保持
  const rootsRef = useRef<Root[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const placeholders = containerRef.current.querySelectorAll<HTMLDivElement>(
      '[data-os-tab="true"]'
    )

    placeholders.forEach((el) => {
      try {
        const windows = decodeURIComponent(el.getAttribute('data-windows') ?? '')
        const mac = decodeURIComponent(el.getAttribute('data-mac') ?? '')
        const lang = decodeURIComponent(el.getAttribute('data-lang') ?? 'bash')

        // prose スタイルが入り込まないように内部を初期化
        el.textContent = ''

        const root = createRoot(el)
        root.render(
          <OsTabBlock windows={windows} mac={mac} lang={lang} />
        )
        rootsRef.current.push(root)
      } catch {
        // 属性が壊れている場合はスキップ
      }
    })

    return () => {
      // ページ遷移・再レンダリング時に React ツリーを cleanup
      rootsRef.current.forEach((root) => root.unmount())
      rootsRef.current = []
    }
  }, [])

  return <div ref={containerRef}>{children}</div>
}
