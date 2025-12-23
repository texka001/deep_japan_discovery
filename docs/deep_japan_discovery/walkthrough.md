# Deep Japan Discovery - Phase 1 MVP Walkthrough

## 概要
Deep Japan Discovery の Phase 1 MVP 実装が完了しました。
基本的な地図機能、スポット表示、詳細情報の閲覧（Deepガイド）が動作します。

## 実装機能

### 1. マップ & ロケーション
- **Google Maps 連携**: 画面全体に地図を表示。
- **現在地表示**: ユーザーの現在地を取得し、地図上に青いパルス（現在地マーカー）を表示。
- **スポットピン**: スポットの場所に黄色いピンを表示。クリックで詳細表示。

### 2. スポット検索 & リスト
- **フィルタリング**: カテゴリ（All, Subculture, Retro, Craft）での絞り込み。
- **スポットリスト**:
    - モバイル: 画面下部に横スクロールカードを表示。
    - デスクトップ: 画面左側に縦スクロールリストを表示。
- **スポットカード**: 写真、店名、カテゴリ、難易度、滞在時間を表示。

### 3. スポット詳細 (Deep Guide)
- **詳細モーダル**: カードタップまたはピンクリックで詳細情報を表示。
- **Deepガイド**:
    - **How to Enter**: 入店方法の案内。
    - **Must-Follow Rules**: 禁止事項やルール。
    - **Communication Cards**: 指差し会話カード（日本語/英語）。

## 動作確認方法
1. **開発サーバー起動**: `npm run dev`
2. **ブラウザ確認**: [http://localhost:3000](http://localhost:3000)
3. **操作**:
    - 地図上の黄色いピンをクリック → 詳細画面が開くことを確認。
    - リストのカテゴリを切り替え → 地図上のピンも連動して絞り込まれることを確認。

## 技術スタック
- **Frontend**: Next.js 14, Tailwind CSS, Shadcn/ui
- **Map**: @vis.gl/react-google-maps
- **Backend**: Supabase (PostgreSQL + PostGIS)

## 次のステップ
- Vercel へのデプロイ。
- Phase 2: ユーザー投稿機能、行程作成機能の実装。
