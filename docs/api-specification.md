# API仕様書

Next.js Route Handlers で実装された予約システムAPI。

## 共通仕様

### レスポンス形式

**成功時:**
```json
{
  "data": { ... }
}
```

**エラー時:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

### エラーコード一覧

| コード | 説明 |
|--------|------|
| `INVALID_REQUEST` | リクエストが無効 |
| `RESOURCE_NOT_FOUND` | リソースが見つからない |
| `BOOKING_NOT_FOUND` | 予約が見つからない |
| `TIME_SLOT_CONFLICT` | 時間帯が重複 |
| `INVALID_TIME_SLOT` | 無効な時間スロット |
| `DATABASE_ERROR` | データベースエラー |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

### 時刻の扱い

- **入力**: Asia/Tokyo時間のISO文字列 (`2024-12-01T10:00:00+09:00`)
- **保存**: UTC時間でデータベース保存
- **出力**: UTCとAsia/Tokyo両方を提供

## エンドポイント

### 1. 空き状況取得

```
GET /api/availability?resourceId={uuid}&date={YYYY-MM-DD}
```

**パラメータ:**
- `resourceId` (必須): リソースのUUID
- `date` (必須): 検索日付 (YYYY-MM-DD形式, Asia/Tokyo想定)

**レスポンス例:**
```json
{
  "data": {
    "date": "2024-12-01",
    "resourceId": "11111111-1111-1111-1111-111111111111",
    "timeZone": "Asia/Tokyo",
    "slots": [
      {
        "startAt": "2024-12-01T01:00:00.000Z",
        "endAt": "2024-12-01T01:15:00.000Z", 
        "startAtLocal": "2024-12-01T10:00:00+09:00",
        "endAtLocal": "2024-12-01T10:15:00+09:00",
        "available": true
      }
    ]
  }
}
```

**エラー例:**
```bash
# リソースが存在しない場合
curl "http://localhost:3000/api/availability?resourceId=invalid-uuid&date=2024-12-01"
# → 404 RESOURCE_NOT_FOUND
```

### 2. 予約作成

```
POST /api/bookings
```

**リクエストボディ:**
```json
{
  "resourceId": "11111111-1111-1111-1111-111111111111",
  "startAtLocal": "2024-12-01T10:00:00+09:00",
  "endAtLocal": "2024-12-01T10:15:00+09:00", 
  "email": "user@example.com",
  "name": "田中太郎" // オプション
}
```

**レスポンス例:**
```json
{
  "data": {
    "id": "booking-uuid",
    "resourceId": "11111111-1111-1111-1111-111111111111",
    "email": "user@example.com",
    "name": "田中太郎",
    "startAt": "2024-12-01T01:00:00.000Z",
    "endAt": "2024-12-01T01:15:00.000Z",
    "startAtLocal": "2024-12-01T10:00:00+09:00", 
    "endAtLocal": "2024-12-01T10:15:00+09:00",
    "status": "confirmed",
    "createdAt": "2024-11-20T12:00:00.000Z"
  }
}
```

**エラー例:**
```bash
# 時間重複の場合  
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"resourceId":"11111111-1111-1111-1111-111111111111","startAtLocal":"2024-12-01T10:00:00+09:00","endAtLocal":"2024-12-01T10:15:00+09:00","email":"user2@example.com"}'
# → 409 TIME_SLOT_CONFLICT
```

### 3. 予約詳細取得

```
GET /api/bookings/{id}
```

**パラメータ:**
- `id` (必須): 予約のUUID

**レスポンス:**
予約作成時と同じ形式

### 4. 予約キャンセル

```
DELETE /api/bookings/{id}
```

**パラメータ:**
- `id` (必須): 予約のUUID

**レスポンス:**
```json
{
  "data": {
    "message": "予約をキャンセルしました"
  }
}
```

## curl実行例

### 環境変数設定
```bash
export BASE_URL="http://localhost:3000"
export RESOURCE_ID="11111111-1111-1111-1111-111111111111"
```

### 1. 空き状況確認
```bash
curl "${BASE_URL}/api/availability?resourceId=${RESOURCE_ID}&date=2024-12-01" | jq
```

### 2. 予約作成  
```bash
curl -X POST "${BASE_URL}/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "'${RESOURCE_ID}'",
    "startAtLocal": "2024-12-01T10:00:00+09:00",
    "endAtLocal": "2024-12-01T10:15:00+09:00",
    "email": "test@example.com",
    "name": "テストユーザー"
  }' | jq
```

### 3. 予約確認
```bash  
export BOOKING_ID="作成された予約のID"
curl "${BASE_URL}/api/bookings/${BOOKING_ID}" | jq
```

### 4. 予約キャンセル
```bash
curl -X DELETE "${BASE_URL}/api/bookings/${BOOKING_ID}" | jq
```

## 実装のポイント

### タイムゾーン変換

```typescript
import { tokyoIsoToUtc, utcToTokyoIso } from '@/lib/time-utils';

// フロントエンドからの入力（Asia/Tokyo） → UTC変換
const utcDate = tokyoIsoToUtc('2024-12-01T10:00:00+09:00');

// DB結果（UTC） → Asia/Tokyo変換
const tokyoIso = utcToTokyoIso(new Date('2024-12-01T01:00:00.000Z'));
```

### 重複チェック

PostgreSQLのEXCLUDE制約で確実に防止:

```sql
EXCLUDE USING gist (
    resource_id WITH =, 
    tstzrange(start_at, end_at, '[)') WITH &&
) WHERE (status = 'confirmed')
```

### エラーハンドリング

```typescript
try {
  const booking = await bookingService.createBooking(data);
} catch (error) {
  if (error instanceof BookingError) {
    // カスタムエラー（適切なHTTPステータス）
    return NextResponse.json(
      { error: { code: error.code, message: error.message } }, 
      { status: error.code === 'TIME_SLOT_CONFLICT' ? 409 : 400 }
    );
  }
  // 予期しないエラー
  return NextResponse.json(
    { error: { code: 'INTERNAL_SERVER_ERROR', message: '...' } }, 
    { status: 500 }
  );
}
```

## テスト

### 正常系テスト
1. 空き状況取得 → 全スロット表示
2. 予約作成 → 201 Created
3. 同日空き状況取得 → 該当スロットが unavailable
4. 予約キャンセル → 200 OK
5. 再度空き状況取得 → スロットが available に復活

### 異常系テスト
1. 無効UUID → 400 INVALID_REQUEST  
2. 存在しないリソース → 404 RESOURCE_NOT_FOUND
3. 重複予約 → 409 TIME_SLOT_CONFLICT
4. 15分以外の時間 → 400 INVALID_TIME_SLOT
5. 過去時刻 → 400 INVALID_TIME_SLOT

## 本番環境での注意点

1. **Service Role Key保護**: 絶対にフロントエンドに漏らさない
2. **レート制限**: API Gateway やミドルウェアでの制限推奨
3. **ログ**: 個人情報をログに出力しない
4. **モニタリング**: 409エラー頻発時は UI/UX改善検討
5. **メール送信**: 失敗しても予約は成立する設計