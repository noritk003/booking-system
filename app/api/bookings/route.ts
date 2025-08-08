import { NextRequest, NextResponse } from 'next/server';
import { bookingService, BookingError } from '@/lib/booking-service';
import { createBookingSchemaRefined } from '@/lib/validations';
import { sendBookingConfirmation } from '@/lib/email';
import { API_ERROR_CODES } from '@/types/api';
import type { 
  ApiErrorResponse, 
  ApiSuccessResponse, 
  CreateBookingRequest, 
  CreateBookingResponse 
} from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディ解析
    const body: CreateBookingRequest = await request.json();
    
    // バリデーション
    const validationResult = createBookingSchemaRefined.safeParse(body);
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: API_ERROR_CODES.INVALID_REQUEST,
          message: validationResult.error.issues[0].message,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 予約作成
    const booking = await bookingService.createBooking(validationResult.data);

    // メール送信（失敗しても予約は成立）
    try {
      const resource = await bookingService.getResource(booking.resourceId);
      if (resource) {
        await sendBookingConfirmation({
          to: booking.email,
          customerName: booking.name || booking.email,
          resourceName: resource.name,
          startTime: booking.startAt,
          endTime: booking.endAt,
          bookingId: booking.id,
        });
      }
    } catch (emailError) {
      console.warn('メール送信エラー（予約は成立済み）:', emailError);
    }

    const successResponse: ApiSuccessResponse<CreateBookingResponse> = {
      data: booking,
    };

    return NextResponse.json(successResponse, { status: 201 });

  } catch (error) {
    console.error('Booking Create API Error:', error);

    // カスタムエラーハンドリング
    if (error instanceof BookingError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
        },
      };

      let statusCode = 400;
      switch (error.code) {
        case API_ERROR_CODES.RESOURCE_NOT_FOUND:
          statusCode = 404;
          break;
        case API_ERROR_CODES.TIME_SLOT_CONFLICT:
          statusCode = 409;
          break;
        default:
          statusCode = 400;
      }

      return NextResponse.json(errorResponse, { status: statusCode });
    }

    // 予期しないエラー
    const errorResponse: ApiErrorResponse = {
      error: {
        code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: '予約の作成に失敗しました',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}