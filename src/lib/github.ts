const OWNER = process.env.GITHUB_CONTENT_REPO_OWNER
const REPO = process.env.GITHUB_CONTENT_REPO_NAME
const BRANCH = process.env.GITHUB_CONTENT_BRANCH ?? 'main'
const PAT = process.env.GITHUB_PAT

const BASE_RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/vnd.github.v3.raw' }
  if (PAT) headers['Authorization'] = `token ${PAT}`
  return headers
}

// GitHub Raw URL からテキストを取得（ISR対応）
async function fetchRaw(path: string): Promise<string> {
  const url = `${BASE_RAW}/${path}`
  const res = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 3600 }, // Next.js 16 ISR 明示設定
  })
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status} ${url}`)
  return res.text()
}

// コース一覧メタデータ
export async function fetchCourseIndex(): Promise<CourseIndex[]> {
  const text = await fetchRaw('courses/index.json')
  return JSON.parse(text)
}

// コース詳細メタデータ
export async function fetchCourseMeta(courseId: string): Promise<CourseMeta> {
  const text = await fetchRaw(`courses/${courseId}/meta.json`)
  return JSON.parse(text)
}

// レッスン Markdown 本文（生テキスト）
export async function fetchLessonMarkdown(
  courseId: string,
  lessonId: string
): Promise<string> {
  return fetchRaw(`courses/${courseId}/lessons/${lessonId}.md`)
}

// ─── 型定義 ───

export type CourseIndex = {
  id: string
  title: string
  description: string
  lessonCount: number
  thumbnail?: string
}

export type CourseMeta = {
  id: string
  title: string
  lessons: { id: string; title: string }[]
}
