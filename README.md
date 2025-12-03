# おれったー

Twitter中毒を防ぐ、投稿だけに集中できるシンプルなTwitterクライアント。

<img width="1234" height="1124" alt="image" src="https://github.com/user-attachments/assets/3976dbf3-7698-4a5c-9b04-d85e6fae359d" />


## 機能

- ✍️ テキスト投稿
- 🖼️ 画像アップロード（最大4枚）
- 🎥 動画アップロード
- 💬 自動リプライ機能（「このツイートはおれったーから投稿されています。」）
- 🚫 タイムライン非表示で集中力を維持

## セットアップ

### 必要な環境変数

以下の環境変数をVercelプロジェクトに追加してください：

\`\`\`
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
\`\`\`

### Twitter API認証情報の取得方法

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. プロジェクトとアプリを作成
3. API KeyとAPI Secretを取得
4. User authentication settingsで「Read and write」権限を設定
5. Access TokenとAccess Token Secretを生成

## 使い方

1. テキストボックスにツイート内容を入力
2. 必要に応じて画像や動画を追加
3. 「ツイート」ボタンをクリック
4. 自動的にリプライが投稿されます

## 技術スタック

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Twitter API v2

## 注意事項

- Twitter API v2の利用には、Twitter Developer Accountが必要です
- API利用制限に注意してください
- メディアアップロード機能を完全に実装するには、追加のライブラリ（例：`twitter-api-v2`）の使用を推奨します
