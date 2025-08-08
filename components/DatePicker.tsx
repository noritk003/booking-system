'use client';

import { useState } from 'react';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
}

export default function DatePicker({ selectedDate, onDateSelect, disabled = false }: DatePickerProps) {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // 今日から2週間先まで表示
  const generateDates = (weekOffset: number = 0) => {
    const today = startOfDay(new Date());
    const startDate = addDays(today, weekOffset * 7);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    
    return dates;
  };

  const dates = generateDates(currentWeek);
  const canGoNext = currentWeek < 2; // 最大2週間先まで
  const canGoPrev = currentWeek > 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">日付選択</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentWeek(prev => prev - 1)}
            disabled={!canGoPrev || disabled}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="前の週"
          >
            ←
          </button>
          <span className="text-sm text-gray-600 min-w-[120px] text-center">
            {format(dates[0], 'MM/dd', { locale: ja })} - {format(dates[6], 'MM/dd', { locale: ja })}
          </span>
          <button
            onClick={() => setCurrentWeek(prev => prev + 1)}
            disabled={!canGoNext || disabled}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="次の週"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, index) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const isPast = !isAfter(date, addDays(new Date(), -1));

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              disabled={disabled || isPast}
              className={`
                p-3 rounded-lg text-center transition-all
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? 'bg-primary-600 text-white'
                  : isPast
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-900 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }
                ${isToday && !isSelected ? 'ring-2 ring-primary-200' : ''}
              `}
            >
              <div className="text-xs text-current mb-1">
                {format(date, 'E', { locale: ja })}
              </div>
              <div className="text-lg font-semibold">
                {format(date, 'd')}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <div className="text-sm text-primary-800">
            <span className="font-medium">選択日:</span> {format(selectedDate, 'yyyy年MM月dd日(E)', { locale: ja })}
          </div>
        </div>
      )}
    </div>
  );
}