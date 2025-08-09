'use client';

import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import ResourceSelector from '@/components/ResourceSelector';
import DatePicker from '@/components/DatePicker';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import BookingForm from '@/components/BookingFormNew';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import type { TimeSlot, CreateBookingResponse } from '@/types/api';

export default function HomePage() {
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [resourceName, setResourceName] = useState<string>('');
  
  const { toast, showToast, hideToast } = useToast();

  const handleResourceSelect = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setSelectedDate(null);
    setSelectedSlot(null);
    
    // リソース名を取得（簡易的に）
    const resourceNames: Record<string, string> = {
      '11111111-1111-1111-1111-111111111111': 'A店',
      '22222222-2222-2222-2222-222222222222': 'B店', 
      '33333333-3333-3333-3333-333333333333': 'C店'
    };
    setResourceName(resourceNames[resourceId] || 'Unknown');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // 日付変更時はスロットリセット
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookingSuccess = (booking: CreateBookingResponse) => {
    showToast('予約が完了しました！確認メールをお送りしています', 'success');
    // フォームリセット
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleBookingError = (error: string) => {
    showToast(error, 'error');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <HeroSection />

      {/* 予約セクション */}
      <div id="booking-section" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              簡単3ステップで予約完了
            </h2>
            <p className="text-gray-600">
              店舗・日時を選択してご予約ください（営業時間: 9:00-18:00 JST）
            </p>
          </div>

          {/* ステップインジケーター */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${selectedResourceId ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">店舗選択</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded">
                <div className={`
                  h-full bg-primary-600 rounded transition-all duration-300
                  ${selectedResourceId ? 'w-full' : 'w-0'}
                `}></div>
              </div>
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${selectedDate && selectedSlot ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">日時選択</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded">
                <div className={`
                  h-full bg-primary-600 rounded transition-all duration-300
                  ${selectedDate && selectedSlot ? 'w-full' : 'w-0'}
                `}></div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="ml-2 text-sm font-medium">予約確定</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step 1: リソース選択 */}
        <ResourceSelector
          selectedResourceId={selectedResourceId}
          onResourceSelect={handleResourceSelect}
        />

        {/* Step 2: 日時選択 */}
        {selectedResourceId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
            
            <TimeSlotSelector
              resourceId={selectedResourceId}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
            />
          </div>
        )}

        {/* Step 3: 予約フォーム */}
        {selectedResourceId && (
          <BookingForm
            resourceId={selectedResourceId}
            resourceName={resourceName}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSuccess={handleBookingSuccess}
            onError={handleBookingError}
          />
        )}
      </div>

      {/* トースト通知 */}
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}