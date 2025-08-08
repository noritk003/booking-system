'use client';

import { useState, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { TimeSlot, AvailabilityResponse, ApiResponse } from '@/types';
import { formatTimeSlot } from '@/utils/time';

interface BookingCalendarProps {
  resourceId: string;
  onTimeSlotSelect: (date: string, slot: TimeSlot) => void;
  selectedDate?: Date;
  selectedSlot?: TimeSlot;
}

export default function BookingCalendar({
  resourceId,
  onTimeSlotSelect,
  selectedDate,
  selectedSlot,
}: BookingCalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(selectedDate);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailability = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/availability?resource_id=${resourceId}&date=${date}`
      );
      const result: ApiResponse<AvailabilityResponse> = await response.json();
      
      if (result.success && result.data) {
        setAvailableSlots(result.data.slots);
      } else {
        console.error('空き状況の取得に失敗:', result.error);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('API呼び出しエラー:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    if (selected && resourceId) {
      fetchAvailability(format(selected, 'yyyy-MM-dd'));
    }
  }, [selected, resourceId, fetchAvailability]);

  const handleDaySelect = (date: Date | undefined) => {
    setSelected(date);
    if (!date) {
      setAvailableSlots([]);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!selected || !slot.available) return;
    
    const dateString = format(selected, 'yyyy-MM-dd');
    onTimeSlotSelect(dateString, slot);
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlot && 
           slot.start.getTime() === selectedSlot.start.getTime() &&
           slot.end.getTime() === selectedSlot.end.getTime();
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">日付を選択</h3>
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleDaySelect}
          locale={ja}
          disabled={{ before: new Date() }}
          className="mx-auto"
        />
      </div>

      {selected && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {format(selected, 'yyyy年MM月dd日 (E)', { locale: ja })} の空き時間
          </h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`
                    p-2 text-sm rounded border transition-colors
                    ${slot.available
                      ? isSlotSelected(slot)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }
                  `}
                >
                  {formatTimeSlot(slot)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              この日は利用できる時間がありません
            </p>
          )}
        </div>
      )}
    </div>
  );
}