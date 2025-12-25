# 実装計画: カードID（ユニークランダム番号）の導入と編集機能

## ゴール
全てのスポット（カード）にユニークなランダム番号（ID）を付与し、管理画面からそのIDを使ってスポットを検索・編集できるようにする。

## ユーザーレビューが必要な事項
- **IDの形式**: 8桁のランダムな数値（例: `83921045`）を採用します。これでよろしいでしょうか？（衝突のリスクは極めて低いですが、厳密なユニーク制約をDB側でかけます）

## 提案される変更

### データベース (Supabase)
#### [NEW] [schema_v7_add_card_id.sql](file:///Users/mukaikazuma/Desktop/Deep%20Japan%20Discovery/docs/deep_japan_discovery/schema_v7_add_card_id.sql)
- `spots` テーブルに `card_id` (BIGINT, UNIQUE) カラムを追加。
- 既存のレコードに対して、8桁のランダムな数値を生成して付与するマイグレーションクエリを作成。
- 新規作成時のデフォルト値生成関数（またはトリガー）の定義。

### 型定義
#### [MODIFY] [types/index.ts](file:///Users/mukaikazuma/Desktop/Deep%20Japan%20Discovery/types/index.ts)
- `Spot` 型に `card_id: number;` を追加。

### 管理画面 (Admin)
#### [MODIFY] [app/admin/page.tsx](file:///Users/mukaikazuma/Desktop/Deep%20Japan%20Discovery/app/admin/page.tsx)
- 「スポット編集」タブ内に「ID検索」機能を追加。
- 検索ボックスに入力されたIDでDBをクエリし、ヒットした場合に `SpotEditor` を表示するロジックを実装。

### スポットエディタ
#### [MODIFY] [components/admin/spot-editor.tsx](file:///Users/mukaikazuma/Desktop/Deep%20Japan%20Discovery/components/admin/spot-editor.tsx)
- 必要に応じて、現在編集中のスポットの `card_id` を表示（編集不可）。

## 検証プラン

### 自動テスト / 動作確認
1. **マイグレーション実行**: SQLを実行し、エラーなくカラムが追加され、既存データにIDが振られているかSupabase上で確認。
2. **検索機能**: 管理画面で、実在する `card_id` を入力して検索し、正しいスポットが表示されるか確認。
3. **編集保存**: 検索後のスポットを編集して保存し、変更が反映されるか確認。
4. **新規作成**: 新規スポット作成フロー（生成機能など）でもIDが正しく付与されるか確認（DBトリガー/デフォルト値の動作確認）。
