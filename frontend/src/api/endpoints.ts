import { api } from './client';
import type {
  BookingOut,
  DashboardOut,
  InstructorCard,
  InstructorProfileOut,
  InstructorSuggestion,
  MessageOut,
  NotificationOut,
  PaymentOut,
  RefundOut,
  RefundPolicyOut,
  ReportOut,
  SlotOut,
  TokenResponse,
  UserOut,
} from './types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  meeting_address: string;
}

export interface InstructorRequestPayload {
  categories: string[];
  provides_vehicle: boolean;
  cnh_url: string;
  credential_url: string;
  crlv_url?: string | null;
  vehicle_photo_url?: string | null;
  teaching_method?: string | null;
  price: number;
  region: string;
}

export interface BookingCreatePayload {
  slot_id: string;
  vehicle_modality: string;
  payment_method: string;
  keep_registered_address: boolean;
  meeting_address?: string | null;
}

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (body: LoginPayload) =>
    api.post<TokenResponse>('/auth/login', body).then((r) => r.data),
  register: (body: RegisterPayload) =>
    api.post<TokenResponse>('/auth/register', body).then((r) => r.data),
};

// ── Users ────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get<UserOut>('/users/me').then((r) => r.data),
  updateMe: (body: Partial<UserOut> & { password?: string }) =>
    api.patch<UserOut>('/users/me', body).then((r) => r.data),
  notifications: () =>
    api.get<NotificationOut[]>('/users/me/notifications').then((r) => r.data),
};

// ── Instructors ──────────────────────────────────────────────
export const instructorsApi = {
  request: (body: InstructorRequestPayload) =>
    api.post<InstructorProfileOut>('/instructors/request', body).then((r) => r.data),
  me: () => api.get<InstructorProfileOut>('/instructors/me').then((r) => r.data),
  updateMe: (body: { teaching_method?: string; price?: number; region?: string }) =>
    api.patch<InstructorProfileOut>('/instructors/me', body).then((r) => r.data),
  search: (params: {
    category?: string;
    region?: string;
    needs_instructor_vehicle?: boolean;
    sort_by?: string;
  }) => api.get<InstructorCard[]>('/instructors/search', { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<InstructorCard>(`/instructors/${id}`).then((r) => r.data),
};

// ── Bookings ─────────────────────────────────────────────────
export const bookingsApi = {
  availability: (instructorId: string) =>
    api.get<SlotOut[]>(`/bookings/availability/${instructorId}`).then((r) => r.data),
  create: (body: BookingCreatePayload) =>
    api.post<BookingOut>('/bookings', body).then((r) => r.data),
  myStudent: () => api.get<BookingOut[]>('/bookings/me/student').then((r) => r.data),
  myInstructor: () => api.get<BookingOut[]>('/bookings/me/instructor').then((r) => r.data),
  accept: (id: string) =>
    api.post<BookingOut>(`/bookings/${id}/accept`).then((r) => r.data),
  reject: (id: string, reason: string) =>
    api.post<BookingOut>(`/bookings/${id}/reject`, { reason }).then((r) => r.data),
  refundPolicy: (id: string) =>
    api.get<RefundPolicyOut>(`/bookings/${id}/refund-policy`).then((r) => r.data),
};

// ── Reports & IA ─────────────────────────────────────────────
export const reportsApi = {
  create: (body: {
    booking_id: string;
    baliza: number;
    percurso: number;
    embreagem: number;
    observations?: string;
    strengths?: string;
    weaknesses?: string;
  }) => api.post<ReportOut>('/reports', body).then((r) => r.data),
  mine: () => api.get<ReportOut[]>('/reports/me').then((r) => r.data),
  dashboard: () => api.get<DashboardOut>('/reports/dashboard').then((r) => r.data),
  instructorDashboard: (studentId: string) =>
    api.get<DashboardOut>(`/reports/dashboard/${studentId}`).then((r) => r.data),
  suggestions: () =>
    api.get<InstructorSuggestion[]>('/reports/suggestions').then((r) => r.data),
};

// ── Chat ─────────────────────────────────────────────────────
export const chatApi = {
  messages: (bookingId: string) =>
    api.get<MessageOut[]>(`/chat/${bookingId}/messages`).then((r) => r.data),
  send: (bookingId: string, content: string, msg_type = 'text') =>
    api.post<MessageOut>(`/chat/${bookingId}/messages`, { content, msg_type }).then((r) => r.data),
  rate: (bookingId: string, stars: number) =>
    api.post(`/chat/${bookingId}/rate`, { stars }).then((r) => r.data),
};

// ── Payments ─────────────────────────────────────────────────
export const paymentsApi = {
  receipt: (bookingId: string) =>
    api.get<PaymentOut>(`/payments/${bookingId}/receipt`).then((r) => r.data),
  cancel: (bookingId: string) =>
    api.post<RefundOut>(`/payments/${bookingId}/cancel`).then((r) => r.data),
};
