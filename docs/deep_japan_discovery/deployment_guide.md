# Deployment Guide (Vercel)

Deep Japan Discovery を Vercel にデプロイするための手順です。

## 1. 準備
ローカルでのビルドチェックは成功しています。
GitHub にコードをプッシュしてください。

## 2. Vercel プロジェクト作成
1.  [Vercel Dashboard](https://vercel.com/dashboard) にアクセス。
2.  **"Add New..."** -> **"Project"** をクリック。
3.  GitHub リポジトリ (`deep-japan-discovery` 等) をインポート。

## 3. 環境変数の設定 (Environment Variables)
デプロイ前に、以下の環境変数を Vercel に設定する必要があります。
`.env.local` の内容をコピーして設定してください。

| Variable Name | Value Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API Key |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Google Maps Map ID (任意, なければ `DEMO_MAP_ID`) |

## 4. デプロイ実行
1.  環境変数を入力したら **"Deploy"** をクリック。
2.  ビルドが完了するのを待ちます。
3.  完了画面が表示されたら、提供された URL にアクセスして動作確認を行います。

## 5. 動作確認
- 地図が表示されるか
- スポットリストが表示されるか
- 詳細画面が開くか
- (重要) Supabase からデータが取得できているか
