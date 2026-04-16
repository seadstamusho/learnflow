import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Vercel KVが設定されている場合のみレートリミット有効
let ratelimit: Ratelimit | null = null
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 m'), // 10分間に10回まで
    analytics: false,
  })
}

export async function POST(req: NextRequest) {
  // レートリミット（IPベース）
  if (ratelimit) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  let password: string
  try {
    const body = await req.json()
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const correct = process.env.SITE_PASSWORD ?? ''

  // タイミング攻撃対策：定時間比較
  let match = false
  try {
    if (password.length === correct.length) {
      match = timingSafeEqual(Buffer.from(password), Buffer.from(correct))
    }
  } catch {
    match = false
  }

  if (!match) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('site-pw-verified', 'true', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: '/',
  })
  return res
}
