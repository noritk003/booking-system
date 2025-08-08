import { z } from 'zod';

export const bookingSchema = z.object({
  resource_id: z.string().uuid('リソースIDが無効です'),
  customer_name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください'),
  customer_email: z.string().email('有効なメールアドレスを入力してください'),
  customer_phone: z.string().optional(),
  start_time: z.string().datetime('開始時刻の形式が無効です'),
  end_time: z.string().datetime('終了時刻の形式が無効です'),
  notes: z.string().max(500, 'メモは500文字以内で入力してください').optional(),
});

export const availabilitySchema = z.object({
  resource_id: z.string().uuid('リソースIDが無効です'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が無効です (YYYY-MM-DD)'),
});

export const bookingCancelSchema = z.object({
  booking_id: z.string().uuid('予約IDが無効です'),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type BookingCancelInput = z.infer<typeof bookingCancelSchema>;