'use client'

import CopyButton from '../ui/CopyButton'

type PromptBlockProps = {
  content: string
}

// {{変数名}} をハイライト表示するパーサー
function renderWithPlaceholders(text: string) {
  const parts = text.split(/({{[^}]+}})/)
  return parts.map((part, i) => {
    if (part.startsWith('{{') && part.endsWith('}}')) {
      return (
        <mark
          key={i}
          className="
            bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300
            rounded px-0.5 cursor-pointer
          "
          title="クリックして選択"
          onClick={(e) => {
            const range = document.createRange()
            range.selectNodeContents(e.currentTarget)
            const sel = window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(range)
          }}
        >
          {part}
        </mark>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function PromptBlock({ content }: PromptBlockProps) {
  return (
    <div className="my-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-800">
        <span className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <span>🤖</span>
          <span>AIプロンプト</span>
        </span>
        <CopyButton
          text={content}
          label="プロンプトをコピー"
          successLabel="✅ Copied!"
          className="text-xs px-3 py-1.5"
        />
      </div>

      {/* プロンプト本文 */}
      <div className="px-4 py-3 bg-white dark:bg-zinc-900 text-sm leading-relaxed whitespace-pre-wrap font-mono text-zinc-800 dark:text-zinc-200">
        {renderWithPlaceholders(content)}
      </div>
    </div>
  )
}
