import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { bookingSchema, bookingCancelSchema } from '@/lib/validations';
import { isValidTimeSlot, toUTCString } from '@/utils/time';
import { sendBookingConfirmation } from '@/lib/email';
import type { Booking, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = bookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { start_time, end_time, resource_id } = validationResult.data;

    if (!isValidTimeSlot(start_time, end_time)) {
      return NextResponse.json(
        { success: false, error: '予約は15分単位で設定してください' } as ApiResponse<never>,
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

    const booking = await db.createBooking(validationResult.data);

    try {
      await sendBookingConfirmation({
        to: booking.customer_email,
        customerName: booking.customer_name,
        resourceName: resource.name,
        startTime: booking.start_time,
        endTime: booking.end_time,
        bookingId: booking.id
      });
    } catch (emailError) {
      console.error('メール送信エラー:', emailError);
    }

    return NextResponse.json(
      { success: true, data: booking } as ApiResponse<Booking>,
      { status: 201 }
    );

  } catch (error) {
    console.error('Booking API Error:', error);
    
    if (error instanceof Error && error.message.includes('既に予約されています')) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<never>,
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: '予約の作成に失敗しました' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const booking_id = searchParams.get('booking_id');

    if (!booking_id) {
      return NextResponse.json(
        { success: false, error: 'booking_idパラメータが必要です' } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const validationResult = bookingCancelSchema.safeParse({ booking_id });
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0].message } as ApiResponse<never>,
        { status: 400 }
      );
    }

    await db.cancelBooking(booking_id);

    return NextResponse.json(
      { success: true } as ApiResponse<never>
    );

  } catch (error) {
    console.error('Booking Delete API Error:', error);
    return NextResponse.json(
      { success: false, error: '予約のキャンセルに失敗しました' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}