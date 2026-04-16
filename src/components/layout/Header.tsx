import Link from 'next/link'
import { BookOpen } from 'lucide-react'

type HeaderProps = {
  userPhotoURL?: string | null
  userName?: string | null
}

export default function Header({ userPhotoURL, userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* ロゴ */}
        <Link
          href="/courses"
          className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
        >
          <BookOpen size={20} className="text-blue-600" />
          <span>LearnFlow</span>
        </Link>

        {/* ユーザーアバター */}
        {userPhotoURL ? (
          <Link href="/profile" className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userPhotoURL}
              alt={userName ?? 'プロフィール'}
              className="w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-blue-400 transition-colors"
            />
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ログイン
          </Link>
        )}
      </div>
    </header>
  )
}
