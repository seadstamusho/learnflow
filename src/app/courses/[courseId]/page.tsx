import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { adminAuth } from '@/lib/firebase-admin'
import { fetchCourseMeta } from '@/lib/github'
import Header from '@/components/layout/Header'
import ProgressBar from '@/components/layout/ProgressBar'
import { CheckCircle2, Circle, ArrowLeft, Play } from 'lucide-react'

export const revalidate = 3600

type Props = { params: Promise<{ courseId: string }> }

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params

  // Server側 Session Cookie 検証
  const cookieStore = await cookies()
  const session = cookieStore.get('firebase-session')?.value
  if (!session) redirect('/login')

  let userName: string | undefined
  let userPhotoURL: string | undefined

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    userName = decoded.name as string | undefined
    userPhotoURL = decoded.picture as string | undefined
  } catch {
    redirect('/login')
  }

  // コースメタデータ取得
  let meta
  try {
    meta = await fetchCourseMeta(courseId)
  } catch {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header userPhotoURL={userPhotoURL} userName={userName} />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-zinc-500">コースが見つかりません。</p>
          <Link href="/courses" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
            ← コース一覧へ戻る
          </Link>
        </main>
      </div>
    )
  }

  const firstLessonId = meta.lessons[0]?.id

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header userPhotoURL={userPhotoURL} userName={userName} />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* パンくず */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          コース一覧
        </Link>

        {/* コースヘッダー */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {meta.title}
          </h1>
          <ProgressBar
            completed={0}
            total={meta.lessons.length}
            label="コース進捗"
          />
          {firstLessonId && (
            <Link
              href={`/courses/${courseId}/${firstLessonId}`}
              className="
                mt-6 inline-flex items-center gap-2
                px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium
                hover:bg-blue-700 transition-colors
              "
            >
              <Play size={14} />
              最初のレッスンから始める
            </Link>
          )}
        </div>

        {/* レッスン一覧 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              レッスン一覧（{meta.lessons.length}本）
            </h2>
          </div>
          <ul>
            {meta.lessons.map((lesson, i) => {
              const completed = false // Client側で進捗取得（Phase 2）
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/courses/${courseId}/${lesson.id}`}
                    className="
                      flex items-center gap-4 px-6 py-4
                      hover:bg-zinc-50 dark:hover:bg-zinc-800
                      border-b border-zinc-100 dark:border-zinc-800 last:border-0
                      transition-colors group
                    "
                  >
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                      {completed ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} className="text-zinc-300 dark:text-zinc-600 group-hover:text-blue-400 transition-colors" />
                      )}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 w-6 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {lesson.title}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </main>
    </div>
  )
}
