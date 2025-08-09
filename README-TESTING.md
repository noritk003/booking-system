# テスト実行ガイド

このドキュメントでは、予約システムのE2Eテストと負荷テストの実行方法について説明します。

## 📋 テスト概要

### E2Eテスト (Playwright)
- **正常系テスト**: 予約フローから管理画面確認まで
- **競合テスト**: 同一時間枠への重複予約テスト
- **キャンセルテスト**: 予約キャンセル機能テスト
- **バリデーションテスト**: 入力検証テスト

### 負荷テスト
- **Node.js版**: 10並列POST送信で競合検証
- **k6版**: より本格的な負荷テストツール

## 🚀 実行方法

### 1. E2Eテスト実行

```bash
# 全てのE2Eテストを実行
npm run test:e2e

# UI付きでテスト実行（ブラウザで動作確認）
npm run test:e2e:ui

# 特定のテストファイルのみ実行
npx playwright test tests/e2e/booking.spec.ts
npx playwright test tests/e2e/api-conflict.spec.ts
npx playwright test tests/e2e/cancel.spec.ts

# ヘッドレスモードを無効にしてブラウザ表示
npx playwright test --headed

# デバッグモード
npx playwright test --debug
```

### 2. 負荷テスト実行

#### Node.js版負荷テスト
```bash
# ローカルサーバー対象
npm run test:load

# 本番環境対象
BASE_URL=https://your-domain.com npm run test:load

# 直接実行
node scripts/load-test.js
```

#### k6負荷テスト
```bash
# k6をインストール（初回のみ）
# macOS: brew install k6
# Windows: choco install k6
# Ubuntu: sudo apt-get install k6

# テスト実行
npm run test:k6

# カスタム設定で実行
k6 run --vus 20 --duration 30s scripts/k6-load-test.js

# 本番環境対象
k6 run --env BASE_URL=https://your-domain.com scripts/k6-load-test.js
```

## 📊 テスト内容詳細

### E2Eテストケース

#### 1. 正常系テスト (`booking.spec.ts`)
```typescript
test('正常系: A店で明日10:00に予約→完了ページ→管理画面に表示')
```
- リソース選択
- 日付・時間選択
- 予約者情報入力
- 予約確定
- 完了ページ確認
- 管理画面での予約確認

#### 2. 競合テスト (`api-conflict.spec.ts`)
```typescript
test('競合テスト: 同じ枠に2回連続で予約POST→1回目201、2回目409')
```
- 同一時間枠への連続予約
- 1回目: 201 Created
- 2回目: 409 Conflict
- 部分重複の検証
- 異なるリソース競合なし確認

#### 3. キャンセルテスト (`cancel.spec.ts`)
```typescript
test('キャンセル: 予約後にキャンセル→管理画面でstatusがcanceled')
```
- 予約作成
- キャンセル実行
- 管理画面でのステータス確認
- キャンセルページUI確認

### 負荷テスト内容

#### Node.js負荷テスト
- **対象**: 同一時間スロット
- **並列数**: 10並列
- **期待結果**: 成功1件、競合9件
- **測定項目**: レスポンス時間、成功/失敗率

#### k6負荷テスト
- **シナリオ1**: 同一スロット競合テスト（10並列）
- **シナリオ2**: 通常負荷テスト（5並列、30秒間）
- **メトリクス**: HTTPリクエスト数、レスポンス時間、エラー率
- **閾値**: 95%のリクエストが2秒以内、失敗率10%以下

## 🔧 テスト設定

### Playwright設定 (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

### 環境変数
```bash
# テスト対象URL（デフォルト: http://localhost:3000）
BASE_URL=https://your-domain.com

# 管理画面パスワード（テスト用）
ADMIN_PASSWORD=admin123
```

## 📈 結果の確認

### E2Eテスト結果
- **HTMLレポート**: `playwright-report/index.html`
- **トレース**: エラー時の詳細なステップ記録
- **スクリーンショット**: 失敗時の画面キャプチャ

### 負荷テスト結果
```bash
🎯 テスト結果サマリー:
==================================================
総実行時間: 1234ms
総リクエスト数: 10
✅ 成功 (201): 1 件
⚠️  競合 (409): 9 件
❌ エラー: 0 件

📈 期待vs実績:
成功数 - 期待: 1件, 実績: 1件
競合数 - 期待: 9件, 実績: 9件

⏱️  レスポンス時間:
平均: 156.7ms
最小: 89ms
最大: 234ms

🎯 テスト結果: ✅ 期待通り
```

## 🛠️ トラブルシューティング

### よくある問題

#### 1. テストサーバーが起動していない
```bash
# 開発サーバー起動
npm run dev
```

#### 2. データベース未接続エラー
- Supabase環境変数が未設定の場合は想定内
- UIテストは実行可能
- APIテストはスキップされる

#### 3. ブラウザが見つからない
```bash
# Playwrightブラウザをインストール
npx playwright install
```

#### 4. k6が見つからない
```bash
# macOS
brew install k6

# Windows
choco install k6

# Ubuntu
sudo apt-get install k6
```

### デバッグ方法

#### Playwrightデバッグ
```bash
# ステップバイステップ実行
npx playwright test --debug

# 特定のテストをデバッグ
npx playwright test booking.spec.ts --debug

# ヘッドレスモード無効
npx playwright test --headed --slowMo=1000
```

#### 負荷テストデバッグ
```bash
# 詳細ログ出力
DEBUG=* node scripts/load-test.js

# 並列数を1に減らしてテスト
node -e "
const { runLoadTest } = require('./scripts/load-test.js');
process.env.CONCURRENT_REQUESTS = 1;
runLoadTest();
"
```

## 📝 CI/CD統合

### GitHub Actions例
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e
      - run: npm run test:load
```

## 📋 テスト項目チェックリスト

### E2Eテスト
- [ ] トップページ表示
- [ ] リソース選択
- [ ] 日付選択
- [ ] 時間スロット選択
- [ ] 予約フォーム入力
- [ ] 予約確定
- [ ] 完了ページ表示
- [ ] 管理画面認証
- [ ] 予約一覧表示
- [ ] 予約キャンセル
- [ ] バリデーションエラー
- [ ] API競合テスト

### 負荷テスト
- [ ] 同一スロット競合
- [ ] レスポンス時間測定
- [ ] エラー率確認
- [ ] 期待結果検証
- [ ] クリーンアップ確認

### パフォーマンス
- [ ] 平均レスポンス時間 < 500ms
- [ ] 95%タイルレスポンス時間 < 2000ms
- [ ] エラー率 < 10%
- [ ] 競合検出率 > 80%

このテストスイートにより、予約システムの機能性、信頼性、パフォーマンスを包括的に検証できます。