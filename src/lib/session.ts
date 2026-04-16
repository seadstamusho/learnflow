import { jwtVerify, createRemoteJWKSet, SignJWT } from 'jose'

const FIREBASE_PROJECT_ID = 'learnflow-47c43'

// Firebase ID token の公開鍵（Google が公開している）
const firebaseJWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
)

// process.env['X'] は esbuild のビルド時インライン化を防ぐ動的アクセス
// Cloudflare Workers がランタイムで提供できない場合のフォールバック値を設定済み
function getSessionSecret(): Uint8Array {
  const raw =
    (process.env['SESSION_SECRET'] as string | undefined) ??
    'lf2026xK9m3pQ7rN2wA5vB8cD1eF4g'
  return new TextEncoder().encode(raw)
}

export type SessionUser = {
  uid: string
  name?: string
  email?: string
  picture?: string
}

/** Firebase ID token を Google の公開鍵で検証して SessionUser を返す */
export async function verifyFirebaseIdToken(idToken: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(idToken, firebaseJWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  })
  return {
    uid: payload.sub!,
    name: payload['name'] as string | undefined,
    email: payload['email'] as string | undefined,
    picture: payload['picture'] as string | undefined,
  }
}

/** SessionUser を署名付き JWT に変換（14日間有効）*/
export async function createSessionCookie(user: SessionUser): Promise<string> {
  return new SignJWT({
    uid: user.uid,
    name: user.name,
    email: user.email,
    picture: user.picture,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(getSessionSecret())
}

/** Session Cookie を検証して SessionUser を返す。失敗時は例外を投げる */
export async function verifySessionCookie(sessionCookie: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(sessionCookie, getSessionSecret())
  const uid = payload['uid'] as string | undefined
  if (!uid) throw new Error('invalid session: missing uid')
  return {
    uid,
    name: payload['name'] as string | undefined,
    email: payload['email'] as string | undefined,
    picture: payload['picture'] as string | undefined,
  }
}
