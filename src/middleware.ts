import { NextRequest, NextResponse } from 'next/server'

// パスワードゲートチェック対象外のパス
const PUBLIC_PATHS = [
  '/password-gate',
  '/api/auth/verify-password',
]

// Googleログイン不要（パスワードゲート通過後に誰でもアクセス可）
const PW_ONLY_PATHS = ['/login']

// Googleログイン必須のパス
const PROTECTED_PATHS = ['/courses', '/profile']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 静的アセット・Next.js内部パスはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  // ① パスワードゲートチェック
  const pwVerified = req.cookies.get('site-pw-verified')?.value
  if (pwVerified !== 'true') {
    const url = req.nextUrl.clone()
    url.pathname = '/password-gate'
    // 同一オリジンのパスのみ redirect パラメータとして許可
    const safePath = pathname.startsWith('/') ? pathname : '/'
    url.searchParams.set('redirect', safePath)
    return NextResponse.redirect(url)
  }

  // ② Googleログインチェック（保護ルートのみ）
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const session = req.cookies.get('firebase-session')?.value
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      const safePath = pathname.startsWith('/') ? pathname : '/'
      url.searchParams.set('redirect', safePath)
      return NextResponse.redirect(url)
    }
    // ⚠ Middlewareはセッションの「存在確認のみ」
    // 実際のトークン検証は各 Server Component / Server Action で
    // adminAuth.verifySessionCookie(session, true) を必ず実施すること
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
