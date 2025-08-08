'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import type { CreateBookingResponse, ApiResponse } from '@/types/api';

export default function CompletePage() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<CreateBookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const bookingId = searchParams.get('id');

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    } else {
      setError('予約IDが指定されていません');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBooking = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${id}`);
      const result: ApiResponse<CreateBookingResponse> = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error('予約データが取得できませんでした');
      }

      setBooking(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (booking: CreateBookingResponse) => {
    const startLocal = new Date(booking.startAtLocal);
    const endLocal = new Date(booking.endAtLocal);
    
    const date = startLocal.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    const time = `${startLocal.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })} - ${endLocal.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    
    return { date, time };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">予約情報を取得中...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              予約情報が見つかりません
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'URLが正しくないか、予約が存在しない可能性があります。'}
            </p>
            <Link href="/">
              <Button variant="primary" fullWidth>
                トップページへ戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(booking);
  
  // リソース名のマッピング（簡易的）
  const resourceNames: Record<string, string> = {
    '11111111-1111-1111-1111-111111111111': 'A店',
    '22222222-2222-2222-2222-222222222222': 'B店',
    '33333333-3333-3333-3333-333333333333': 'C店'
  };
  
  const resourceName = resourceNames[booking.resourceId] || '不明な店舗';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 成功メッセージ */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl text-green-600">✓</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            予約が完了しました！
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            確認メールをお送りしました
          </p>
          <p className="text-gray-500">
            当日はお時間に遅れないようお越しください
          </p>
        </div>

        {/* 予約詳細 */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            予約詳細
          </h2>
          
          <div className="space-y-6">
            {/* 予約ID */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">予約ID</div>
              <div className="font-mono text-sm text-gray-900 break-all">
                {booking.id}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ※この番号は変更・キャンセル時に必要です
              </div>
            </div>

            {/* 基本情報 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">店舗</div>
                <div className="text-lg font-semibold text-gray-900">
                  {resourceName}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">ステータス</div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ 確定済み
                </span>
              </div>
            </div>

            {/* 日時 */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">予約日時</div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-primary-900 mb-1">
                  {date}
                </div>
                <div className="text-primary-800">
                  {time} <span className="text-sm">(JST / UTC+9)</span>
                </div>
              </div>
            </div>

            {/* 顧客情報 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">メールアドレス</div>
                <div className="text-gray-900">{booking.email}</div>
              </div>
              
              {booking.name && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">お名前</div>
                  <div className="text-gray-900">{booking.name}</div>
                </div>
              )}
            </div>

            {/* 予約日時 */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">予約完了時刻</div>
              <div className="text-sm text-gray-600">
                {new Date(booking.createdAt).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'numeric', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button variant="secondary" fullWidth>
              新しい予約を作成
            </Button>
          </Link>
          <Link href="/admin" className="flex-1">
            <Button variant="primary" fullWidth>
              予約管理画面へ
            </Button>
          </Link>
        </div>

        {/* 注意事項 */}
        <div className="card p-6 bg-amber-50 border-amber-200">
          <h3 className="text-sm font-medium text-amber-900 mb-2">
            📋 ご注意・お願い
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• 予約の変更・キャンセルは管理画面から行えます</li>
            <li>• 当日の大幅な遅刻の場合、予約をキャンセルさせていただく場合があります</li>
            <li>• ご質問がある場合は確認メールに記載の連絡先までお問い合わせください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}