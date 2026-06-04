// Param lists das pilhas de navegação (React Navigation).

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type StudentStackParamList = {
  Tabs: undefined;
  InstructorDetail: { instructorId: string };
  Payment: { slotId: string; price: number; instructorName: string };
  Chat: { bookingId: string; title?: string };
  InstructorRequest: undefined;
};

export type InstructorStackParamList = {
  Tabs: undefined;
  Chat: { bookingId: string; title?: string };
  CreateReport: { bookingId: string; studentName?: string };
  StudentDashboard: { studentId: string; studentName?: string };
};
