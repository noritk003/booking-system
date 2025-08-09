'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Booking } from '@/types';
import { toJSTString } from '@/utils/time';

export default function BookSuccessPage() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const bookingId = searchParams.get('id');

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      if (response.ok) {
        const result = await response.json();
        setBooking(result.data);
      }
    } catch (error) {
      console.error('予約情報取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          予約情報が見つかりません
        </h1>
        <p className="text-gray-600 mb-6">
          URLが正しくないか、予約が存在しない可能性があります。
        </p>
        <Link href="/" className="btn-primary">
          トップページへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          予約が完了しました！
        </h1>
        <p className="text-gray-600">
          確認メールをお送りしました。当日お待ちしております。
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">予約詳細</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">予約ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              {booking.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">リソース</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {booking.resource?.name}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">お名前</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {booking.customer_name}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {booking.customer_email}
            </dd>
          </div>
          {booking.customer_phone && (
            <div>
              <dt className="text-sm font-medium text-gray-500">電話番号</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {booking.customer_phone}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">予約日時</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {toJSTString(booking.start_at)} ～ {toJSTString(booking.end_at).split(' ')[1]}
            </dd>
          </div>
          {booking.notes && (
            <div>
              <dt className="text-sm font-medium text-gray-500">備考</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {booking.notes}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">ステータス</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                確定
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          予約の変更やキャンセルをご希望の場合は、管理画面からお手続きください。
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/" className="btn-secondary">
            新しい予約を作成
          </Link>
          <Link href="/admin" className="btn-primary">
            管理画面
          </Link>
        </div>
      </div>
    </div>
  );
}