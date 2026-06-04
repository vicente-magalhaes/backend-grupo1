// Tipos espelhando os schemas Pydantic do backend.

export type Role = 'student' | 'instructor' | 'admin';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  role: Role;
}

export interface UserOut {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  meeting_address?: string | null;
  created_at?: string | null;
}

export interface NotificationOut {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at?: string | null;
}

export interface InstructorProfileOut {
  id: string;
  user_id: string;
  full_name?: string | null;
  status: string;
  provides_vehicle: boolean;
  categories: string[];
  teaching_method?: string | null;
  price: number;
  region: string;
}

export interface InstructorCard {
  instructor_id: string;
  full_name: string;
  region: string;
  price: number;
  provides_vehicle: boolean;
  categories: string[];
  avg_rating?: number | null;
  total_lessons: number;
  photo_url?: string | null;
}

export interface SlotOut {
  id: string;
  instructor_id: string;
  start_at: string;
  end_at: string;
  status: string;
}

export interface BookingOut {
  id: string;
  student_id: string;
  slot_id: string;
  instructor_id?: string | null;
  vehicle_modality: string;
  status: string;
  price: number;
  meeting_address?: string | null;
  start_at?: string | null;
  created_at?: string | null;
  confirmed_at?: string | null;
}

export interface RefundWindow {
  label: string;
  percentage: number;
  until?: string | null;
}

export interface RefundPolicyOut {
  lesson_start: string;
  windows: RefundWindow[];
}

export interface ReportOut {
  id: string;
  booking_id: string;
  baliza: number;
  percurso: number;
  embreagem: number;
  observations?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  created_at?: string | null;
}

export interface DashboardOut {
  media_baliza?: number | null;
  media_percurso?: number | null;
  media_embreagem?: number | null;
  aulas_realizadas: number;
  aulas_minimas: number;
  aulas_faltantes: number;
  probabilidade_aprovacao?: number | null;
  ponto_mais_critico?: string | null;
}

export interface InstructorSuggestion {
  instructor_id: string;
  full_name: string;
  avg_rating?: number | null;
  motivo: string;
}

export interface MessageOut {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  msg_type: string;
  created_at?: string | null;
}

export interface PaymentOut {
  id: string;
  booking_id: string;
  amount: number;
  method: string;
  status: string;
  created_at?: string | null;
}

export interface RefundOut {
  booking_id: string;
  amount_paid: number;
  refund_percentage: number;
  refund_amount: number;
  status: string;
}
