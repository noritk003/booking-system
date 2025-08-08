'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import LoadingSpinner from './ui/LoadingSpinner';
import type { TimeSlot, AvailabilityResponse, ApiResponse } from '@/types/api';

interface TimeSlotSelectorProps {
  resourceId: string;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  disabled?: boolean;
}

export default function TimeSlotSelector({
  resourceId,
  selectedDate,
  selectedSlot,
  onSlotSelect,
  disabled = false
}: TimeSlotSelectorProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId || !selectedDate) {
      setSlots([]);
      return;
    }

    async function fetchAvailability() {
      try {
        setLoading(true);
        setError(null);
        
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/availability?resourceId=${resourceId}&date=${dateStr}`);
        const result: ApiResponse<AvailabilityResponse> = await response.json();

        if (result.error) {
          throw new Error(result.error.message || '空き状況の取得に失敗しました');
        }

        setSlots(result.data?.slots || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [resourceId, selectedDate]);

  const formatTimeSlot = (slot: TimeSlot): string => {
    const startLocal = parseISO(slot.startAtLocal);
    const endLocal = parseISO(slot.endAtLocal);
    
    return `${format(startLocal, 'HH:mm')} - ${format(endLocal, 'HH:mm')}`;
  };

  if (!selectedDate) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">時間選択</h2>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📅</div>
          <p>まず日付を選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        時間選択 <span className="text-sm text-gray-600 font-normal">(JST / UTC+9)</span>
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-gray-600">空き状況を確認中...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">⚠️ エラーが発生しました</div>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">😔</div>
          <p>この日は空きがありません</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot, index) => {
              const isSelected = selectedSlot && 
                slot.startAt === selectedSlot.startAt && 
                slot.endAt === selectedSlot.endAt;

              return (
                <button
                  key={index}
                  onClick={() => slot.available && onSlotSelect(slot)}
                  disabled={disabled || !slot.available}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${slot.available
                      ? isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }
                  `}
                >
                  <div>{formatTimeSlot(slot)}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {slot.available ? '空き' : '予約済み'}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded mr-2"></div>
              <span>予約可能</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-600 rounded mr-2"></div>
              <span>選択中</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
              <span>予約済み</span>
            </div>
          </div>

          {selectedSlot && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <div className="text-sm text-primary-800">
                <span className="font-medium">選択時間:</span> {formatTimeSlot(selectedSlot)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}