import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseIdToken, createSessionCookie } from '@/lib/session'

const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // 14日間

export async function POST(req: NextRequest) {
  let idToken: string
  try {
    const body = await req.json()
    idToken = String(body.idToken ?? '')
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!idToken) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    // Firebase ID token を Google 公開鍵で検証（firebase-admin 不要）
    const user = await verifyFirebaseIdToken(idToken)
    const sessionCookie = await createSessionCookie(user)

    const res = NextResponse.json({ ok: true })
    res.cookies.set('firebase-session', sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })
    return res
  } catch (err) {
    console.error('Session creation failed:', err)
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('firebase-session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}
