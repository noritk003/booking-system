import 'server-only';
import { supabaseAdmin } from './supabase-admin';
import type { Resource, Booking, BookingFormData } from '@/types';

export class DatabaseService {
  async getResources(): Promise<Resource[]> {
    const { data, error } = await supabaseAdmin
      .from('resources')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`リソース取得エラー: ${error.message}`);
    }

    return data || [];
  }

  async getResource(id: string): Promise<Resource | null> {
    const { data, error } = await supabaseAdmin
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`リソース取得エラー: ${error.message}`);
    }

    return data || null;
  }

  async getBookings(resourceId?: string): Promise<Booking[]> {
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        resource:resources(*)
      `)
      .eq('status', 'confirmed')
      .order('start_at');

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`予約取得エラー: ${error.message}`);
    }

    // データベースのフィールドを型定義に合わせて変換
    const bookings = (data || []).map(booking => ({
      id: booking.id,
      resource_id: booking.resource_id,
      customer_name: booking.user_email || '', // user_emailをcustomer_nameとして使用
      customer_email: booking.user_email || '',
      start_at: booking.start_at,
      end_at: booking.end_at,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      resource: booking.resource
    }));

    return bookings;
  }

  async createBooking(bookingData: BookingFormData): Promise<Booking> {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        resource_id: bookingData.resource_id,
        user_email: bookingData.customer_email,
        start_at: bookingData.start_at,
        end_at: bookingData.end_at,
        status: 'confirmed'
      })
      .select(`
        *,
        resource:resources(*)
      `)
      .single();

    if (error) {
      if (error.code === '23P01') {
        throw new Error('指定された時間帯は既に予約されています');
      }
      throw new Error(`予約作成エラー: ${error.message}`);
    }

    // データベースのフィールドを型定義に合わせて変換
    return {
      id: data.id,
      resource_id: data.resource_id,
      customer_name: data.user_email || '',
      customer_email: data.user_email || '',
      start_at: data.start_at,
      end_at: data.end_at,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      resource: data.resource
    };
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      throw new Error(`予約キャンセルエラー: ${error.message}`);
    }
  }

  async getBookingsByDateRange(
    resourceId: string,
    startDate: string,
    endDate: string
  ): Promise<Booking[]> {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        resource:resources(*)
      `)
      .eq('resource_id', resourceId)
      .eq('status', 'confirmed')
      .gte('start_at', startDate)
      .lte('end_at', endDate)
      .order('start_at');

    if (error) {
      throw new Error(`予約取得エラー: ${error.message}`);
    }

    // データベースのフィールドを型定義に合わせて変換
    const bookings = (data || []).map(booking => ({
      id: booking.id,
      resource_id: booking.resource_id,
      customer_name: booking.user_email || '',
      customer_email: booking.user_email || '',
      start_at: booking.start_at,
      end_at: booking.end_at,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      resource: booking.resource
    }));

    return bookings;
  }
}

export const db = new DatabaseService();