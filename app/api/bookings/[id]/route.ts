import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Booking, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        resource:resources(*)
      `)
      .eq('id', params.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`予約取得エラー: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '予約が見つかりません' } as ApiResponse<never>,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data } as ApiResponse<Booking>
    );

  } catch (error) {
    console.error('Booking Get API Error:', error);
    return NextResponse.json(
      { success: false, error: '予約情報の取得に失敗しました' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}