
export interface Review {
  id: number;
  dentistId: number;
  patientId: number;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  procedure?: string;
}
