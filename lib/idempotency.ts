/**
 * Idempotency（冪等性）サポート
 * 同じリクエストが複数回実行されても結果が変わらないことを保証
 */

interface IdempotencyRecord {
  key: string;
  response: any;
  status: number;
  createdAt: Date;
}

// メモリベースの簡易実装（本番では Redis や DB を使用）
const idempotencyStore = new Map<string, IdempotencyRecord>();

// キーの有効期限（24時間）
const EXPIRY_HOURS = 24;

// 期限切れのキーをクリーンアップ
function cleanupExpiredKeys(): void {
  const now = new Date();
  const expiredKeys: string[] = [];
  
  for (const [key, record] of idempotencyStore.entries()) {
    const hoursDiff = (now.getTime() - record.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > EXPIRY_HOURS) {
      expiredKeys.push(key);
    }
  }
  
  expiredKeys.forEach(key => idempotencyStore.delete(key));
}

// idempotency keyを取得
export function getIdempotencyKey(request: Request): string | null {
  return request.headers.get('X-Idempotency-Key');
}

// idempotency keyが既に存在するかチェック
export function checkIdempotencyKey(key: string): IdempotencyRecord | null {
  cleanupExpiredKeys();
  return idempotencyStore.get(key) || null;
}

// idempotency keyと応答を保存
export function storeIdempotencyResponse(
  key: string,
  response: any,
  status: number
): void {
  idempotencyStore.set(key, {
    key,
    response,
    status,
    createdAt: new Date()
  });
}

// idempotency keyのバリデーション
export function validateIdempotencyKey(key: string): boolean {
  // UUID v4 形式または 32文字以上のランダム文字列
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const randomStringRegex = /^[a-zA-Z0-9-_]{32,}$/;
  
  return uuidV4Regex.test(key) || randomStringRegex.test(key);
}

// リクエストのハッシュを生成（キーがない場合の代替）
export function generateRequestHash(
  method: string,
  url: string,
  body: any,
  userIdentifier?: string
): string {
  const content = JSON.stringify({
    method: method.toUpperCase(),
    url: url.split('?')[0], // クエリパラメータを除外
    body,
    user: userIdentifier
  });
  
  // 簡易ハッシュ（本番では crypto.subtle.digest を使用推奨）
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  
  return `auto-${Math.abs(hash).toString(36)}`;
}

// idempotencyミドルウェア関数
export async function handleIdempotency(
  request: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  // POSTリクエストのみ対象
  if (request.method !== 'POST') {
    return handler();
  }
  
  const providedKey = getIdempotencyKey(request);
  let idempotencyKey: string;
  
  if (providedKey) {
    // 提供されたキーをバリデーション
    if (!validateIdempotencyKey(providedKey)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_IDEMPOTENCY_KEY',
            message: 'Idempotency keyの形式が無効です'
          }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    idempotencyKey = providedKey;
  } else {
    // キーが提供されていない場合は自動生成
    const body = await request.clone().text();
    idempotencyKey = generateRequestHash(
      request.method,
      request.url,
      body
    );
  }
  
  // 既存のレスポンスをチェック
  const existingRecord = checkIdempotencyKey(idempotencyKey);
  if (existingRecord) {
    return new Response(
      JSON.stringify(existingRecord.response),
      {
        status: existingRecord.status,
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Replay': 'true'
        }
      }
    );
  }
  
  // 新しいリクエストを処理
  const response = await handler();
  
  // 成功した場合のみidempotency記録を保存
  if (response.status >= 200 && response.status < 300) {
    const responseBody = await response.clone().text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = responseBody;
    }
    
    storeIdempotencyResponse(idempotencyKey, parsedBody, response.status);
  }
  
  return response;
}