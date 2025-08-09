# 予約システム

Next.js 14 (App Router) + Supabase + TypeScriptで構築された予約管理システムです。

## 主な機能

- 📅 **予約フロー**: カレンダーUI + 15分刻みの時間スロット選択
- 🏢 **リソース管理**: 店舗/担当者などのリソース管理
- ⏰ **時間制御**: UTC保存・JST表示、PostgresのEXCLUDE制約による競合防止
- 📧 **メール通知**: Resend/SendGrid対応の予約確認メール
- 🛡️ **バリデーション**: Zodによる型安全なフォーム検証
- 👨‍💼 **管理画面**: 予約一覧・キャンセル機能
- 🧪 **E2Eテスト**: Playwrightによる主要フローのテスト

## ディレクトリ構造

\`\`\`
booking-system/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── availability/     # 空き状況API
│   │   ├── bookings/         # 予約作成・削除API
│   │   ├── resources/        # リソース一覧API
│   │   └── admin/            # 管理用API
│   ├── admin/                # 管理画面
│   ├── book-success/         # 予約完了ページ
│   ├── globals.css           # グローバルスタイル
│   └── layout.tsx            # ルートレイアウト
├── components/               # Reactコンポーネント
│   ├── BookingCalendar.tsx   # カレンダー・時間スロット選択
│   └── BookingForm.tsx       # 予約フォーム
├── lib/                      # ライブラリ・設定
│   ├── database.ts           # DB アクセス層
│   ├── email.ts              # メール送信
│   ├── supabase.ts           # Supabase クライアント
│   ├── supabase-admin.ts     # Supabase 管理用クライアント
│   └── validations.ts        # Zod スキーマ定義
├── types/                    # TypeScript型定義
├── utils/                    # ユーティリティ関数
│   └── time.ts               # 時刻処理
└── tests/e2e/               # Playwright E2Eテスト
    ├── booking.spec.ts       # 予約フローテスト
    ├── admin.spec.ts         # 管理画面テスト
    └── api.spec.ts           # API テスト
\`\`\`

## 環境構築

### 1. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 2. 環境変数の設定

\`.env.sample\`をコピーして\`.env.local\`を作成：

\`\`\`bash
cp .env.sample .env.local
\`\`\`

必要な環境変数を設定：

| 変数名 | 説明 | 必須 |
|--------|------|------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | SupabaseプロジェクトURL | ✅ |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Supabase匿名キー（公開用） | ✅ |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Supabaseサービスロールキー（秘密） | ✅ |
| \`EMAIL_PROVIDER\` | \`resend\` または \`sendgrid\` | ✅ |
| \`FROM_EMAIL\` | 送信元メールアドレス | ✅ |
| \`RESEND_API_KEY\` | ResendのAPIキー（Resend使用時） | - |
| \`SENDGRID_API_KEY\` | SendGridのAPIキー（SendGrid使用時） | - |

### 3. Supabaseデータベースセットアップ

Supabaseプロジェクトで以下のSQLを実行：

\`\`\`sql
-- 拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- リソーステーブル
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 予約テーブル
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 重複予約を防ぐEXCLUDE制約（PostgreSQL）
  EXCLUDE USING gist (
    resource_id WITH =,
    tsrange(start_time, end_time, '[)') WITH &&
  ) WHERE (status = 'confirmed')
);

-- インデックス
CREATE INDEX idx_bookings_resource_time ON bookings(resource_id, start_time, end_time);
CREATE INDEX idx_bookings_status ON bookings(status);

-- サンプルデータ挿入
INSERT INTO resources (name, description) VALUES 
('会議室A', '最大8名まで利用可能'),
('会議室B', '最大4名まで利用可能'),
('相談室', '1対1の相談に最適');
\`\`\`

### 4. 開発サーバー起動

\`\`\`bash
npm run dev
\`\`\`

http://localhost:3000 でアプリにアクセスできます。

## 時刻の取り扱い

### データベース保存
- すべての日時は**UTC**で保存
- PostgreSQLの\`TIMESTAMP WITH TIME ZONE\`型を使用

### UIレンダリング
- フロントエンドでは**Asia/Tokyo**（JST）で表示
- \`date-fns-tz\`を使用してタイムゾーン変換

### 15分刻みスロット
- 営業時間: 9:00-18:00（JST）
- 予約単位: 15分
- スロット生成は\`utils/time.ts\`で管理

## 競合防止メカニズム

PostgreSQLの\`EXCLUDE\`制約により、同一リソース・同一時間帯での重複予約を**データベースレベル**で防止：

\`\`\`sql
EXCLUDE USING gist (
  resource_id WITH =,
  tsrange(start_time, end_time, '[)') WITH &&
) WHERE (status = 'confirmed')
\`\`\`

## 開発コマンド

\`\`\`bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# TypeScript型チェック
npm run type-check

# ESLint実行
npm run lint

# E2Eテスト実行
npm run test:e2e

# E2EテストUI起動
npm run test:e2e:ui
\`\`\`

## Vercelデプロイ手順

### 1. GitHub/GitLab連携でプロジェクトをインポート

#### 1-1. Vercelダッシュボードでプロジェクト作成
1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. **「Add New...」** → **「Project」**をクリック
3. **「Import Git Repository」**でリポジトリを選択
4. **「Import」**をクリック

#### 1-2. デプロイ設定
- **Framework Preset**: \`Next.js\` を選択（自動検出）
- **Build and Output Settings**:
  - **Build Command**: \`npm run build\` （デフォルトのまま）
  - **Output Directory**: \`.next\` （デフォルトのまま）
  - **Install Command**: \`npm ci\` （デフォルトのまま）

### 2. 環境変数の設定

**重要**: ProductionとPreview両方に設定する必要があります。

#### 2-1. 設定箇所
1. Vercelプロジェクトの **「Settings」** → **「Environment Variables」**
2. 各環境変数を **Production** と **Preview** の両方にチェック ✅

#### 2-2. 必須環境変数

| 環境変数名 | 値の例 | Environment |
|-----------|-------|-------------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | \`https://xxxxx.supabase.co\` | Production + Preview |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | \`eyJhbGc...\` | Production + Preview |
| \`SUPABASE_SERVICE_ROLE_KEY\` | \`eyJhbGc...\` | Production + Preview |
| \`ADMIN_EMAIL\` | \`admin@yourdomain.com\` | Production + Preview |
| \`PUBLIC_SITE_URL\` | \`https://yourdomain.vercel.app\` | Production + Preview |

#### 2-3. メール送信設定（いずれか選択）

**Resend使用時:**
\`\`\`
RESEND_API_KEY=re_xxxxxxxxxx
\`\`\`

**SendGrid使用時:**
\`\`\`
SENDGRID_API_KEY=SG.xxxxxxxxxx
\`\`\`

#### 2-4. セキュリティ注意点
⚠️ **\`SUPABASE_SERVICE_ROLE_KEY\`は管理者権限を持つため要注意**
- サーバーサイドでのみ利用
- RLS（Row Level Security）をバイパス可能
- 絶対に公開リポジトリにコミットしない

### 3. 初回デプロイ実行

1. **「Deploy」**ボタンをクリック
2. ビルドログを確認（通常2-3分で完了）
3. デプロイ完了後、Vercel URLでアクセス確認

### 4. データベースセットアップ

#### 4-1. Supabase SQL Editorでスキーマ作成

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. 該当プロジェクトの **「SQL Editor」**を開く
3. **「New query」**で以下のSQLを実行：

\`\`\`sql
-- 1. 拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. リソーステーブル
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 予約テーブル
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  start_at_local VARCHAR(50) NOT NULL,
  end_at_local VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 重複予約を防ぐEXCLUDE制約
  EXCLUDE USING gist (
    resource_id WITH =,
    tsrange(start_at, end_at, '[)') WITH &&
  ) WHERE (status = 'confirmed')
);

-- 4. インデックス作成
CREATE INDEX idx_bookings_resource_time ON bookings(resource_id, start_at, end_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(email);

-- 5. RLS (Row Level Security) 設定
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシー設定（全ユーザー読み取り可能）
CREATE POLICY "Resources are viewable by everyone" ON resources FOR SELECT USING (true);
CREATE POLICY "Bookings are viewable by everyone" ON bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their bookings" ON bookings FOR UPDATE USING (true);

-- 7. サンプルデータ挿入
INSERT INTO resources (id, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'A店', '営業時間: 9:00-18:00 / 定員: 4名'),
('22222222-2222-2222-2222-222222222222', 'B店', '営業時間: 9:00-18:00 / 定員: 6名'),
('33333333-3333-3333-3333-333333333333', 'C店', '営業時間: 10:00-17:00 / 定員: 2名');
\`\`\`

#### 4-2. スキーマ適用確認

1. **「Tables」**タブで \`resources\` と \`bookings\` テーブルが作成されていることを確認
2. **「Authentication」** → **「Policies」**でRLSポリシーが設定されていることを確認

### 5. カスタムドメイン接続（オプション）

#### 5-1. ドメイン追加
1. Vercelプロジェクトの **「Settings」** → **「Domains」**
2. **「Add」**で独自ドメインを追加
3. DNS設定でCNAMEレコードを設定：
   \`\`\`
   CNAME  yourdomain.com  cname.vercel-dns.com
   \`\`\`

#### 5-2. HTTPS自動設定
- Vercelが自動的にSSL証明書を発行
- Let's Encryptによる無料HTTPS対応
- 証明書の自動更新

#### 5-3. 環境変数の更新
カスタムドメイン設定後、\`PUBLIC_SITE_URL\`を更新：
\`\`\`
PUBLIC_SITE_URL=https://yourdomain.com
\`\`\`

### 6. デプロイ確認

#### 6-1. 動作確認項目
- [ ] トップページの表示
- [ ] リソース選択機能
- [ ] 日付・時間選択機能
- [ ] 予約フォーム送信
- [ ] 管理画面アクセス（\`/admin\`）
- [ ] メール送信テスト（実際の予約作成）

#### 6-2. ログ確認
1. Vercelダッシュボードの **「Functions」** → **「View Function Logs」**
2. エラーがないことを確認
3. Supabaseダッシュボードの **「Logs」**でDB接続を確認

### 7. 失敗時のロールバック方法

#### 7-1. 前のデプロイに戻す
1. Vercelプロジェクトの **「Deployments」**タブ
2. 正常に動作していた過去のデプロイを選択
3. **「...」** → **「Promote to Production」**をクリック
4. **「Promote」**で確定

#### 7-2. 緊急時の手動ロールバック
\`\`\`bash
# Vercel CLIを使用
vercel --prod --promote [deployment-url]

# 特定のコミットにロールバック
git revert [commit-hash]
git push origin main  # Vercelが自動再デプロイ
\`\`\`

#### 7-3. 環境変数の問題時
1. **「Settings」** → **「Environment Variables」**
2. 問題のある環境変数を **「Edit」**または**「Delete」**
3. **「Redeploy」**を実行

### 8. 本番運用のベストプラクティス

#### 8-1. モニタリング設定
\`\`\`bash
# Vercel Analytics有効化
npm i @vercel/analytics

# Speed Insights有効化  
npm i @vercel/speed-insights
\`\`\`

#### 8-2. セキュリティ対策
- [ ] Supabase RLS設定確認
- [ ] 管理画面のBasic認証設定
- [ ] 環境変数の適切な管理
- [ ] HTTPS強制設定

#### 8-3. パフォーマンス最適化
- [ ] Supabase Connection Pooling有効化
- [ ] Vercel Edge Caching設定
- [ ] 画像最適化設定

### 9. トラブルシューティング

| エラー内容 | 原因 | 解決方法 |
|-----------|------|---------|  
| \`Build failed\` | 環境変数未設定 | Production/Preview両方に環境変数を設定 |
| \`Database connection failed\` | Supabase設定エラー | URLとキーを再確認、RLS設定チェック |
| \`Email sending failed\` | メールプロバイダー設定エラー | API キーとドメイン認証を確認 |
| \`Function timeout\` | API処理時間超過 | クエリ最適化、Connection Pool利用 |

## トラブルシューティング

### Supabase接続エラー
1. 環境変数が正しく設定されているか確認
2. SupabaseプロジェクトのRLS（Row Level Security）設定を確認
3. Service Roleキーには管理者権限があることを確認

### メール送信エラー
1. \`EMAIL_PROVIDER\`が\`resend\`または\`sendgrid\`に設定されているか確認
2. 対応するAPIキーが正しく設定されているか確認
3. \`FROM_EMAIL\`がドメイン認証済みのメールアドレスか確認

### タイムゾーン問題
1. データベースに保存される時刻がUTCか確認
2. フロントエンドでJST変換が正しく行われているか確認
3. ブラウザのタイムゾーン設定を確認

## 本番運用時の注意点

### セキュリティ
- Service Role キーは絶対にフロントエンドに露出させない
- 本番環境では\`ADMIN_USERNAME\`/\`ADMIN_PASSWORD\`でBasic認証を設定
- HTTPS必須（Vercelでは自動設定）

### パフォーマンス
- Supabase Connection Poolerの利用推奨
- 大量の予約がある場合はクエリ最適化を検討
- CDNキャッシュの適切な設定

### モニタリング
- Vercel Analytics/Speed Insights の有効化
- Supabaseダッシュボードでクエリパフォーマンスを監視
- エラー追跡ツール（Sentry等）の導入推奨

## ライセンス

MIT License