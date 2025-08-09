# 🔧 Vercel環境変数設定 - 詳細手順

Vercel Dashboardでの環境変数設定方法を画面キャプチャ付きで詳しく解説します。

## 📋 事前準備

以下の情報を手元に用意してください：

### Supabaseから取得
```
✅ Project URL: https://xxxxx.supabase.co
✅ anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### メール送信サービスから取得
```
✅ Resend API Key: re_xxxxx... または
✅ SendGrid API Key: SG.xxxxx...
✅ 送信元メールアドレス: noreply@yourdomain.com
✅ 管理者メールアドレス: admin@yourdomain.com
```

### 管理画面用
```
✅ 管理者パスワード: your-secure-password
```

## 🎯 Step 1: Vercel Dashboardにアクセス

1. **ブラウザで以下のURLにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **booking-systemプロジェクトを探す**
   - プロジェクト一覧から「booking-system」を探してクリック
   - または検索ボックスに「booking-system」と入力

3. **プロジェクト画面が表示されることを確認**
   - URL: `https://vercel.com/[your-username]/booking-system`
   - 画面上部にプロジェクト名「booking-system」が表示される

## 🎯 Step 2: Settings メニューに移動

1. **上部メニューバーの「Settings」をクリック**
   ```
   Overview | Functions | Analytics | Settings ← ここをクリック
   ```

2. **左サイドバーの「Environment Variables」をクリック**
   ```
   サイドバー:
   General
   Functions
   Domains
   Git
   Environment Variables ← ここをクリック
   Security
   ...
   ```

3. **Environment Variables画面が表示されることを確認**
   - ページタイトル: "Environment Variables"
   - 「Add New」ボタンが表示される

## 🎯 Step 3: 環境変数を1つずつ追加

### 🔹 変数追加の基本手順

各環境変数について以下の手順を繰り返します：

1. **「Add New」ボタンをクリック**
2. **3つの項目を入力:**
   - `Name`: 変数名（大文字・小文字を正確に）
   - `Value`: 変数の値
   - `Environments`: どの環境で使用するか選択
3. **「Save」ボタンをクリック**

### 📝 入力する環境変数（順番通りに）

#### **1. NEXT_PUBLIC_SUPABASE_URL**
```
👆 「Add New」をクリック

Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
      ↑ あなたのSupabaseプロジェクトURL

Environments: 
☑ Production
☑ Preview  
☐ Development

👆 「Save」をクリック
```

#### **2. NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
👆 「Add New」をクリック

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      ↑ SupabaseのAnonymous public key（長い文字列）

Environments: 
☑ Production
☑ Preview
☐ Development

👆 「Save」をクリック
```

#### **3. SUPABASE_SERVICE_ROLE_KEY**
```
👆 「Add New」をクリック

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      ↑ Supabaseのservice_role key（長い文字列・重要）

Environments: 
☑ Production  
☑ Preview
☐ Development

👆 「Save」をクリック
```

#### **4. EMAIL_PROVIDER**
```
👆 「Add New」をクリック

Name: EMAIL_PROVIDER
Value: resend  （Resendを使う場合）
または
Value: sendgrid （SendGridを使う場合）

Environments: 
☑ Production
☑ Preview
☐ Development

👆 「Save」をクリック
```

#### **5a. RESEND_API_KEY（Resend使用の場合のみ）**
```
👆 「Add New」をクリック

Name: RESEND_API_KEY
Value: re_xxxxx...
      ↑ ResendのAPI Key

Environments: 
☑ Production
☑ Preview  
☐ Development

👆 「Save」をクリック
```

#### **5b. SENDGRID_API_KEY（SendGrid使用の場合のみ）**
```
👆 「Add New」をクリック

Name: SENDGRID_API_KEY
Value: SG.xxxxx...
      ↑ SendGridのAPI Key

Environments: 
☑ Production
☑ Preview
☐ Development

👆 「Save」をクリック
```

#### **6. FROM_EMAIL**
```
👆 「Add New」をクリック

Name: FROM_EMAIL
Value: noreply@yourdomain.com
      ↑ メール送信元アドレス

Environments: 
☑ Production
☑ Preview
☐ Development

👆 「Save」をクリック
```

#### **7. ADMIN_EMAIL**
```
👆 「Add New」をクリック

