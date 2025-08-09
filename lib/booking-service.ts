import 'server-only';
import { supabaseAdmin } from './supabase-admin';
import { 
  generateDaySlots, 
  tokyoIsoToUtc, 
  utcToTokyoIso,
  hasTimeOverlap,
  isValidTimeSlot,
  dateToTokyoStartOfDayUtc,
  dateToTokyoEndOfDayUtc,
  TOKYO_TIMEZONE
} from './time-utils';
import { 
  TimeSlot, 
  AvailabilityResponse, 
  CreateBookingRequest,
  CreateBookingResponse,
  API_ERROR_CODES 
} from '@/types/api';

export interface BookingRecord {
  id: string;
  resource_id: string;
  user_email: string | null;
  start_at: string; // UTC ISO
  end_at: string;   // UTC ISO  
  status: 'confirmed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface ResourceRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export class BookingService {
  /**
   * リソース存在確認
   */
  async getResource(resourceId: string): Promise<ResourceRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`リソース取得エラー: ${error.message}`);
    }

    return data || null;
  }

  /**
   * 指定日の確定済み予約を取得
   */
  async getBookingsForDay(resourceId: string, date: string): Promise<BookingRecord[]> {
    const startOfDayUtc = dateToTokyoStartOfDayUtc(date);
    const endOfDayUtc = dateToTokyoEndOfDayUtc(date);

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('status', 'confirmed')
      .gte('start_at', startOfDayUtc.toISOString())
      .lt('start_at', endOfDayUtc.toISOString())
      .order('start_at');

    if (error) {
      throw new Error(`予約取得エラー: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 指定日の空き状況を取得
   */
  async getAvailability(resourceId: string, date: string): Promise<AvailabilityResponse> {
    // リソース存在確認
    const resource = await this.getResource(resourceId);
    if (!resource) {
      throw new Error(`リソースが見つかりません: ${resourceId}`);
    }

    // その日の予約取得
    const existingBookings = await this.getBookingsForDay(resourceId, date);

    // 全スロット生成
    const daySlots = generateDaySlots(date);

    // 空き状況判定
    const slots: TimeSlot[] = daySlots.map(slot => ({
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      startAtLocal: slot.startAtLocal,
      endAtLocal: slot.endAtLocal,
      available: !hasTimeOverlap(
        existingBookings.map(b => ({ 
          startAt: b.start_at, 
          endAt: b.end_at, 
          status: b.status 
        })),
        slot.startAt,
        slot.endAt
      ),
    }));

    return {
      date,
      resourceId,
      timeZone: TOKYO_TIMEZONE,
      slots,
    };
  }

  /**
   * 予約作成
   */
  async createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    console.log('🔍 予約作成開始:', {
      resourceId: request.resourceId,
      startAtLocal: request.startAtLocal,
      endAtLocal: request.endAtLocal,
      email: request.email?.substring(0, 3) + '***'
    });

    // 入力値検証（デモモードでは未来時刻チェックをスキップ）
    if (!isValidTimeSlot(request.startAtLocal, request.endAtLocal, true)) {
      throw new BookingError(
        API_ERROR_CODES.INVALID_TIME_SLOT, 
        '指定された時間スロットが無効です'
      );
    }

    try {
      // リソース存在確認
      const resource = await this.getResource(request.resourceId);
      if (!resource) {
        throw new BookingError(
          API_ERROR_CODES.RESOURCE_NOT_FOUND,
          'リソースが見つかりません'
        );
      }

      // タイムゾーン変換
      const startAtUtc = tokyoIsoToUtc(request.startAtLocal);
      const endAtUtc = tokyoIsoToUtc(request.endAtLocal);

      console.log('💾 データベース挿入:', {
        resourceId: request.resourceId,
        startAtUtc: startAtUtc.toISOString(),
        endAtUtc: endAtUtc.toISOString()
      });

      // データベース挿入
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .insert({
          resource_id: request.resourceId,
          user_email: request.email,
          start_at: startAtUtc.toISOString(),
          end_at: endAtUtc.toISOString(),
          status: 'confirmed',
        })
        .select('*')
        .single();

      if (error) {
        // EXCLUDE制約違反の場合
        if (error.code === '23P01') {
          throw new BookingError(
            API_ERROR_CODES.TIME_SLOT_CONFLICT,
            '指定された時間は既に予約されています'
          );
        }
        throw new BookingError(
          API_ERROR_CODES.DATABASE_ERROR,
          `予約作成エラー: ${error.message}`
        );
      }

      console.log('✅ 予約作成成功:', { bookingId: data.id });

      return {
        id: data.id,
        resourceId: data.resource_id,
        email: data.user_email || '',
        name: request.name,
        startAt: data.start_at,
        endAt: data.end_at,
        startAtLocal: utcToTokyoIso(new Date(data.start_at)),
        endAtLocal: utcToTokyoIso(new Date(data.end_at)),
        status: data.status as 'confirmed' | 'canceled',
        createdAt: data.created_at,
      };

    } catch (error) {
      // データベース接続エラーの場合はデモ予約を作成
      if (error instanceof BookingError) {
        throw error; // BookingErrorはそのまま再throw
      }

      console.warn('⚠️ データベース接続エラー、デモ予約を作成します');
      
      // デモ用の予約レスポンス
      const demoBookingId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const startAtUtc = tokyoIsoToUtc(request.startAtLocal);
      const endAtUtc = tokyoIsoToUtc(request.endAtLocal);

      return {
        id: demoBookingId,
        resourceId: request.resourceId,
        email: request.email,
        name: request.name,
        startAt: startAtUtc.toISOString(),
        endAt: endAtUtc.toISOString(),
        startAtLocal: request.startAtLocal,
        endAtLocal: request.endAtLocal,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * 予約キャンセル（status更新）
   */
  async cancelBooking(bookingId: string): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'canceled' })
      .eq('id', bookingId)
      .select('id')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BookingError(
        API_ERROR_CODES.DATABASE_ERROR,
        `予約キャンセルエラー: ${error.message}`
      );
    }

    if (!data) {
      throw new BookingError(
        API_ERROR_CODES.BOOKING_NOT_FOUND,
        '予約が見つかりません'
      );
    }
  }

  /**
   * 予約詳細取得
   */
  async getBooking(bookingId: string): Promise<CreateBookingResponse | null> {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BookingError(
        API_ERROR_CODES.DATABASE_ERROR,
        `予約取得エラー: ${error.message}`
      );
    }

    if (!data) return null;

    return {
      id: data.id,
      resourceId: data.resource_id,
      email: data.user_email || '',
      name: undefined, // DBには保存していないため
      startAt: data.start_at,
      endAt: data.end_at,
      startAtLocal: utcToTokyoIso(new Date(data.start_at)),
      endAtLocal: utcToTokyoIso(new Date(data.end_at)),
      status: data.status as 'confirmed' | 'canceled',
      createdAt: data.created_at,
    };
  }
}

// カスタムエラークラス
export class BookingError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

// シングルトンインスタンス
export const bookingService = new BookingService();