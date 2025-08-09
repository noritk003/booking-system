# 🚀 本番環境セットアップガイド

このガイドに従って環境変数を設定すると、デモモードから本格的な予約システムに切り替わります。

## 📋 必要なサービス

### 1. Supabase（データベース）
- 📍 **サイト**: https://supabase.com
- 🆓 **無料枠**: 2プロジェクト、500MB DB、50MB ファイルストレージ
- ⚡ **機能**: PostgreSQL、リアルタイム機能、認証、ストレージ

### 2. メール送信サービス（どちらか選択）

#### Resend（推奨）
- 📍 **サイト**: https://resend.com  
- 🆓 **無料枠**: 3,000通/月、100通/日
- ⚡ **特徴**: 開発者向け、シンプルAPI、高い到達率

#### SendGrid（代替）
- 📍 **サイト**: https://sendgrid.com
- 🆓 **無料枠**: 100通/日（永続）
- ⚡ **特徴**: 企業向け、詳細な分析機能

## 🛠️ セットアップ手順

### Step 1: Supabase セットアップ

1. **プロジェクト作成**
   ```
   1. https://supabase.com でアカウント作成
   2. 「New Project」をクリック
   3. プロジェクト名: booking-system
   4. データベースパスワードを設定
   5. リージョン選択（日本の場合：Tokyo）
   ```

2. **データベーススキーマ作成**
   ```
   1. Supabase Dashboard → SQL Editor
   2. 「New Query」をクリック
   3. /database/supabase-setup.sql の内容をコピー&ペースト
   4. 「Run」をクリックして実行
   ```

3. **API情報取得**
   ```
   1. Settings → API
   2. 以下の値をコピー:
      - Project URL
      - anon public key  
      - service_role key（重要：秘密鍵）
   ```

### Step 2: メール送信サービス設定

#### Resend使用の場合
```
1. https://resend.com でアカウント作成
2. API Keys → 「Create API Key」
3. 名前: booking-system
4. 権限: Send access
5. API Keyをコピー
```

#### SendGrid使用の場合
```
1. https://sendgrid.com でアカウント作成
2. Settings → API Keys → 「Create API Key」
3. 名前: booking-system  
4. 権限: Restricted Access → Mail Send (Full Access)
5. API Keyをコピー
```

### Step 3: Vercel環境変数設定

1. **Vercel Dashboard アクセス**
   ```
   1. https://vercel.com/dashboard
   2. booking-system プロジェクトを選択
   3. Settings → Environment Variables
   ```

2. **環境変数追加**（以下をすべて追加）

   **🔵 Supabase設定**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://xxxxx.supabase.co
   Environment: Production, Preview
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
   Value: eyJhbGc...（anon public key）
   Environment: Production, Preview
   
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGc...（service_role key）
   Environment: Production, Preview
   ```

   **📧 メール設定（Resend使用）**
   ```
   Name: EMAIL_PROVIDER
   Value: resend
   Environment: Production, Preview
   
   Name: RESEND_API_KEY
   Value: re_...（ResendのAPI Key）
   Environment: Production, Preview
   
   Name: FROM_EMAIL
   Value: noreply@yourdomain.com
   Environment: Production, Preview
   
   Name: ADMIN_EMAIL  
   Value: admin@yourdomain.com
   Environment: Production, Preview
   ```

   **📧 メール設定（SendGrid使用）**
   ```
   Name: EMAIL_PROVIDER
   Value: sendgrid
   Environment: Production, Preview
   
   Name: SENDGRID_API_KEY
   Value: SG...（SendGridのAPI Key）
   Environment: Production, Preview
   
   Name: FROM_EMAIL
   Value: noreply@yourdomain.com  
   Environment: Production, Preview
   
   Name: ADMIN_EMAIL
   Value: admin@yourdomain.com
   Environment: Production, Preview
   ```

   **🔐 セキュリティ設定**
   ```
   Name: ADMIN_PASSWORD
   Value: your-secure-password-123
   Environment: Production, Preview
   
   Name: PUBLIC_SITE_URL
   Value: https://bookingtest2-h8egskupv-nrtk0320-gmailcoms-projects.vercel.app
   Environment: Production, Preview
   ```

### Step 4: 再デプロイ

環境変数設定後、再デプロイが必要です：

```bash
# ローカルからプッシュして自動デプロイ
git commit --allow-empty -m "trigger production deployment"
git push origin main

# または Vercel Dashboard から手動デプロイ
# Deployments → 最新デプロイの「...」→ Redeploy
```

## 🎯 本番機能の確認

環境変数設定後、以下の機能が有効になります：

### ✅ データベース機能
- ✅ 実際の予約データ保存
- ✅ 時間重複防止（EXCLUDE制約）
- ✅ 予約履歴管理
- ✅ 管理画面での予約一覧

### ✅ メール通知機能  
- ✅ 予約確認メール（お客様向け）
- ✅ 新規予約通知（管理者向け）
- ✅ HTMLメール（キャンセルリンク付き）
- ✅ メール送信ログ

### ✅ 管理機能
- ✅ 管理画面ログイン（設定したパスワード）
- ✅ 予約一覧・検索・並び替え
- ✅ 予約キャンセル機能
- ✅ リアルタイム更新

### ✅ セキュリティ機能
- ✅ 認証されたAPI アクセス
- ✅ PII情報保護
- ✅ 監査ログ記録
- ✅ レート制限

## 🔍 動作確認方法

1. **データベース接続確認**
   ```
   ブラウザ開発者ツール → Console
   「デモモード」警告が表示されなければ成功
   ```

2. **メール送信確認**
   ```
   テスト予約作成 → 設定したメールアドレスに確認メールが届く
   ```

3. **管理画面確認**
   ```
   /admin → 設定したパスワードでログイン → 予約一覧が表示される
   ```

## ⚠️ 注意事項

### 🔒 セキュリティ
- `SUPABASE_SERVICE_ROLE_KEY`は絶対に公開しない
- `ADMIN_PASSWORD`は推測困難な文字列を使用
- 本番運用前にテスト予約で動作確認

### 💰 料金
- **Supabase**: 基本無料（帯域制限あり）
- **Resend/SendGrid**: 無料枠内で十分
- **Vercel**: 個人利用は無料

### 📊 監視
- Vercel Function Logs でエラー監視
- Supabase Logs でDB状況確認
- メール送信状況を定期的に確認

## 🆘 トラブルシューティング

### メールが届かない
```
1. FROM_EMAIL がメールサービスで認証済みドメインか確認
2. スパムフォルダーをチェック  
3. Vercel Function Logs でエラー確認
4. メールサービスのダッシュボードで送信状況確認
```

### データベース接続エラー
```
1. SUPABASE_SERVICE_ROLE_KEY が正しいか確認
2. Supabase プロジェクトが有効か確認
3. RLS（Row Level Security）設定を確認
```

### 管理画面にログインできない
```
1. ADMIN_PASSWORD が正しく設定されているか確認
2. ブラウザキャッシュをクリア
3. Vercel 環境変数の再デプロイ
```

---

**📞 サポートが必要な場合**
- GitHub Issues: https://github.com/noritk003/booking-system/issues
- システムログ確認: Vercel Dashboard → Functions → View Function Logs