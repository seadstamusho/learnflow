import dynamic from 'next/dynamic'
import { BookOpen } from 'lucide-react'

// Firebase Client SDK は Cloudflare Workers の eval 制限に抵触するため
// ssr: false でブラウザ専用バンドルに隔離する
const LoginForm = dynamic(() => import('./LoginForm'), {
  ssr: false,
  loading: () => <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />,
})

export default function LoginPage() {
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
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
          <h2 className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            ログインして学習を続ける
          </h2>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
