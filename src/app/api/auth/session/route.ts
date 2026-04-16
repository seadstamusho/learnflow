import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000 // 14日間

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
    // IDトークンを検証してSession Cookieを発行
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set('firebase-session', sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14, // 14日間
      path: '/',
    })
    return res
  } catch (err) {
    console.error('Session cookie creation failed:', err)
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  // ログアウト：Session Cookieを削除
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
