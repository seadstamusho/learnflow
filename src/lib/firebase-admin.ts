import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

// 遅延初期化（ビルド時に環境変数がなくてもモジュールインポートでクラッシュしない）
let _app: App | null = null

function getAdminApp(): App {
  if (_app) return _app
  if (getApps().length > 0) {
    _app = getApps()[0]
    return _app
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[firebase-admin] 環境変数 FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY が未設定です。' +
      ' .env.local を確認してください。'
    )
  }

  _app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return _app
}

// Getter 関数として公開（呼び出し時に初期化）
function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}

// Proxy オブジェクト：プロパティアクセス時に初期化を実行
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return (getAdminAuth() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
