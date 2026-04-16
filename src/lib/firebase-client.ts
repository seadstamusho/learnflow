import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Firebase クライアント設定（NEXT_PUBLIC_ 変数はビルド時埋め込みだが
// Cloudflare Workers のビルド環境では届かないためここに直接記述する）
// これらはブラウザ公開値なので秘密情報ではない
const firebaseConfig = {
  apiKey: 'AIzaSyCeJD8fPxx1ja6UrZTZXKQbHvJ9jbfaZRs',
  authDomain: 'learnflow-47c43.firebaseapp.com',
  projectId: 'learnflow-47c43',
  storageBucket: 'learnflow-47c43.firebasestorage.app',
  messagingSenderId: '525362168506',
  appId: '1:525362168506:web:6f9bbd3eab134bff727883',
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
