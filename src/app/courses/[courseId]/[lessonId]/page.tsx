import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { adminAuth } from '@/lib/firebase-admin'
import { fetchCourseMeta, fetchLessonMarkdown } from '@/lib/github'
import { parseMarkdown } from '@/components/markdown/MarkdownRenderer'
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer'
import OsTabHydrator from '@/components/markdown/OsTabHydrator'
import dynamic from 'next/dynamic'
// Firebase Firestore SDK は Cloudflare Workers の eval 制限に抵触するため
// ssr: false でブラウザ専用バンドルに隔離する
const ChecklistBlock = dynamic(() => import('@/components/markdown/ChecklistItem'), { ssr: false })
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ProgressBar from '@/components/layout/ProgressBar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const revalidate = 3600

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params

  // Server側 Session Cookie 検証（C-1対策）
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

  // コースメタデータ + レッスンMarkdown を並行取得
  let meta, markdownText
  try {
    ;[meta, markdownText] = await Promise.all([
      fetchCourseMeta(courseId),
      fetchLessonMarkdown(courseId, lessonId),
    ])
  } catch {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header userPhotoURL={userPhotoURL} userName={userName} />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-zinc-500">レッスンが見つかりません。</p>
          <Link href={`/courses/${courseId}`} className="mt-4 inline-block text-blue-600 hover:underline text-sm">
            ← コースに戻る
          </Link>
        </main>
      </div>
    )
  }

  // Markdownをサーバーサイドでパース（TOC・チェックリスト抽出）
  const { html, tocItems, checklistItems } = await parseMarkdown(markdownText)
  // uid は verifySessionCookie が成功しているので必ず存在する
  const verifiedUid = uid!

  // 前後レッスンを計算
  const lessonIndex = meta.lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = lessonIndex > 0 ? meta.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < meta.lessons.length - 1 ? meta.lessons[lessonIndex + 1] : null
  const currentLesson = meta.lessons[lessonIndex]

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header userPhotoURL={userPhotoURL} userName={userName} />

      {/* コース進捗バー */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <ProgressBar
            completed={0}
            total={meta.lessons.length}
            label={meta.title}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 flex gap-8 py-8">
        {/* 左サイドバー（PC）*/}
        <Sidebar
          courseId={courseId}
          currentLessonId={lessonId}
          lessons={meta.lessons}
          completedLessonIds={[]} // Client側で進捗取得（Phase 2）
          tocItems={tocItems}
        />

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <Link
              href={`/courses/${courseId}`}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {meta.title}
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {currentLesson?.title ?? lessonId}
            </h1>
          </div>

          {/* Markdownコンテンツ（OsTabHydrator でOSタブを差し替え） */}
          <OsTabHydrator>
            <MarkdownRenderer html={html} />
          </OsTabHydrator>

          {/* チェックリスト（Firestore連動・クライアントコンポーネント） */}
          {checklistItems[0]?.length > 0 && (
            <div className="mt-8 p-5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                ✅ 確認チェックリスト
              </h3>
              <ChecklistBlock
                items={checklistItems[0]}
                uid={verifiedUid}
                courseId={courseId}
                lessonId={lessonId}
              />
            </div>
          )}

          {/* 前後ナビゲーション */}
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/courses/${courseId}/${prevLesson.id}`}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>{prevLesson.title}</span>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                href={`/courses/${courseId}/${nextLesson.id}`}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>{nextLesson.title}</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <Link
                href={`/courses/${courseId}`}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                コース完了！一覧に戻る
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
