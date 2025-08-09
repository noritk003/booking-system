import { NextRequest, NextResponse } from 'next/server';
import { bookingService, BookingError } from '@/lib/booking-service';
import { availabilityQuerySchema } from '@/lib/validations';
import { API_ERROR_CODES } from '@/types/api';
import { createSecureResponse, createErrorResponse } from '@/lib/security';
import { generateTimeSlots } from '@/lib/time-utils';
import type { ApiErrorResponse, ApiSuccessResponse, AvailabilityResponse, TimeSlot } from '@/types/api';

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
      return createErrorResponse(
        validationResult.error.issues[0].message,
        400,
        API_ERROR_CODES.INVALID_REQUEST
      );
    }

    try {
      // 空き状況取得
      const availability = await bookingService.getAvailability(resourceId, date);
      
      return createSecureResponse({
        data: availability
      });
    } catch (bookingError) {
      // データベース接続エラーの場合はダミーデータを返す
      console.warn('⚠️ 空き状況取得でエラー、ダミーデータを返します');
      
      const dummySlots = generateTimeSlots(date);
      const dummyAvailability: AvailabilityResponse = {
        date,
        resourceId,
        timeZone: 'Asia/Tokyo',
        slots: dummySlots.map(slot => ({
          ...slot,
          available: true // 全て空きとして返す
        }))
      };
      
      return createSecureResponse({
        data: dummyAvailability,
        warning: 'デモモードで動作中です'
      });
    }

  } catch (error) {
    console.error('❌ 空き状況API予期しないエラー:', error instanceof Error ? error.message : 'Unknown error');

    // フォールバック用ダミーデータを返す
    const fallbackDate = new Date().toISOString().split('T')[0];
    const dummySlots = generateTimeSlots(fallbackDate);
    const fallbackAvailability: AvailabilityResponse = {
      date: fallbackDate,
      resourceId: 'fallback',
      timeZone: 'Asia/Tokyo',
      slots: dummySlots.map(slot => ({
        ...slot,
        available: true
      }))
    };

    return createSecureResponse({
      data: fallbackAvailability,
      warning: 'システムエラーのため、デモデータを表示しています'
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, 200, {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
}