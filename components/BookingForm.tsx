'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TimeSlot, BookingFormData, ApiResponse, Booking } from '@/types';
import { toUTCString, formatTimeSlot } from '@/utils/time';
import { createSlotDateTime } from '@/utils/time';

interface BookingFormProps {
  resourceId: string;
  resourceName: string;
  selectedDate?: string;
  selectedSlot?: TimeSlot;
}

export default function BookingForm({
  resourceId,
  resourceName,
  selectedDate,
  selectedSlot,
}: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedSlot) {
      alert('日時を選択してください');
      return;
    }

    setLoading(true);

    try {
      const bookingData: BookingFormData = {
        resource_id: resourceId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || undefined,
        start_time: toUTCString(selectedSlot.start),
        end_time: toUTCString(selectedSlot.end),
        notes: formData.notes || undefined,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result: ApiResponse<Booking> = await response.json();

      if (result.success && result.data) {
        router.push(`/book-success?id=${result.data.id}`);
      } else {
        alert(result.error || '予約に失敗しました');
      }
    } catch (error) {
      console.error('予約エラー:', error);
      alert('予約に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!selectedDate || !selectedSlot) {
    return (
      <div className="card p-6">
        <p className="text-gray-600 text-center">
          まず日時を選択してください
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">予約情報入力</h3>
      
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <h4 className="font-medium text-primary-900 mb-2">予約内容</h4>
        <p className="text-sm text-primary-800">
          <strong>リソース:</strong> {resourceName}
        </p>
        <p className="text-sm text-primary-800">
          <strong>日時:</strong> {selectedDate} {formatTimeSlot(selectedSlot)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customer_name" className="form-label">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            required
            value={formData.customer_name}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="customer_email" className="form-label">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="customer_email"
            name="customer_email"
            required
            value={formData.customer_email}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="customer_phone" className="form-label">
            電話番号
          </label>
          <input
            type="tel"
            id="customer_phone"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="notes" className="form-label">
            備考
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleInputChange}
            className="form-input"
            placeholder="ご要望やご質問があればお聞かせください"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '予約中...' : '予約を確定する'}
          </button>
        </div>
      </form>
    </div>
  );
}