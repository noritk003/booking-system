-- 予約システム データベーススキーマ
-- PostgreSQL + Supabase用

-- 拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- リソーステーブル（店舗/担当者など）
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 予約テーブル
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('confirmed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複予約を防ぐEXCLUDE制約
    -- 同一リソースで時間帯が重複する確定済み予約を禁止
    EXCLUDE USING gist (
        resource_id WITH =,
        tsrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status = 'confirmed')
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_bookings_resource_time 
    ON bookings(resource_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status 
    ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email 
    ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_resources_name 
    ON resources(name);

-- updated_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー作成
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

-- Row Level Security (RLS) 設定
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全ユーザーが読み取り可能
CREATE POLICY "Everyone can read resources" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read confirmed bookings" ON bookings
    FOR SELECT USING (status = 'confirmed');

-- サービスロールによる全操作を許可
CREATE POLICY "Service role can do everything on resources" ON resources
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on bookings" ON bookings
    USING (auth.role() = 'service_role');

-- サンプルデータ挿入
INSERT INTO resources (name, description) VALUES 
    ('会議室A', '最大8名まで利用可能な大会議室')
ON CONFLICT DO NOTHING;

INSERT INTO resources (name, description) VALUES 
    ('会議室B', '最大4名まで利用可能な小会議室')
ON CONFLICT DO NOTHING;

INSERT INTO resources (name, description) VALUES 
    ('相談室', '1対1の相談やオンライン会議に最適')
ON CONFLICT DO NOTHING;

-- 時間帯制約チェック関数（営業時間内かチェック）
CREATE OR REPLACE FUNCTION check_business_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- JST で 9:00-18:00 の営業時間チェック
    IF EXTRACT(hour FROM (NEW.start_time AT TIME ZONE 'Asia/Tokyo')) < 9 OR
       EXTRACT(hour FROM (NEW.end_time AT TIME ZONE 'Asia/Tokyo')) > 18 THEN
        RAISE EXCEPTION '営業時間外です（9:00-18:00 JST）';
    END IF;
    
    -- 15分単位チェック
    IF EXTRACT(epoch FROM (NEW.end_time - NEW.start_time)) / 60 != 15 THEN
        RAISE EXCEPTION '予約は15分単位で設定してください';
    END IF;
    
    -- 過去日時チェック
    IF NEW.start_time <= NOW() THEN
        RAISE EXCEPTION '過去の時間は予約できません';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 営業時間チェックトリガー
DROP TRIGGER IF EXISTS check_booking_business_hours ON bookings;
CREATE TRIGGER check_booking_business_hours
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed')
    EXECUTE FUNCTION check_business_hours();

-- データベース設定完了
COMMENT ON TABLE resources IS '予約可能なリソース（会議室、担当者など）';
COMMENT ON TABLE bookings IS '予約情報テーブル';
COMMENT ON CONSTRAINT bookings_resource_id_tsrange_excl ON bookings IS '重複予約防止制約';