# Screenshots

## 主要画面のスクリーンショット

### デスクトップ版
- `hero-desktop.png` - ヒーローセクション（デスクトップ）
- `booking-form-desktop.png` - 予約フォーム（デスクトップ）
- `admin-dashboard-desktop.png` - 管理画面（デスクトップ）
- `about-page-desktop.png` - 技術詳細ページ（デスクトップ）

### モバイル版
- `hero-mobile.png` - ヒーローセクション（モバイル）
- `booking-form-mobile.png` - 予約フォーム（モバイル）
- `admin-dashboard-mobile.png` - 管理画面（モバイル）

### 機能説明用
- `time-slots.png` - 時間スロット選択画面
- `booking-success.png` - 予約完了画面
- `email-template.png` - メール通知テンプレート

## スクリーンショット撮影方法

### 自動撮影（Playwright）
```bash
npx playwright test --headed --project=chromium tests/screenshots.spec.ts
```

### 手動撮影
1. 各ページにアクセス
2. ブラウザの開発者ツールでデバイス表示を切り替え
3. スクリーンショットを撮影
4. このフォルダに保存

## ファイル命名規則
- `[機能名]-[デバイス].png`
- 例: `booking-form-desktop.png`, `admin-mobile.png`

## 推奨サイズ
- **デスクトップ**: 1920x1080
- **モバイル**: 375x812 (iPhone X基準)
- **タブレット**: 768x1024 (iPad基準)

## 用途
- README.mdでの機能説明
- ドキュメント作成
- プレゼンテーション
- ポートフォリオ掲載