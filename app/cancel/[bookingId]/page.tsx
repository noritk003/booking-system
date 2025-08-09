'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import type { CreateBookingResponse, ApiResponse } from '@/types/api';

interface BookingWithResource extends CreateBookingResponse {
  resourceName: string;
}

export default function CancelBookingPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  
  const [booking, setBooking] = useState<BookingWithResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (!bookingId) return;
    
    // 実際の実装では予約詳細を取得するAPIを呼び出し
    // 現在はダミーデータで実装
    const fetchBookingDetails = async () => {
      try {
        // TODO: 実際のAPI呼び出し
        // const response = await fetch(`/api/bookings/${bookingId}`);
        // const result: ApiResponse<BookingWithResource> = await response.json();
        
        // ダミーデータ
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dummyBooking: BookingWithResource = {
          id: bookingId,
          resourceId: '11111111-1111-1111-1111-111111111111',
          resourceName: 'A店',
          email: 'user@example.com',
          name: 'サンプル太郎',
          startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
          startAtLocal: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endAtLocal: new Date(Date.now() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
        
        if (dummyBooking.status === 'canceled') {
          setCanceled(true);
        }
        
        setBooking(dummyBooking);
      } catch (err) {
        setError('予約情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!booking || !confirm('この予約をキャンセルしますか？\\nこの操作は元に戻せません。')) {
      return;
    }

    try {
      setCanceling(true);
      
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<{ message: string }> = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setCanceled(true);
      showToast('予約をキャンセルしました', 'success');
      
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'キャンセルに失敗しました',
        'error'
      );
    } finally {
      setCanceling(false);
    }
  };

  const formatDateTime = (booking: BookingWithResource) => {
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
    })}-${endLocal.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    
    return { date, time };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">予約情報を確認中...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              予約が見つかりません
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'お探しの予約は存在しないか、既にキャンセル済みの可能性があります。'}
            </p>
            <Link href="/">
              <Button>新しい予約を作成</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (canceled || booking.status === 'canceled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              キャンセル完了
            </h1>
            <p className="text-gray-600 mb-6">
              予約のキャンセルが完了しました。<br />
              ご利用ありがとうございました。
            </p>
            <div className="space-y-3">
              <Link href="/">
                <Button fullWidth>新しい予約を作成</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(booking);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            予約キャンセル
          </h1>
          <p className="text-gray-600">
            以下の予約をキャンセルしますか？
          </p>
        </div>

        <div className="card p-6 mb-6">
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-yellow-400 text-xl">⚠️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  キャンセルに関する注意事項
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    • この操作は元に戻せません<br />
                    • キャンセル後の再予約には改めてお申し込みが必要です<br />
                    • ご不明な点がある場合は事前にお問い合わせください
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">予約詳細</h2>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium text-gray-500">予約ID</div>
                <div className="col-span-2 font-mono text-xs bg-white px-2 py-1 rounded">
                  {booking.id}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium text-gray-500">お名前</div>
                <div className="col-span-2">
                  {booking.name || booking.email}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium text-gray-500">メールアドレス</div>
                <div className="col-span-2">
                  {booking.email}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium text-gray-500">店舗</div>
                <div className="col-span-2">
                  {booking.resourceName}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium text-gray-500">日時</div>
                <div className="col-span-2">
                  <div>{date}</div>
                  <div className="text-primary-600 font-medium">{time} (JST)</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium text-gray-500">状態</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ 確定済み
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleCancel}
            variant="danger"
            disabled={canceling}
            className="flex-1"
          >
            {canceling ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">キャンセル中...</span>
              </>
            ) : (
              'この予約をキャンセル'
            )}
          </Button>
          
          <Link href="/" className="flex-1">
            <Button variant="secondary" fullWidth>
              戻る
            </Button>
          </Link>
        </div>
      </div>
      
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}