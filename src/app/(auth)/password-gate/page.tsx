'use client'

import { Suspense, useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'

function PasswordGateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/courses'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.status === 429) {
        setError('試行回数の上限に達しました。しばらくお待ちください。')
        return
      }

      if (!res.ok) {
        setError('パスワードが違います。')
        return
      }

      // 同一オリジンのパスのみ許可
      const safePath = redirect.startsWith('/') ? redirect : '/courses'
      router.replace(safePath)
    } catch {
      setError('エラーが発生しました。再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
        required
        autoFocus
        className="
          w-full px-4 py-2.5 rounded-lg text-sm
          border border-zinc-200 dark:border-zinc-700
          bg-zinc-50 dark:bg-zinc-800
          text-zinc-900 dark:text-zinc-100
          placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      />

      <Button type="submit" loading={loading} className="w-full">
        入力して進む
      </Button>
    </form>
  )
}

export default function PasswordGatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <BookOpen size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">LearnFlow</h1>
        </div>

        {/* カード */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              アクセスパスワード
            </h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            パスワードを入力してください。
          </p>

          <Suspense fallback={<div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />}>
            <PasswordGateForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
