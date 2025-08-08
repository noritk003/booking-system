'use client';

import { useState, useEffect } from 'react';
import BookingCalendar from '@/components/BookingCalendar';
import BookingForm from '@/components/BookingForm';
import type { TimeSlot, Resource } from '@/types';

export default function HomePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
        if (data.length > 0) {
          setSelectedResourceId(data[0].id);
        }
      }
    } catch (error) {
      console.error('リソース取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotSelect = (date: string, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  const selectedResource = resources.find(r => r.id === selectedResourceId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          予約システム
        </h1>
        <p className="text-lg text-gray-600">
          ご希望の日時を選択して予約を行ってください
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600">現在、予約可能なリソースがありません。</p>
        </div>
      ) : (
        <>
          <div className="card p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              リソース選択
            </h2>
            <select
              value={selectedResourceId}
              onChange={(e) => {
                setSelectedResourceId(e.target.value);
                setSelectedDate('');
                setSelectedSlot(undefined);
              }}
              className="form-input max-w-md"
            >
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                  {resource.description && ` - ${resource.description}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <BookingCalendar
                resourceId={selectedResourceId}
                onTimeSlotSelect={handleTimeSlotSelect}
                selectedSlot={selectedSlot}
              />
            </div>
            
            <div>
              <BookingForm
                resourceId={selectedResourceId}
                resourceName={selectedResource?.name || ''}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}