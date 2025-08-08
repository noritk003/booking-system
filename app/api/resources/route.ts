import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import type { Resource, ApiResponse } from '@/types';

export async function GET() {
  try {
    const resources = await db.getResources();

    return NextResponse.json(
      { success: true, data: resources } as ApiResponse<Resource[]>
    );

  } catch (error) {
    console.error('Resources API Error:', error);
    return NextResponse.json(
      { success: false, error: 'リソースの取得に失敗しました' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}