'use client'

import CopyButton from '../ui/CopyButton'

type CodeBlockProps = {
  code: string
  lang?: string
  html: string  // shikiが生成したハイライト済みHTML
}

export default function CodeBlock({ code, lang, html }: CodeBlockProps) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
      {/* ヘッダー：言語ラベル + コピーボタン */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs text-zinc-400 font-mono">{lang ?? 'code'}</span>
        <CopyButton text={code} />
      </div>

      {/* shiki でレンダリング済みHTMLをそのまま表示 */}
      <div
        className="overflow-x-auto [&>pre]:p-4 [&>pre]:m-0 [&>pre]:text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
