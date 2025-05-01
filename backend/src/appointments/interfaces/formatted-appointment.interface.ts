import { Appointment } from '../schemas/appointment.schema';

export interface FormattedAppointment extends Record<string, any> {
  patientName?: string;
  date: string | Date;
  patient?: any;
  dentist?: any;
  startTime?: string;
  endTime?: string;
  service?: string;
  status?: string;
  notes?: string;
}

// Helper type to make TypeScript correctly handle toObject() result
export interface FormattedAppointmentDocument extends Appointment {
  toObject(): FormattedAppointment;
}