/**
 * セキュリティ関連のユーティリティ
 */

// PII（個人識別情報）を含む可能性のあるフィールドのマスク処理
export function maskPII(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = { ...data };
  const piiFields = ['email', 'user_email', 'name', 'phone'];

  for (const field of piiFields) {
    if (masked[field]) {
      if (typeof masked[field] === 'string') {
        // メールアドレスの場合は最初の3文字のみ表示
        if (field.includes('email') && masked[field].includes('@')) {
          const [local, domain] = masked[field].split('@');
          masked[field] = `${local.slice(0, 3)}***@${domain}`;
        } else {
          // その他の場合は最初の2文字のみ表示
          masked[field] = `${masked[field].slice(0, 2)}***`;
        }
      }
    }
  }

  return masked;
}

// ログ用の安全なオブジェクト作成
export function createSafeLogObject(data: any, additionalPiiFields: string[] = []): any {
  const allPiiFields = ['email', 'user_email', 'name', 'phone', ...additionalPiiFields];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const safe = { ...data };
  
  for (const field of allPiiFields) {
    if (safe[field]) {
      safe[field] = '[MASKED]';
    }
  }

  return safe;
}

// セキュリティヘッダーを設定
export function setSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // XSS対策
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // HTTPS強制（本番環境）
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // コンテンツタイプ
  headers.set('Content-Type', 'application/json; charset=utf-8');
  
  // CORS設定（本番では適切なoriginを設定）
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://bookingtest2-6u0fbxqxy-nrtk0320-gmailcoms-projects.vercel.app']
    : ['http://localhost:3000'];
    
  const origin = headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Idempotency-Key');
  headers.set('Access-Control-Max-Age', '86400'); // 24時間
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// レスポンス作成ヘルパー（セキュリティヘッダー付き）
export function createSecureResponse(
  data: any, 
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  });
  
  return setSecurityHeaders(response);
}

// エラーレスポンス作成（情報漏洩防止）
export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: any
): Response {
  const errorData = {
    error: {
      code: code || `ERROR_${status}`,
      message,
      // 本番環境では詳細なエラー情報を含めない
      ...(process.env.NODE_ENV === 'development' && details && { details })
    }
  };

  return createSecureResponse(errorData, status);
}