// API関連の型定義
export interface TimeSlot {
  startAt: string; // ISO string (UTC)
  endAt: string;   // ISO string (UTC) 
  startAtLocal: string; // ISO string (Asia/Tokyo)
  endAtLocal: string;   // ISO string (Asia/Tokyo)
  available: boolean;
}

export interface AvailabilityResponse {
  date: string; // YYYY-MM-DD (Asia/Tokyo)
  resourceId: string;
  timeZone: string; // "Asia/Tokyo"
  slots: TimeSlot[];
}

export interface CreateBookingRequest {
  resourceId: string;
  startAtLocal: string; // ISO string (Asia/Tokyo想定)
  endAtLocal: string;   // ISO string (Asia/Tokyo想定)  
  email: string;
  name?: string;
}

export interface CreateBookingResponse {
  id: string;
  resourceId: string;
  email: string;
  name?: string;
  startAt: string;     // ISO string (UTC)
  endAt: string;       // ISO string (UTC)
  startAtLocal: string; // ISO string (Asia/Tokyo)
  endAtLocal: string;   // ISO string (Asia/Tokyo)
  status: 'confirmed' | 'canceled';
  createdAt: string;   // ISO string (UTC)
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// エラーコード定数
export const API_ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND', 
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  TIME_SLOT_CONFLICT: 'TIME_SLOT_CONFLICT',
  INVALID_TIME_SLOT: 'INVALID_TIME_SLOT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;