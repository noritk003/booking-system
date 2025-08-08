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

## Vercelデプロイ

### 1. Vercel CLI インストール

\`\`\`bash
npm i -g vercel
\`\`\`

### 2. プロジェクトデプロイ

\`\`\`bash
vercel
\`\`\`

### 3. 環境変数の設定

Vercelダッシュボードで以下を設定：

**重要**: セキュリティのため、公開キーと秘密キーを区別して設定

#### 公開される環境変数（フロントエンドで利用）
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

#### 秘密の環境変数（サーバーサイドのみ）
- \`SUPABASE_SERVICE_ROLE_KEY\` ⚠️ **絶対にフロントエンドに露出させない**
- \`RESEND_API_KEY\` または \`SENDGRID_API_KEY\`
- \`EMAIL_PROVIDER\`
- \`FROM_EMAIL\`

### 4. デプロイ設定

- **Runtime**: Node.js（Edgeランタイムは不要）
- **Build Command**: \`npm run build\`
- **Output Directory**: \`.next\`

### 5. データベースアクセス

Vercel デプロイ後、Supabaseの**Connection Pooler**を使用することを推奨：
- **Transaction Mode**: 短期間のAPIコール用
- **Session Mode**: 長時間の処理用

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