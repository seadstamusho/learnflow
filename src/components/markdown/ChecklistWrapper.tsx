'use client'

import dynamic from 'next/dynamic'

// Firebase Firestore SDK は Cloudflare Workers の eval 制限に抵触するため
// ssr: false でブラウザ専用バンドルに隔離する
const ChecklistBlock = dynamic(() => import('./ChecklistItem'), {
  ssr: false,
  loading: () => (
    <ul className="my-4 space-y-2">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
      ))}
    </ul>
  ),
})

type Props = {
  items: string[]
  uid: string
  courseId: string
  lessonId: string
}

export default function ChecklistWrapper(props: Props) {
  return <ChecklistBlock {...props} />
}
