# Contributing to 予約システム

予約システムへのコントリビューションにご興味をお持ちいただき、ありがとうございます！このプロジェクトをより良いものにするために、皆様のご協力をお待ちしています。

## 📋 コントリビューション方法

### 1. 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/booking-system.git
cd booking-system

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.sample .env.local
# .env.localファイルを編集して必要な環境変数を設定

# 開発サーバーの起動
npm run dev
```

### 2. ブランチ戦略

- `main` - 本番用ブランチ
- `develop` - 開発用ブランチ
- `feature/[機能名]` - 新機能開発用
- `bugfix/[バグ名]` - バグ修正用
- `hotfix/[修正名]` - 緊急修正用

```bash
# 新機能開発の例
git checkout develop
git pull origin develop
git checkout -b feature/new-awesome-feature

# 作業完了後
git add .
git commit -m "feat: add awesome new feature"
git push origin feature/new-awesome-feature
```

### 3. コミットメッセージ規則

[Conventional Commits](https://www.conventionalcommits.org/)に従ってください：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Type 一覧
- `feat` - 新機能
- `fix` - バグ修正
- `docs` - ドキュメント変更
- `style` - コードスタイル変更（動作に影響しない）
- `refactor` - リファクタリング
- `test` - テスト追加・修正
- `chore` - ビルドプロセスやツール変更

#### 例
```bash
feat(booking): add email notification feature
fix(api): resolve timezone conversion issue
docs(readme): update deployment instructions
test(e2e): add booking flow test cases
```

## 🛠️ 開発ガイドライン

### コードスタイル

#### TypeScript
- 厳格なTypeScript設定を使用
- `any` 型の使用は避ける
- 適切な型定義を心がける

```typescript
// 良い例
interface BookingData {
  resourceId: string;
  startAt: Date;
  endAt: Date;
}

// 悪い例
const bookingData: any = { /* ... */ };
```

#### React Components
- 関数コンポーネントを使用
- カスタムフックで共通ロジックを抽出
- プロパティには適切な型定義を追加

```typescript
// 良い例
interface BookingFormProps {
  onSubmit: (data: BookingData) => void;
  initialData?: Partial<BookingData>;
}

export default function BookingForm({ onSubmit, initialData }: BookingFormProps) {
  // ...
}
```

#### CSS/Tailwind
- Tailwind CSSのユーティリティクラスを活用
- 一貫したデザインシステムを保持
- レスポンシブデザインを考慮

```jsx
// 良い例
<div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    予約フォーム
  </h2>
</div>
```

### API設計
- RESTfulな設計原則に従う
- 適切なHTTPステータスコードを使用
- 統一されたエラーレスポンス形式

```typescript
// APIレスポンス形式
export type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};
```

### データベース
- マイグレーション用のSQLファイルを提供
- 適切なインデックス設計
- セキュリティ（RLS）を考慮

## 🧪 テストガイドライン

### 必須テスト
新しい機能やバグ修正には、適切なテストを含めてください：

```bash
# E2Eテスト実行
npm run test:e2e

# 特定のテストファイル実行
npx playwright test booking.spec.ts

# ヘッドレスモードでテスト確認
npx playwright test --headed
```

### テスト作成指針
- ユーザーの実際の操作をシミュレート
- エラーケースも含める
- 可読性の高いテストコード

```typescript
// 良いテスト例
test('予約フォーム: 無効なメールアドレスでエラー表示', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[name="email"]', 'invalid-email');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('[role="alert"]')).toBeVisible();
  await expect(page.locator('[role="alert"]')).toContainText('有効なメールアドレスを入力してください');
});
```

## 📝 プルリクエストガイドライン

### プルリクエスト作成前チェックリスト
- [ ] コードが動作することを確認
- [ ] テストが全て通ることを確認
- [ ] ESLintエラーがないことを確認
- [ ] TypeScript型チェックが通ることを確認
- [ ] 関連するドキュメントを更新

```bash
# プルリクエスト前の確認コマンド
npm run build
npm run lint
npm run type-check
npm run test:e2e
```

### プルリクエストテンプレート

```markdown
## 概要
この変更の目的と概要を記述

## 変更内容
- 新機能A を追加
- バグB を修正  
- ドキュメントC を更新

## テスト
- [ ] 新しいテストを追加
- [ ] 既存のテストが通ることを確認
- [ ] 手動テストを実施

## スクリーンショット（UI変更がある場合）
Before: [画像]
After: [画像]

## チェックリスト
- [ ] コードレビュー準備完了
- [ ] 動作確認済み
- [ ] ドキュメント更新済み
```

## 🐛 バグレポート

バグを発見した場合は、以下の情報を含めてIssueを作成してください：

### バグレポートテンプレート
```markdown
**バグの概要**
何が起こったかを簡潔に説明

**再現手順**
1. '...'に移動
2. '...'をクリック
3. '...'まで下にスクロール
4. エラーを確認

**期待される動作**
何が起こるべきかの説明

**実際の動作**
実際に何が起こったかの説明

**スクリーンショット**
該当する場合は、スクリーンショットを添付

**環境情報**
- OS: [e.g. macOS 14.0]
- ブラウザ: [e.g. Chrome 120.0]
- Node.js: [e.g. 18.17.0]

**追加情報**
バグについてのその他の情報
```

## 🆕 機能リクエスト

新機能の提案は以下のテンプレートを使用してください：

### 機能リクエストテンプレート
```markdown
**機能の概要**
提案する機能について簡潔に説明

**問題・課題**
この機能がどのような問題を解決するか

**提案する解決策**
どのように実装すべきかのアイデア

**代替案**
考慮した他の解決策

**追加情報**
その他の関連情報やスクリーンショット
```

## 🏆 貢献者の皆様

全てのコントリビューターに感謝いたします！

### Recognition
- コントリビューターは README.md に記載
- 重要な貢献には特別な謝辞
- オープンソース精神の促進

## 📞 質問・サポート

### コミュニケーションチャンネル
- **GitHub Issues** - バグレポート・機能リクエスト
- **GitHub Discussions** - 質問・アイデア議論
- **Pull Request** - コードレビュー

### 質問する前に
1. 既存のIssuesを確認
2. READMEドキュメントを確認
3. 技術詳細ページ（/about）を確認

## 📜 行動規範

### 私たちの約束
私たちはオープンで歓迎的なコミュニティを維持することを約束します：

- 🤝 相互尊重と建設的な議論
- 🌍 多様性とインクルーシブな環境
- 📚 学習と成長の促進
- 💻 技術的な卓越性の追求

### 受け入れられない行為
- ハラスメント、差別的言動
- 荒らし行為、スパム
- 個人情報の無断公開
- その他の非倫理的な行為

## 🎯 今後のロードマップ

### 優先度の高い機能
- [ ] リアルタイム通知機能
- [ ] カレンダー連携
- [ ] 多言語対応
- [ ] PWA対応

### 技術的改善
- [ ] パフォーマンス最適化
- [ ] テストカバレッジ向上
- [ ] セキュリティ強化
- [ ] CI/CD改善

---

**再度、ご協力いただきありがとうございます！** 🙏

皆様の貢献により、このプロジェクトがより良いものになることを楽しみにしています。

何かご不明な点がございましたら、お気軽にIssueを作成するか、既存のDiscussionでお尋ねください。