'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './ui/Button';
import type { TimeSlot, CreateBookingRequest, ApiResponse, CreateBookingResponse } from '@/types/api';

interface BookingFormProps {
  resourceId: string;
  resourceName: string;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSuccess: (booking: CreateBookingResponse) => void;
  onError: (error: string) => void;
}

export default function BookingForm({
  resourceId,
  resourceName,
  selectedDate,
  selectedSlot,
  onSuccess,
  onError
}: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !selectedDate) {
      onError('日時を選択してください');
      return;
    }

    if (!formData.email.trim()) {
      onError('メールアドレスを入力してください');
      return;
    }

    setLoading(true);

    try {
      const requestData: CreateBookingRequest = {
        resourceId,
        startAtLocal: selectedSlot.startAtLocal,
        endAtLocal: selectedSlot.endAtLocal,
        email: formData.email.trim(),
        name: formData.name.trim() || undefined
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: ApiResponse<CreateBookingResponse> = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error('予約データが取得できませんでした');
      }

      onSuccess(result.data);
      
      // 成功後に完了ページへ遷移
      router.push(`/complete?id=${result.data.id}`);

    } catch (err) {
      onError(err instanceof Error ? err.message : '予約に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = () => {
    if (!selectedSlot) return '';
    
    const start = new Date(selectedSlot.startAtLocal);
    const end = new Date(selectedSlot.endAtLocal);
    
    return `${start.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    })} - ${end.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    })}`;
  };

  const canSubmit = selectedSlot && selectedDate && formData.email.trim();

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">予約情報入力</h2>
      
      {selectedSlot && selectedDate ? (
        <>
          <div className="mb-6 p-4 bg-primary-50 rounded-lg">
            <h3 className="font-medium text-primary-900 mb-2">予約内容確認</h3>
            <div className="space-y-1 text-sm text-primary-800">
              <div><span className="font-medium">店舗:</span> {resourceName}</div>
              <div>
                <span className="font-medium">日付:</span> {selectedDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
              <div>
                <span className="font-medium">時間:</span> {formatTimeSlot()} <span className="text-xs">(JST)</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="form-input"
                placeholder="your@example.com"
                aria-describedby="email-description"
              />
              <p id="email-description" className="mt-1 text-xs text-gray-600">
                予約確認メールをお送りします
              </p>
            </div>

            <div>
              <label htmlFor="name" className="form-label">
                お名前
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className="form-input"
                placeholder="例: 田中太郎"
                maxLength={100}
              />
              <p className="mt-1 text-xs text-gray-600">
                入力は任意です（メールアドレスで識別します）
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                loading={loading}
                disabled={!canSubmit}
                fullWidth
                size="lg"
              >
                {loading ? '予約中...' : '予約を確定する'}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              予約確定後、入力されたメールアドレスに確認メールをお送りします
            </div>
          </form>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">⏰</div>
          <p className="mb-2">日時を選択してください</p>
          <p className="text-sm">店舗・日付・時間をすべて選択すると、</p>
          <p className="text-sm">こちらで予約情報を入力できます</p>
        </div>
      )}
    </div>
  );
}