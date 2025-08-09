'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import type { CreateBookingResponse, ApiResponse } from '@/types/api';

interface BookingWithResource extends CreateBookingResponse {
  resourceName: string;
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingWithResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'canceled'>('confirmed');
  
  const { toast, showToast, hideToast } = useToast();

  // 簡易認証チェック（本番ではより厳密に）
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('admin_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    try {
      // サーバーサイドでのパスワード認証
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        fetchBookings();
      } else {
        showToast('パスワードが間違っています', 'error');
      }
    } catch (error) {
      showToast('認証に失敗しました', 'error');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // 実際のAPIが未実装なので、ダミーデータを使用
      // const response = await fetch('/api/admin/bookings');
      // const result: ApiResponse<CreateBookingResponse[]> = await response.json();

      // ダミーデータ
      const dummyBookings: BookingWithResource[] = [
        {
          id: 'booking-001',
          resourceId: '11111111-1111-1111-1111-111111111111',
          resourceName: 'A店',
          email: 'user1@example.com',
          name: '田中太郎',
          startAt: '2024-12-01T01:00:00.000Z',
          endAt: '2024-12-01T01:15:00.000Z',
          startAtLocal: '2024-12-01T10:00:00+09:00',
          endAtLocal: '2024-12-01T10:15:00+09:00',
          status: 'confirmed',
          createdAt: '2024-11-20T12:00:00.000Z',
        },
        {
          id: 'booking-002',
          resourceId: '22222222-2222-2222-2222-222222222222',
          resourceName: 'B店',
          email: 'user2@example.com',
          name: '佐藤花子',
          startAt: '2024-12-01T02:00:00.000Z',
          endAt: '2024-12-01T02:15:00.000Z',
          startAtLocal: '2024-12-01T11:00:00+09:00',
          endAtLocal: '2024-12-01T11:15:00+09:00',
          status: 'canceled',
          createdAt: '2024-11-20T13:00:00.000Z',
        }
      ];

      // 少し遅延を追加してローディングを表示
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookings(dummyBookings);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('この予約をキャンセルしますか？\nこの操作は元に戻せません。')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<{ message: string }> = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // ローカル状態を更新
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'canceled' as const }
            : booking
        )
      );

      showToast('予約をキャンセルしました', 'success');

    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'キャンセルに失敗しました',
        'error'
      );
    }
  };

  const formatDateTime = (booking: BookingWithResource) => {
    const startLocal = new Date(booking.startAtLocal);
    const endLocal = new Date(booking.endAtLocal);
    
    const date = startLocal.toLocaleDateString('ja-JP');
    const time = `${startLocal.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })}-${endLocal.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    
    return { date, time };
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  // 認証画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                管理画面
              </h1>
              <p className="text-gray-600">
                パスワードを入力してください
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="form-label">
                  パスワード
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="form-input"
                  placeholder="パスワードを入力"
                />
                <p className="mt-1 text-xs text-gray-500">
                  ※デモ用: admin123
                </p>
              </div>
              
              <Button
                onClick={handleLogin}
                fullWidth
                disabled={!password.trim()}
              >
                ログイン
              </Button>
            </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">予約管理</h1>
            <p className="mt-2 text-gray-600">すべての予約を管理できます</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              onClick={fetchBookings}
              variant="secondary"
              disabled={loading}
            >
              🔄 更新
            </Button>
            <Button
              onClick={() => {
                sessionStorage.removeItem('admin_authenticated');
                setIsAuthenticated(false);
              }}
              variant="ghost"
            >
              ログアウト
            </Button>
          </div>
        </div>

        <div className="card p-6">
          {/* フィルター */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'すべて', count: bookings.length },
              { key: 'confirmed', label: '確定済み', count: bookings.filter(b => b.status === 'confirmed').length },
              { key: 'canceled', label: 'キャンセル済み', count: bookings.filter(b => b.status === 'canceled').length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${filter === key
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }
                `}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* コンテンツ */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
              <span className="ml-3 text-gray-600">読み込み中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">⚠️ エラーが発生しました</div>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <Button onClick={fetchBookings} variant="secondary">
                再試行
              </Button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>{filter === 'all' ? '予約がありません' : `${filter === 'confirmed' ? '確定された' : 'キャンセルされた'}予約がありません`}</p>
            </div>
          ) : (
            <>
              {/* テーブル（デスクトップ） */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        予約ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        顧客情報
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        店舗
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日時 (JST)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => {
                      const { date, time } = formatDateTime(booking);
                      
                      return (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {booking.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.name || booking.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.resourceName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{date}</div>
                            <div className="text-gray-500">{time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {booking.status === 'confirmed' ? '✓ 確定済み' : '✕ キャンセル済み'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {booking.status === 'confirmed' && (
                              <Button
                                onClick={() => handleCancelBooking(booking.id)}
                                variant="danger"
                                size="sm"
                              >
                                キャンセル
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* カード（モバイル） */}
              <div className="lg:hidden space-y-4">
                {filteredBookings.map((booking) => {
                  const { date, time } = formatDateTime(booking);
                  
                  return (
                    <div key={booking.id} className="card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.name || booking.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.email}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.status === 'confirmed' ? '✓ 確定' : '✕ キャンセル'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">店舗:</span> {booking.resourceName}
                        </div>
                        <div>
                          <span className="font-medium">日時:</span> {date} {time}
                        </div>
                        <div>
                          <span className="font-medium">ID:</span> 
                          <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                            {booking.id.substring(0, 8)}...
                          </code>
                        </div>
                      </div>
                      
                      {booking.status === 'confirmed' && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <Button
                            onClick={() => handleCancelBooking(booking.id)}
                            variant="danger"
                            size="sm"
                            fullWidth
                          >
                            キャンセル
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 統計 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 text-center">
                  合計 {filteredBookings.length} 件の予約
                  {filter !== 'all' && ` (${filter === 'confirmed' ? '確定済み' : 'キャンセル済み'})`}
                </div>
              </div>
            </>
          )}
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