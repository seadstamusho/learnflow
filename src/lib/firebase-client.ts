import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// シングルトン初期化（ブラウザ専用 / HMR対策）
// ビルド時や SSR 時は環境変数が未設定の場合があるため遅延初期化する
let _app: FirebaseApp | null = null

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return _app
}

// Proxy によりブラウザでの初回アクセス時のみ初期化を実行
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return (getAuth(getFirebaseApp()) as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getFirestore(getFirebaseApp()) as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// オフライン永続化（"use client" + useEffect内でのみ呼び出す）
export async function initOfflinePersistence() {
  if (typeof window === 'undefined') return
  const { enableIndexedDbPersistence } = await import('firebase/firestore')
  enableIndexedDbPersistence(getFirestore(getFirebaseApp())).catch((err) => {
    if (err.code === 'failed-precondition') {
      // 複数タブが開いている場合は最初のタブのみ有効
      console.warn('Firestore persistence: multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence: not supported in this browser')
    }
  })
}
