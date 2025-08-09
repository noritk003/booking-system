import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import { createSecureResponse, createErrorResponse, createSafeLogObject } from '@/lib/security';
import type { Resource } from '@/types';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 リソース取得開始');
    
    const resources = await db.getResources();
    
    console.log(`✅ リソース取得成功: ${resources.length}件`);
    
    // データが空の場合はダミーデータを返す
    if (resources.length === 0) {
      const dummyResources: Resource[] = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'A店',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'B店',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'C店',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log('⚠️ データベースが空のため、ダミーデータを返します');
      
      return createSecureResponse({
        data: dummyResources
      });
    }

    return createSecureResponse({
      data: resources
    });

  } catch (error) {
    console.error('❌ リソース取得エラー:', error instanceof Error ? error.message : 'Unknown error');
    
    // エラー時はダミーデータで継続可能にする
    const fallbackResources: Resource[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'A店',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'B店',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('🔄 フォールバックデータを返します');
    
    return createSecureResponse({
      data: fallbackResources,
      warning: 'データベース接続エラーのため、デモデータを表示しています'
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return createSecureResponse({}, 200, {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
}