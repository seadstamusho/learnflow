import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionCookie } from '@/lib/session'
import Header from '@/components/layout/Header'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('firebase-session')?.value
  if (!session) redirect('/login')

  let userName: string | undefined
  let userEmail: string | undefined
  let userPhotoURL: string | undefined

  try {
    const user = await verifySessionCookie(session)
    userName = user.name
    userEmail = user.email
    userPhotoURL = user.picture
  } catch {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header userPhotoURL={userPhotoURL} userName={userName} />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">プロフィール</h1>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 flex items-center gap-6">
          {userPhotoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userPhotoURL}
              alt={userName ?? ''}
              className="w-16 h-16 rounded-full border-2 border-zinc-200 dark:border-zinc-700"
            />
          )}
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">{userName}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{userEmail}</p>
          </div>
        </div>

        {/* 進捗サマリー（Phase 2） */}
        <div className="mt-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">学習進捗</h2>
          <p className="text-sm text-zinc-500">進捗サマリーはまもなく表示されます。</p>
        </div>
      </main>
    </div>
  )
}