Name: ADMIN_EMAIL
Value: admin@yourdomain.com
      ↑ 管理者通知用メールアドレス

Environments: 
☑ Production
☑ Preview
☐ Development

👆 「Save」をクリック
```

#### **8. ADMIN_PASSWORD**
```
👆 「Add New」をクリック

Name: ADMIN_PASSWORD
Value: your-secure-password-123
      ↑ 管理画面ログイン用パスワード（8文字以上推奨）

Environments: 
☑ Production
☑ Preview
☐ Development

👆 「Save」をクリック
```

#### **9. PUBLIC_SITE_URL**
```
👆 「Add New」をクリック

Name: PUBLIC_SITE_URL
Value: https://bookingtest2-h8egskupv-nrtk0320-gmailcoms-projects.vercel.app
      ↑ あなたのVercelアプリのURL

Environments: 
☑ Production
☑ Preview
☐ Development

👆 「Save」をクリック
```

## 🎯 Step 4: 設定確認

全ての環境変数を追加後、以下が表示されているはずです：

```
Environment Variables (9個)

✅ NEXT_PUBLIC_SUPABASE_URL          Production, Preview
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY     Production, Preview  
✅ SUPABASE_SERVICE_ROLE_KEY         Production, Preview
✅ EMAIL_PROVIDER                     Production, Preview
✅ RESEND_API_KEY (or SENDGRID_API_KEY) Production, Preview
✅ FROM_EMAIL                         Production, Preview
✅ ADMIN_EMAIL                        Production, Preview
✅ ADMIN_PASSWORD                     Production, Preview
✅ PUBLIC_SITE_URL                    Production, Preview
```

## 🎯 Step 5: 再デプロイの実行

環境変数設定後は**必ず再デプロイ**が必要です：

### 方法1: 自動再デプロイ（推奨）
```bash
# ローカルで空のコミットをプッシュ
git commit --allow-empty -m "apply environment variables"
git push origin main
```

### 方法2: 手動再デプロイ
```
1. Vercel Dashboard → 「Deployments」タブ
2. 最新のデプロイメントの右側「...」メニュー
3. 「Redeploy」をクリック  
4. 「Use existing Build Cache」のチェックを外す
5. 「Redeploy」ボタンをクリック
```

## ✅ 動作確認

再デプロイ完了後（5-10分後）、以下で動作確認：

### 1. データベース接続確認
```
1. アプリにアクセス
2. ブラウザの開発者ツール → Console
3. 「デモモード」の警告が表示されなければ成功
```

### 2. メール送信確認  
```
1. テスト予約を作成
2. 設定したメールアドレスに確認メールが届く
3. 管理者メールにも通知が届く
```

### 3. 管理画面確認
```
1. /admin にアクセス
2. 設定したADMIN_PASSWORDでログイン成功
3. 予約一覧が表示される（テスト予約が含まれる）
```

## ⚠️ よくあるエラーと対処法

### ❌ 「Invalid API key」エラー
```
原因: メールサービスのAPI Keyが間違っている
対処: API Keyをコピーし直して再設定
```

### ❌ 「Database connection failed」エラー  
```
原因: SupabaseのService Role Keyが間違っている
対処: Supabase Dashboard → Settings → API で正しいキーを確認
```

### ❌ 管理画面にログインできない
```
原因: ADMIN_PASSWORDが反映されていない
対処: 再デプロイを実行してから再試行
```

### ❌ メールが届かない
```
原因: FROM_EMAILがメールサービスで認証されていない
対処: メールサービスでドメイン認証を完了させる
```

## 💡 設定のコツ

### ✅ Environment選択
- **Production**: 本番環境用（必須）
- **Preview**: プルリクエスト用（推奨）  
- **Development**: 通常は不要

### ✅ 値の入力
- コピー&ペーストを使用（手入力でミス防止）
- 前後の空白文字に注意
- 引用符は不要（Vercelが自動処理）

### ✅ セキュリティ
- `SERVICE_ROLE_KEY`は絶対に公開しない
- `ADMIN_PASSWORD`は8文字以上の複雑なパスワード
- API Keyは定期的に更新を検討

---

**🎉 設定完了後は企業レベルの予約システムとして完全稼働します！**