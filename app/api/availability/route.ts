import { NextRequest, NextResponse } from 'next/server';
import { bookingService, BookingError } from '@/lib/booking-service';
import { availabilityQuerySchema } from '@/lib/validations';
import { API_ERROR_CODES } from '@/types/api';
import type { ApiErrorResponse, ApiSuccessResponse, AvailabilityResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');
    const date = searchParams.get('date');

    // パラメータ存在確認
    if (!resourceId || !date) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: API_ERROR_CODES.INVALID_REQUEST,
          message: 'resourceIdとdateパラメータが必要です',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // バリデーション
    const validationResult = availabilityQuerySchema.safeParse({ resourceId, date });
    if (!validationResult.success) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: API_ERROR_CODES.INVALID_REQUEST,
          message: validationResult.error.issues[0].message,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 空き状況取得
    const availability = await bookingService.getAvailability(resourceId, date);

    const successResponse: ApiSuccessResponse<AvailabilityResponse> = {
      data: availability,
    };

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Availability API Error:', error);

    // カスタムエラーハンドリング
    if (error instanceof BookingError) {
      const errorResponse: ApiErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
        },
      };

      const statusCode = error.code === API_ERROR_CODES.RESOURCE_NOT_FOUND ? 404 : 400;
      return NextResponse.json(errorResponse, { status: statusCode });
    }

    // 予期しないエラー
    const errorResponse: ApiErrorResponse = {
      error: {
        code: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: '空き状況の取得に失敗しました',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}