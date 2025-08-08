-- ====================================================================
-- Supabase予約システム セットアップスクリプト
-- 実行順序: 1→2→3→4→5→6→7の順番でブロック単位で実行してください
-- ====================================================================

-- ====================================================================
-- 【1】拡張機能有効化 (EXCLUDE制約用)
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ====================================================================
-- 【2】テーブル作成
-- ====================================================================

-- リソーステーブル（店舗・設備など）
CREATE TABLE IF NOT EXISTS resources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 予約テーブル
CREATE TABLE IF NOT EXISTS bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id uuid NOT NULL 
        REFERENCES resources(id) ON DELETE CASCADE,
    user_email text,
    start_at timestamptz NOT NULL,
    end_at timestamptz NOT NULL,
    status text CHECK (status IN ('confirmed', 'canceled')) 
        DEFAULT 'confirmed',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ====================================================================
-- 【3】重複防止制約（EXCLUDE制約）
-- ====================================================================

-- 同一リソース・同一時間帯での確定済み予約重複を防ぐ
ALTER TABLE bookings 
ADD CONSTRAINT bookings_no_overlap_confirmed 
EXCLUDE USING gist (
    resource_id WITH =, 
    tstzrange(start_at, end_at, '[)') WITH &&
) WHERE (status = 'confirmed') 
DEFERRABLE INITIALLY IMMEDIATE;

-- ====================================================================
-- 【4】インデックス作成（パフォーマンス向上）
-- ====================================================================

-- リソース・時刻での検索最適化
CREATE INDEX IF NOT EXISTS idx_bookings_resource_time 
    ON bookings(resource_id, start_at);

-- ステータス別検索最適化  
CREATE INDEX IF NOT EXISTS idx_bookings_status 
    ON bookings(status);

-- メールアドレス検索最適化
CREATE INDEX IF NOT EXISTS idx_bookings_user_email 
    ON bookings(user_email);

-- リソース名検索最適化
CREATE INDEX IF NOT EXISTS idx_resources_name 
    ON resources(name);

-- ====================================================================
-- 【5】RLS（Row Level Security）設定
-- ====================================================================

-- RLS有効化
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（再実行時のエラー防止）
DROP POLICY IF EXISTS "resources_public_read" ON resources;
DROP POLICY IF EXISTS "resources_service_role_full" ON resources;
DROP POLICY IF EXISTS "bookings_service_role_only" ON bookings;

-- 【resources】全員読み取り可能
CREATE POLICY "resources_public_read" 
    ON resources FOR SELECT 
    TO public 
    USING (true);

-- 【resources】Service Roleは全操作可能
CREATE POLICY "resources_service_role_full" 
    ON resources FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 【bookings】Service Roleのみ全操作可能（authenticatedは禁止）
CREATE POLICY "bookings_service_role_only" 
    ON bookings FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ====================================================================
-- 【6】updated_at自動更新トリガー
-- ====================================================================

-- トリガー関数作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー適用
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 【7】シードデータ投入
-- ====================================================================

-- リソース（店舗）データ
INSERT INTO resources (id, name) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'A店'),
    ('22222222-2222-2222-2222-222222222222', 'B店'),
    ('33333333-3333-3333-3333-333333333333', 'C店')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 【テスト】競合防止制約の動作確認
-- ====================================================================

-- ✅ 1件目: 正常挿入（2024-12-01 10:00-11:00）
INSERT INTO bookings (
    resource_id, 
    user_email, 
    start_at, 
    end_at, 
    status
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test1@example.com',
    '2024-12-01 10:00:00+09',
    '2024-12-01 11:00:00+09',
    'confirmed'
);

-- ❌ 2件目: 時間重複でエラーになるべき（2024-12-01 10:30-11:30）
-- 以下をコメントアウト解除してテスト:
/*
INSERT INTO bookings (
    resource_id, 
    user_email, 
    start_at, 
    end_at, 
    status
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test2@example.com',
    '2024-12-01 10:30:00+09',
    '2024-12-01 11:30:00+09',
    'confirmed'
);
*/

-- ✅ 3件目: 異なる時間帯なので正常挿入（2024-12-01 11:00-12:00）
INSERT INTO bookings (
    resource_id, 
    user_email, 
    start_at, 
    end_at, 
    status
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test3@example.com',
    '2024-12-01 11:00:00+09',
    '2024-12-01 12:00:00+09',
    'confirmed'
);

-- ✅ 4件目: canceledステータスなので重複OK（2024-12-01 10:30-11:30）
INSERT INTO bookings (
    resource_id, 
    user_email, 
    start_at, 
    end_at, 
    status
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test4@example.com',
    '2024-12-01 10:30:00+09',
    '2024-12-01 11:30:00+09',
    'canceled'
);

-- ====================================================================
-- 【確認クエリ】
-- ====================================================================

-- 作成されたリソースを確認
SELECT 'Resources:' as table_name;
SELECT * FROM resources ORDER BY name;

-- 作成された予約を確認
SELECT 'Bookings:' as table_name;
SELECT 
    id,
    resource_id,
    user_email,
    start_at,
    end_at,
    status,
    created_at
FROM bookings 
ORDER BY start_at;

-- RLSポリシー確認
SELECT 'RLS Policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('resources', 'bookings')
ORDER BY tablename, policyname;

-- ====================================================================
-- セットアップ完了
-- ====================================================================
SELECT '🎉 Supabase予約システム セットアップ完了！' as status;