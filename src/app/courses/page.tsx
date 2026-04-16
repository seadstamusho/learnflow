import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { adminAuth } from '@/lib/firebase-admin'
import { fetchCourseIndex } from '@/lib/github'
import ProgressBar from '@/components/layout/ProgressBar'
import Header from '@/components/layout/Header'

export const revalidate = 3600

export default async function CoursesPage() {
  // ① Server側でSession Cookie検証（C-1対策）
  const cookieStore = await cookies()
  const session = cookieStore.get('firebase-session')?.value
  if (!session) redirect('/login')

  let uid: string
  let userName: string | undefined
  let userPhotoURL: string | undefined

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    uid = decoded.uid
    userName = decoded.name as string | undefined
    userPhotoURL = decoded.picture as string | undefined
  } catch {
    redirect('/login')
  }

  // コース一覧を GitHub から取得（ISR）
  let courses: Awaited<ReturnType<typeof fetchCourseIndex>> = []
  try {
    courses = await fetchCourseIndex()
  } catch {
    courses = []
  }

  const isFirstVisit = courses.length > 0 // 進捗データは Client Component で取得

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header userPhotoURL={userPhotoURL} userName={userName} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* スタートガイドバナー（初回訪問 / エンプティステート対策） */}
        {isFirstVisit && (
          <div className="mb-8 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
            <h2 className="font-bold text-blue-800 dark:text-blue-200 mb-1">
              👋 ようこそ！まずはここから始めましょう
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              気になるコースを選んでスタート。進捗は自動的に保存されます。
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          コース一覧
        </h1>

        {courses.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <p>コンテンツを準備中です。しばらくお待ちください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="
                  group block bg-white dark:bg-zinc-900
                  rounded-2xl border border-zinc-200 dark:border-zinc-800
                  p-6 hover:border-blue-300 dark:hover:border-blue-700
                  hover:shadow-md transition-all duration-200
                "
              >
                {course.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail}
                    alt=""
                    className="w-full h-32 object-cover rounded-xl mb-4"
                  />
                )}
                <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
                  {course.description}
                </p>
                {/* 進捗バー（初期表示は0）*/}
                <ProgressBar
                  completed={0}
                  total={course.lessonCount}
                />
                <p className="text-xs text-zinc-400 mt-1">{course.lessonCount} レッスン</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
