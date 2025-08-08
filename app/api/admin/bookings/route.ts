import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import type { Booking, ApiResponse } from '@/types';

export async function GET() {
  try {
    const bookings = await db.getBookings();

    return NextResponse.json(
      { success: true, data: bookings } as ApiResponse<Booking[]>
    );

  } catch (error) {
    console.error('Admin Bookings API Error:', error);
    return NextResponse.json(
      { success: false, error: '予約情報の取得に失敗しました' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}