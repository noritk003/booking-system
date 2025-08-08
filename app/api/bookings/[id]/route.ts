import { NextRequest, NextResponse } from 'next/server';
import { bookingService, BookingError } from '@/lib/booking-service';
import { cancelBookingParamsSchema } from '@/lib/validations';
import { API_ERROR_CODES } from '@/types/api';
import type { 
  ApiErrorResponse, 
  ApiSuccessResponse, 
  CreateBookingResponse 
} from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // パラメータバリデーション
    const validationResult = cancelBookingParamsSchema.safeParse({ id: params.id });
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: API_ERROR_CODES.INVALID_REQUEST,
          message: validationResult.error.issues[0].message,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 予約取得
    const booking = await bookingService.getBooking(params.id);

    if (!booking) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: API_ERROR_CODES.BOOKING_NOT_FOUND,
          message: '予約が見つかりません',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const successResponse: ApiSuccessResponse<CreateBookingResponse> = {
      data: booking,
    };

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Booking Get API Error:', error);

    if (error instanceof BookingError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
        },
      };

      const statusCode = error.code === API_ERROR_CODES.BOOKING_NOT_FOUND ? 404 : 400;
      return NextResponse.json(errorResponse, { status: statusCode });
    }

    const errorResponse: ApiErrorResponse = {
      error: {
        code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: '予約情報の取得に失敗しました',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // パラメータバリデーション
    const validationResult = cancelBookingParamsSchema.safeParse({ id: params.id });
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: API_ERROR_CODES.INVALID_REQUEST,
          message: validationResult.error.issues[0].message,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 予約キャンセル（status='canceled'に更新）
    await bookingService.cancelBooking(params.id);

    const successResponse: ApiSuccessResponse<{ message: string }> = {
      data: { message: '予約をキャンセルしました' },
    };

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Booking Cancel API Error:', error);

    if (error instanceof BookingError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
        },
      };

      const statusCode = error.code === API_ERROR_CODES.BOOKING_NOT_FOUND ? 404 : 400;
      return NextResponse.json(errorResponse, { status: statusCode });
    }

    const errorResponse: ApiErrorResponse = {
      error: {
        code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: '予約のキャンセルに失敗しました',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}