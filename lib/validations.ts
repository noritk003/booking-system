import { z } from 'zod';

// 空き状況取得のバリデーション
export const availabilityQuerySchema = z.object({
  resourceId: z.string().uuid('リソースIDが無効です'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が無効です (YYYY-MM-DD)'),
});

// 予約作成のバリデーション  
export const createBookingSchema = z.object({
  resourceId: z.string().uuid('リソースIDが無効です'),
  startAtLocal: z.string().datetime('開始時刻の形式が無効です'),
  endAtLocal: z.string().datetime('終了時刻の形式が無効です'),
  email: z.string().email('有効なメールアドレスを入力してください').max(254, 'メールアドレスが長すぎます'),
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください').optional(),
});

// 管理者認証のバリデーション
export const adminAuthSchema = z.object({
  password: z.string().min(8, 'パスワードは8文字以上で入力してください').max(128, 'パスワードが長すぎます'),
});

// セキュリティヘッダーのバリデーション
export const idempotencyKeySchema = z.string()
  .min(32, 'Idempotency keyは32文字以上である必要があります')
  .max(255, 'Idempotency keyが長すぎます')
  .regex(/^[a-zA-Z0-9-_]+$/, 'Idempotency keyに無効な文字が含まれています');

// 予約キャンセルのバリデーション
export const cancelBookingParamsSchema = z.object({
  id: z.string().uuid('予約IDが無効です'),
});

// UUID検証のヘルパー
export const uuidSchema = z.string().uuid();

// 日付文字列検証のヘルパー
export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  '日付はYYYY-MM-DD形式で入力してください'
);

// ISO datetime検証のヘルパー
export const isoDatetimeSchema = z.string().datetime();

// 型推論の作成
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type CreateBookingRequest = z.infer<typeof createBookingSchema>;
export type CancelBookingParams = z.infer<typeof cancelBookingParamsSchema>;

// カスタムバリデーター: 15分スロットチェック
export const validateTimeSlotDuration = (startAtLocal: string, endAtLocal: string) => {
  try {
    const start = new Date(startAtLocal);
    const end = new Date(endAtLocal);
    const durationMs = end.getTime() - start.getTime();
    const expectedDurationMs = 15 * 60 * 1000; // 15分
    
    return durationMs === expectedDurationMs;
  } catch {
    return false;
  }
};

// リファインされた予約スキーマ（時間スロット検証付き）
export const createBookingSchemaRefined = createBookingSchema.refine(
  (data) => validateTimeSlotDuration(data.startAtLocal, data.endAtLocal),
  {
    message: '予約は15分単位で設定してください',
    path: ['endAtLocal'],
  }
);