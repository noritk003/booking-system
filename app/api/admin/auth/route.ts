import { NextRequest } from 'next/server';
import { adminAuthSchema } from '@/lib/validations';
import { createSecureResponse, createErrorResponse } from '@/lib/security';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validationResult = adminAuthSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.issues[0].message,
        400,
        'VALIDATION_ERROR'
      );
    }

    const { password } = validationResult.data;

    // パスワード検証
    if (password === ADMIN_PASSWORD) {
      return createSecureResponse({ authenticated: true }, 200);
    } else {
      // 認証失敗のログ（PIIを含めない）
      console.warn('🚨 管理者認証失敗', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent')?.slice(0, 100),
        timestamp: new Date().toISOString(),
      });
      
      return createErrorResponse(
        'パスワードが間違っています',
        401,
        'AUTHENTICATION_FAILED'
      );
    }
  } catch (error) {
    console.error('❌ 管理者認証エラー:', error instanceof Error ? error.message : 'Unknown error');
    
    return createErrorResponse(
      '認証処理に失敗しました',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, 200, {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
}