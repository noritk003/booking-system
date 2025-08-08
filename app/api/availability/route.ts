import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { generateTimeSlots } from '@/utils/time';
import { availabilitySchema } from '@/lib/validations';
import type { AvailabilityResponse, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource_id = searchParams.get('resource_id');
    const date = searchParams.get('date');

    if (!resource_id || !date) {
      return NextResponse.json(
        { success: false, error: 'resource_idとdateパラメータが必要です' } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const validationResult = availabilitySchema.safeParse({ resource_id, date });
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const resource = await db.getResource(resource_id);
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'リソースが見つかりません' } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const startOfDay = `${date}T00:00:00Z`;
    const endOfDay = `${date}T23:59:59Z`;
    
    const existingBookings = await db.getBookingsByDateRange(
      resource_id,
      startOfDay,
      endOfDay
    );

    const slots = generateTimeSlots(date, existingBookings);

    const response: AvailabilityResponse = {
      date,
      resource_id,
      slots
    };

    return NextResponse.json(
      { success: true, data: response } as ApiResponse<AvailabilityResponse>
    );

  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json(
      { success: false, error: '空き状況の取得に失敗しました' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}