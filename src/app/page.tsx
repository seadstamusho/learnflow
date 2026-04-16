import { redirect } from 'next/navigation'

// ルートへのアクセスはコース一覧へリダイレクト
// Middlewareがパスワードゲート → Googleログインの順にガードする
export default function RootPage() {
  redirect('/courses')
}
