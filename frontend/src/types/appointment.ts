
export interface Appointment {
  id: number;
  dentistId: number;
  patientId: number;
  patientName: string;
  dentistName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  reason: string;
  notes?: string;
}
