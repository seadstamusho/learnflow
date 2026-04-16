import { jwtVerify, createRemoteJWKSet, SignJWT } from 'jose'

const FIREBASE_PROJECT_ID = 'learnflow-47c43'

// Firebase ID token の公開鍵（Google が公開している）
const firebaseJWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
)

// SESSION_SECRET 未設定時は FIREBASE_ADMIN_PRIVATE_KEY の先頭64文字を流用
function getSessionSecret(): Uint8Array {
  const raw =
    process.env.SESSION_SECRET ??
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n').slice(0, 64)
  if (!raw) throw new Error('[session] SESSION_SECRET または FIREBASE_ADMIN_PRIVATE_KEY を設定してください')
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
