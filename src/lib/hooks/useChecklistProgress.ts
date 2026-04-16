'use client'

import { useEffect, useState, useCallback } from 'react'
import { getChecklistProgress, toggleChecklist } from '../firestore-client'

type ChecklistState = Record<string, boolean>

export function useChecklistProgress(
  uid: string | null,
  courseId: string,
  lessonId: string
) {
  const [state, setState] = useState<ChecklistState>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Firestore から初期状態を取得
  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }
    setLoading(true)
    getChecklistProgress(uid, courseId, lessonId)
      .then((data) => setState(data))
      .catch(() => setError('進捗の読み込みに失敗しました'))
      .finally(() => setLoading(false))
  }, [uid, courseId, lessonId])

  // チェックトグル（オプティミスティックUI）
  const toggle = useCallback(
    async (itemId: string, checked: boolean) => {
      if (!uid) return

      // 即時UI更新
      setState((prev) => ({ ...prev, [itemId]: checked }))

      try {
        await toggleChecklist(uid, courseId, itemId, lessonId, checked)
      } catch {
        // ロールバック
        setState((prev) => ({ ...prev, [itemId]: !checked }))
        setError('保存に失敗しました。再度お試しください。')
      }
    },
    [uid, courseId, lessonId]
  )

  const clearError = useCallback(() => setError(null), [])

  return { state, loading, error, toggle, clearError }
}
