import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { format, parseISO, addMinutes, startOfDay, setHours, isBefore, isAfter, parse } from 'date-fns';

export const TOKYO_TIMEZONE = 'Asia/Tokyo';
export const SLOT_DURATION_MINUTES = 15;
export const BUSINESS_START_HOUR = 9;  // 9:00
export const BUSINESS_END_HOUR = 18;   // 18:00

/**
 * 日付文字列(YYYY-MM-DD)をAsia/Tokyoの開始時刻(00:00)のUTCに変換
 */
export function dateToTokyoStartOfDayUtc(dateStr: string): Date {
  const tokyoDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const tokyoStartOfDay = setHours(tokyoDate, 0);
  return zonedTimeToUtc(tokyoStartOfDay, TOKYO_TIMEZONE);
}

/**
 * 日付文字列(YYYY-MM-DD)をAsia/Tokyoの終了時刻(23:59:59)のUTCに変換  
 */
export function dateToTokyoEndOfDayUtc(dateStr: string): Date {
  const tokyoDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const tokyoEndOfDay = setHours(tokyoDate, 23);
  tokyoEndOfDay.setMinutes(59, 59, 999);
  return zonedTimeToUtc(tokyoEndOfDay, TOKYO_TIMEZONE);
}

/**
 * Asia/TokyoのISO文字列をUTCのDateオブジェクトに変換
 */
export function tokyoIsoToUtc(tokyoIsoString: string): Date {
  const tokyoDate = parseISO(tokyoIsoString);
  return zonedTimeToUtc(tokyoDate, TOKYO_TIMEZONE);
}

/**
 * UTCのDateオブジェクトをAsia/TokyoのISO文字列に変換
 */
export function utcToTokyoIso(utcDate: Date): string {
  const tokyoDate = utcToZonedTime(utcDate, TOKYO_TIMEZONE);
  return format(tokyoDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/**
 * 時刻を15分単位に丸める（切り下げ）
 */
export function roundToNearestSlot(date: Date): Date {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / SLOT_DURATION_MINUTES) * SLOT_DURATION_MINUTES;
  
  const rounded = new Date(date);
  rounded.setMinutes(roundedMinutes, 0, 0);
  return rounded;
}

/**
 * 指定日(Asia/Tokyo)の営業時間内15分スロットをすべて生成
 * @param dateStr YYYY-MM-DD形式の日付
 * @returns スロットの配列（UTCとAsia/Tokyo両方含む）
 */
export function generateDaySlots(dateStr: string): Array<{
  startAt: Date;     // UTC
  endAt: Date;       // UTC  
  startAtLocal: string; // Asia/Tokyo ISO
  endAtLocal: string;   // Asia/Tokyo ISO
}> {
  const slots = [];
  
  // Asia/Tokyoでの営業開始・終了時刻を作成
  const baseDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const businessStart = setHours(baseDate, BUSINESS_START_HOUR);
  const businessEnd = setHours(baseDate, BUSINESS_END_HOUR);
  
  let currentTokyo = businessStart;
  
  while (isBefore(currentTokyo, businessEnd)) {
    const nextTokyo = addMinutes(currentTokyo, SLOT_DURATION_MINUTES);
    
    // Asia/TokyoからUTCに変換
    const startAtUtc = zonedTimeToUtc(currentTokyo, TOKYO_TIMEZONE);
    const endAtUtc = zonedTimeToUtc(nextTokyo, TOKYO_TIMEZONE);
    
    slots.push({
      startAt: startAtUtc,
      endAt: endAtUtc,
      startAtLocal: format(currentTokyo, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      endAtLocal: format(nextTokyo, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    });
    
    currentTokyo = nextTokyo;
  }
  
  return slots;
}

/**
 * 時間スロットが有効かチェック（15分単位、営業時間内）
 */
export function isValidTimeSlot(startAtLocal: string, endAtLocal: string): boolean {
  try {
    const start = parseISO(startAtLocal);
    const end = parseISO(endAtLocal);
    
    // 15分ちょうどかチェック
    const durationMs = end.getTime() - start.getTime();
    if (durationMs !== SLOT_DURATION_MINUTES * 60 * 1000) {
      return false;
    }
    
    // 15分の境界にアライメントされているかチェック
    const startMinutes = start.getMinutes();
    if (startMinutes % SLOT_DURATION_MINUTES !== 0) {
      return false;
    }
    
    // 営業時間内かチェック（Asia/Tokyo基準）
    const startHour = start.getHours();
    if (startHour < BUSINESS_START_HOUR || startHour >= BUSINESS_END_HOUR) {
      return false;
    }
    
    // 未来の時刻かチェック
    const nowUtc = new Date();
    const startUtc = tokyoIsoToUtc(startAtLocal);
    if (!isAfter(startUtc, nowUtc)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * 予約データから時間重複をチェックするユーティリティ
 */
export function hasTimeOverlap(
  existingBookings: Array<{ startAt: string; endAt: string; status: string }>,
  newStartAt: Date,
  newEndAt: Date
): boolean {
  return existingBookings.some(booking => {
    if (booking.status !== 'confirmed') return false;
    
    const bookingStart = parseISO(booking.startAt);
    const bookingEnd = parseISO(booking.endAt);
    
    // 重複チェック: 新しい予約の開始が既存予約終了前 AND 新しい予約の終了が既存予約開始後
    return (
      isBefore(newStartAt, bookingEnd) && isAfter(newEndAt, bookingStart)
    );
  });
}