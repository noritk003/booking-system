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
      .order('start_time');

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`予約取得エラー: ${error.message}`);
    }

    return data || [];
  }

  async createBooking(bookingData: BookingFormData): Promise<Booking> {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        ...bookingData,
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

    return data;
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
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time');

    if (error) {
      throw new Error(`予約取得エラー: ${error.message}`);
    }

    return data || [];
  }
}

export const db = new DatabaseService();