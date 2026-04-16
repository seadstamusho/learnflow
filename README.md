# LearnFlow

AIとプログラミングを実践しながら学ぶミニマル学習サイト。

## 技術スタック

- **フレームワーク:** Next.js 16 (App Router)
- **認証:** Firebase Authentication (Google Sign-In) + Session Cookie
- **データベース:** Cloud Firestore
- **コンテンツ:** GitHub Raw Markdown (ISR)
- **スタイリング:** Tailwind CSS 4
- **ホスティング:** Cloudflare Pages

## 機能

- パスワードゲート（サイト限定公開）
- Google ログイン
- Markdown レッスン表示（シンタックスハイライト）
- OS タブ切り替え（Windows / Mac）
- サイドバー自動目次（TOC）
- チェックリスト進捗（Firestore 連動）
- コピーボタン（2秒フィードバック）

## 環境変数

`.env.local` に以下を設定してください（詳細は SDD.md 付録A参照）。

```
SITE_PASSWORD=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
GITHUB_CONTENT_REPO_OWNER=
GITHUB_CONTENT_REPO_NAME=
GITHUB_CONTENT_BRANCH=main
GITHUB_PAT=
```

## ローカル開発

```bash
npm install
npm run dev
```
