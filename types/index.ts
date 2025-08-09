export interface Resource {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  resource_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  start_at: string; // ISO string in UTC
  end_at: string; // ISO string in UTC
  status: 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  resource?: Resource;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface BookingFormData {
  resource_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  start_at: string;
  end_at: string;
  notes?: string;
}

export interface AvailabilityRequest {
  resource_id: string;
  date: string; // YYYY-MM-DD
}

export interface AvailabilityResponse {
  date: string;
  resource_id: string;
  slots: TimeSlot[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EmailConfig {
  provider: 'resend' | 'sendgrid';
  apiKey: string;
  fromEmail: string;
}

export interface BookingNotification {
  to: string;
  customerName: string;
  resourceName: string;
  startTime: string;
  endTime: string;
  bookingId: string;
}