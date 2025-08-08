import { format, parseISO, addMinutes, startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import type { TimeSlot, Booking } from '@/types';

const TOKYO_TZ = 'Asia/Tokyo';
const SLOT_DURATION = 15; // minutes
const BUSINESS_START = 9; // 9:00 AM
const BUSINESS_END = 18; // 6:00 PM

export function toJSTString(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const jstDate = utcToZonedTime(date, TOKYO_TZ);
  return format(jstDate, 'yyyy-MM-dd HH:mm');
}

export function toUTCString(jstDate: Date): string {
  const utcDate = zonedTimeToUtc(jstDate, TOKYO_TZ);
  return utcDate.toISOString();
}

export function generateTimeSlots(date: string, existingBookings: Booking[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const targetDate = parseISO(date + 'T00:00:00');
  
  const businessStart = new Date(targetDate);
  businessStart.setHours(BUSINESS_START, 0, 0, 0);
  
  const businessEnd = new Date(targetDate);
  businessEnd.setHours(BUSINESS_END, 0, 0, 0);

  let currentTime = businessStart;
  
  while (currentTime < businessEnd) {
    const slotEnd = addMinutes(currentTime, SLOT_DURATION);
    
    const isBooked = existingBookings.some(booking => {
      const bookingStart = parseISO(booking.start_time);
      const bookingEnd = parseISO(booking.end_time);
      
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });
    
    slots.push({
      start: new Date(currentTime),
      end: new Date(slotEnd),
      available: !isBooked
    });
    
    currentTime = slotEnd;
  }
  
  return slots;
}

export function formatTimeSlot(slot: TimeSlot): string {
  const jstStart = utcToZonedTime(slot.start, TOKYO_TZ);
  const jstEnd = utcToZonedTime(slot.end, TOKYO_TZ);
  
  return `${format(jstStart, 'HH:mm')} - ${format(jstEnd, 'HH:mm')}`;
}

export function isValidTimeSlot(startTime: string, endTime: string): boolean {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  
  return duration === SLOT_DURATION;
}

export function createSlotDateTime(date: string, hour: number, minute: number): Date {
  const baseDate = parseISO(date + 'T00:00:00');
  const jstDateTime = new Date(baseDate);
  jstDateTime.setHours(hour, minute, 0, 0);
  
  return zonedTimeToUtc(jstDateTime, TOKYO_TZ);
}