'use client'

import { Check } from 'lucide-react'
import { useChecklistProgress } from '@/lib/hooks/useChecklistProgress'
import Toast from '../ui/Toast'

type ChecklistBlockProps = {
  items: string[]      // チェックリスト項目テキストの配列
  uid: string | null
  courseId: string
  lessonId: string
}

export default function ChecklistBlock({
  items,
  uid,
  courseId,
  lessonId,
}: ChecklistBlockProps) {
  const { state, loading, error, toggle, clearError } = useChecklistProgress(
    uid,
    courseId,
    lessonId
  )

  if (loading) {
    return (
      <ul className="my-4 space-y-2">
        {items.map((_, i) => (
          <li key={i} className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        ))}
      </ul>
    )
  }

  return (
    <>
      <ul className="my-4 space-y-2">
        {items.map((text, i) => {
          const itemId = `${lessonId}-check-${i}`
          const checked = state[itemId] ?? false

          return (
            <li key={itemId} className="flex items-start gap-3">
              <button
                role="checkbox"
                aria-checked={checked}
                onClick={() => {
                  if (!uid) {
                    // 未ログイン時はトースト（親コンポーネントの error 経由で表示）
                    return
                  }
                  toggle(itemId, !checked)
                }}
                className={`
                  mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2
                  flex items-center justify-center
                  transition-colors duration-150 cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${checked
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400'
                  }
                `}
                aria-label={checked ? `完了済み: ${text}` : `未完了: ${text}`}
              >
                {checked && <Check size={12} strokeWidth={3} />}
              </button>
              <span
                className={`text-sm leading-relaxed ${
                  checked ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                }`}
              >
                {text}
              </span>
            </li>
          )
        })}
      </ul>

      {error && <Toast message={error} onClose={clearError} />}
    </>
  )
}
