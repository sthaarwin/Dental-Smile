
import { Appointment } from "@/types/appointment";

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    dentistId: 1,
    patientId: 101,
    patientName: "Amanda Thompson",
    dentistName: "Dr. Sarah Johnson",
    date: "2023-12-15",
    time: "09:00 AM",
    status: "confirmed",
    reason: "Regular check-up and cleaning"
  },
  {
    id: 2,
    dentistId: 1,
    patientId: 102,
    patientName: "David Wilson",
    dentistName: "Dr. Sarah Johnson",
    date: "2023-12-16",
    time: "11:30 AM",
    status: "confirmed",
    reason: "Tooth pain, possible cavity"
  },
  {
    id: 3,
    dentistId: 2,
    patientId: 103,
    patientName: "Jessica Brown",
    dentistName: "Dr. Michael Chen",
    date: "2023-12-18",
    time: "10:00 AM",
    status: "pending",
    reason: "Invisalign consultation"
  },
  {
    id: 4,
    dentistId: 3,
    patientId: 104,
    patientName: "Michael Davis",
    dentistName: "Dr. James Wilson",
    date: "2023-12-15",
    time: "02:00 PM",
    status: "confirmed",
    reason: "Child's first dental visit"
  },
  {
    id: 5,
    dentistId: 4,
    patientId: 105,
    patientName: "Sarah Miller",
    dentistName: "Dr. Emily Garcia",
    date: "2023-12-17",
    time: "12:00 PM",
    status: "confirmed",
    reason: "Teeth whitening consultation"
  },
  {
    id: 6,
    dentistId: 5,
    patientId: 106,
    patientName: "Robert Johnson",
    dentistName: "Dr. Robert Taylor",
    date: "2023-12-20",
    time: "09:30 AM",
    status: "pending",
    reason: "Root canal evaluation"
  },
  {
    id: 7,
    dentistId: 6,
    patientId: 107,
    patientName: "Jennifer Lopez",
    dentistName: "Dr. Olivia Martinez",
    date: "2023-12-14",
    time: "03:30 PM",
    status: "completed",
    reason: "Gum treatment follow-up",
    notes: "Patient recovering well, schedule next check in 3 months"
  }
];
