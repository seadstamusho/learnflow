import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import TableOfContents from './TableOfContents'
import type { TocItem } from '@/lib/markdown/rehype-toc'

type Lesson = { id: string; title: string }

type SidebarProps = {
  courseId: string
  currentLessonId: string
  lessons: Lesson[]
  completedLessonIds: string[]
  tocItems: TocItem[]
}

export default function Sidebar({
  courseId,
  currentLessonId,
  lessons,
  completedLessonIds,
  tocItems,
}: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 py-6 pr-4 border-r border-zinc-200 dark:border-zinc-800 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* レッスン一覧ナビ */}
      <nav aria-label="レッスン一覧">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
          📋 レッスン一覧
        </p>
        <ul className="space-y-0.5">
          {lessons.map((lesson) => {
            const isCurrent = lesson.id === currentLessonId
            const isDone = completedLessonIds.includes(lesson.id)
            return (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${courseId}/${lesson.id}`}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded-md text-sm
                    transition-colors duration-150
                    ${isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }
                  `}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  ) : (
                    <Circle size={14} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                  )}
                  <span className="leading-snug">{lesson.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 自動TOC */}
      {tocItems.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <TableOfContents items={tocItems} />
        </div>
      )}
    </aside>
  )
}
