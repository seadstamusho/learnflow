'use client'

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  collection,
  getDocs,
  FieldValue,
} from 'firebase/firestore'
import { db } from './firebase-client'

// ─── 型定義 ───

export type LessonProgress = {
  completed: boolean
  completedAt: FieldValue | null
  orphaned?: boolean
}

export type ChecklistItemProgress = {
  checked: boolean
  checkedAt: FieldValue | null
  lessonId: string
}

export type CourseProgressSummary = {
  startedAt: FieldValue
  updatedAt: FieldValue
  totalLessons: number
  completedLessons: number
}

// ─── レッスン完了（batch write でサマリーも同時更新） ───

export async function completeLesson(
  uid: string,
  courseId: string,
  lessonId: string,
  completed: boolean
): Promise<void> {
  const batch = writeBatch(db)

  // 1. lessons/{lessonId} 更新
  const lessonRef = doc(db, 'users', uid, 'progress', courseId, 'lessons', lessonId)
  batch.set(lessonRef, {
    completed,
    completedAt: completed ? serverTimestamp() : null,
  })

  // 2. コースサマリーの completedLessons を再計算
  //    （楽観的：現在の値を読み取ってから差分を適用）
  const summaryRef = doc(db, 'users', uid, 'progress', courseId)
  const summarySnap = await getDoc(summaryRef)
  const current = summarySnap.exists()
    ? (summarySnap.data() as CourseProgressSummary)
    : null
  const currentCompleted = current?.completedLessons ?? 0
  const delta = completed ? 1 : -1
  const newCompleted = Math.max(0, currentCompleted + delta)

  batch.set(
    summaryRef,
    {
      completedLessons: newCompleted,
      updatedAt: serverTimestamp(),
      startedAt: current?.startedAt ?? serverTimestamp(),
    },
    { merge: true }
  )

  await batch.commit()
}

// ─── チェックリスト更新 ───

export async function toggleChecklist(
  uid: string,
  courseId: string,
  checklistItemId: string,
  lessonId: string,
  checked: boolean
): Promise<void> {
  const ref = doc(
    db,
    'users',
    uid,
    'progress',
    courseId,
    'checklists',
    checklistItemId
  )
  await setDoc(ref, {
    checked,
    checkedAt: checked ? serverTimestamp() : null,
    lessonId,
  })

  // updatedAt を親ドキュメントに反映
  const summaryRef = doc(db, 'users', uid, 'progress', courseId)
  await updateDoc(summaryRef, { updatedAt: serverTimestamp() }).catch(() => {
    // ドキュメントが存在しない場合は無視（lesson完了時に作成される）
  })
}

// ─── レッスンの進捗状態を取得 ───

export async function getLessonProgress(
  uid: string,
  courseId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const ref = doc(db, 'users', uid, 'progress', courseId, 'lessons', lessonId)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as LessonProgress) : null
}

// ─── レッスンのチェックリスト状態を取得 ───

export async function getChecklistProgress(
  uid: string,
  courseId: string,
  lessonId: string
): Promise<Record<string, boolean>> {
  const colRef = collection(db, 'users', uid, 'progress', courseId, 'checklists')
  const snap = await getDocs(colRef)
  const result: Record<string, boolean> = {}
  snap.forEach((d) => {
    const data = d.data() as ChecklistItemProgress
    if (data.lessonId === lessonId) {
      result[d.id] = data.checked
    }
  })
  return result
}

// ─── コース一覧用：ユーザーの全コース進捗サマリーを取得（N+1解消） ───

export async function getAllCourseProgressSummaries(
  uid: string
): Promise<Record<string, CourseProgressSummary>> {
  const colRef = collection(db, 'users', uid, 'progress')
  const snap = await getDocs(colRef)
  const result: Record<string, CourseProgressSummary> = {}
  snap.forEach((d) => {
    result[d.id] = d.data() as CourseProgressSummary
  })
  return result
}

// ─── コースサマリーの totalLessons を同期（GitHub meta.json との整合） ───

export async function syncCourseTotalLessons(
  uid: string,
  courseId: string,
  totalLessons: number
): Promise<void> {
  const ref = doc(db, 'users', uid, 'progress', courseId)
  const snap = await getDoc(ref)
  const current = snap.exists() ? snap.data() : null
  if (!current || current.totalLessons !== totalLessons) {
    await setDoc(ref, { totalLessons }, { merge: true })
  }
}
