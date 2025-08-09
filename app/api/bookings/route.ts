import { NextRequest, NextResponse } from 'next/server';
import { bookingService, BookingError } from '@/lib/booking-service';
import { createBookingSchemaRefined } from '@/lib/validations';
import { EmailService, isEmailConfigured } from '@/lib/email-service';
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { TOKYO_TIMEZONE } from '@/lib/time-utils';
import { API_ERROR_CODES } from '@/types/api';
import { createSecureResponse, createErrorResponse, createSafeLogObject } from '@/lib/security';
import { handleIdempotency } from '@/lib/idempotency';
import type { 
  ApiErrorResponse, 
  ApiSuccessResponse, 
  CreateBookingRequest, 
  CreateBookingResponse 
} from '@/types/api';

export async function POST(request: NextRequest) {
  return handleIdempotency(request, async () => {
    try {
      // リクエストボディ解析
      const body: CreateBookingRequest = await request.json();
      
      console.log('📝 予約作成リクエスト:', createSafeLogObject(body));
    
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
    if (isEmailConfigured()) {
      try {
        const resource = await bookingService.getResource(booking.resourceId);
        if (resource) {
          const emailService = new EmailService();
          
          // UTC時刻をJST表示用に変換
          const startAtUtc = parseISO(booking.startAt);
          const endAtUtc = parseISO(booking.endAt);
          const startAtJST = utcToZonedTime(startAtUtc, TOKYO_TIMEZONE);
          const endAtJST = utcToZonedTime(endAtUtc, TOKYO_TIMEZONE);
          const dateTimeJST = `${format(startAtJST, 'yyyy年MM月dd日(E)')} ${format(startAtJST, 'HH:mm')}-${format(endAtJST, 'HH:mm')} (JST)`;
          
          const emailResult = await emailService.sendBookingEmails(
            booking.id,
            resource.name,
            booking.name,
            booking.email,
            dateTimeJST
          );
          
          console.log(`📧 メール送信結果 (予約ID: ${booking.id}):`, {
            userEmail: emailResult.userEmailSent ? '✅' : '❌',
            adminEmail: emailResult.adminEmailSent ? '✅' : '❌',
            // メールアドレスをログに記録しない
          });
        } else {
          console.warn(`⚠️ リソースが見つかりません`, createSafeLogObject({ bookingId: booking.id, resourceId: booking.resourceId }));
        }
      } catch (emailError) {
        console.error(`❌ メール送信エラー（予約は成立済み） (予約ID: ${booking.id}):`, 
          emailError instanceof Error ? emailError.message : 'Unknown error');
      }
    } else {
      console.warn('⚠️ メールサービスが設定されていません。RESEND_API_KEY または SENDGRID_API_KEY を設定してください。');
    }

    const successResponse: ApiSuccessResponse<CreateBookingResponse> = {
      data: booking,
    };

    console.log('✅ 予約作成完了:', createSafeLogObject({ bookingId: booking.id, resourceId: booking.resourceId }));
    return createSecureResponse(successResponse, 201);

    } catch (error) {
      console.error('❌ 予約作成エラー:', error instanceof Error ? error.message : 'Unknown error');

      // カスタムエラーハンドリング
      if (error instanceof BookingError) {
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

        return createErrorResponse(error.message, statusCode, error.code);
      }

      // 予期しないエラー
      return createErrorResponse(
        '予約の作成に失敗しました',
        500,
        API_ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });
}

// OPTIONSリクエストの処理（CORS preflight）
export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, 200, {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key',
  });
}