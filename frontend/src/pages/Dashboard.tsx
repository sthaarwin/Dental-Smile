import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  User,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { appointmentAPI } from '@/services/api';

interface Appointment {
  id: string | number;
  _id?: string;
  date: string;
  time: string;
  startTime?: string;
  dentistName?: string;
  dentist?: {
    name?: string;
    _id?: string;
    id?: string;
  };
  patientName?: string;
  patient?: {
    name?: string;
    _id?: string;
    id?: string;
  };
  service: string;
  status: string;
  notes?: string;
}

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

// Function to process received appointments
const processAppointments = (appointmentsData: any[]): Appointment[] => {
  if (!Array.isArray(appointmentsData)) return [];
  
  return appointmentsData.map(appointment => ({
    id: appointment._id || appointment.id,
    _id: appointment._id || appointment.id,
    date: formatDateIfNeeded(appointment.date),
    time: appointment.startTime || appointment.time || "Not specified",
    startTime: appointment.startTime,
    dentistName: getDentistName(appointment),
    dentist: appointment.dentist,
    service: appointment.service || "General Appointment",
    status: appointment.status || "scheduled",
    notes: appointment.notes || ""
  }));
};

// Helper function to get dentist name from appointment
const getDentistName = (appointment): string => {
  if (appointment.dentistName) {
    return appointment.dentistName;
  }
  
  const dentist = appointment.dentist || {};
  if (dentist.name) {
    return dentist.name;
  }
  
  return "Unknown Dentist";
};

// Helper function to format dates consistently
const formatDateIfNeeded = (dateString): string => {
  if (!dateString) {
    return new Date().toISOString().split('T')[0]; // Today's date as fallback
  }
  
  // Check if date is already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString;
  }
  
  try {
    // Try to parse the date and format it
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Return original if parsing fails
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<Date>();
  const [newTime, setNewTime] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
       
      if (parsedUser.role === 'dentist') {
        navigate("/dentist-dashboard");
        return;
      } else if (parsedUser.role === 'admin') {
        navigate("/admin");
        return;
      } else if (parsedUser.role !== 'patient') {
        toast.error("Invalid user role");
        navigate("/login");
        return;
      }
    }

    const fetchData = async () => {
      try { 
        const appointmentsResponse = await appointmentAPI.myAppointments();
        const processedAppointments = processAppointments(appointmentsResponse.data);
        setAppointments(processedAppointments);
        console.log("Processed appointments:", processedAppointments);
      } catch (error) {
        console.error("Error loading appointments:", error);
        toast.error('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleDialogOpen(true);
  };

  const confirmReschedule = async () => {
    if (!newDate || !newTime || !selectedAppointment) {
      toast.error("Please select both date and time");
      return;
    }

    try {
      await appointmentAPI.rescheduleAppointment(selectedAppointment.id, {
        date: newDate.toISOString().split('T')[0],
        time: newTime
      });
 
      const updatedAppointments = await appointmentAPI.myAppointments();
      const processedAppointments = processAppointments(updatedAppointments.data);
      setAppointments(processedAppointments);
      
      toast.success("Appointment rescheduled successfully");
      setIsRescheduleDialogOpen(false);
      setSelectedAppointment(null);
      setNewDate(undefined);
      setNewTime(undefined);
    } catch (error) {
      toast.error('Failed to reschedule appointment');
    }
  };

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentAPI.cancelAppointment(selectedAppointment.id);
       
      const updatedAppointments = await appointmentAPI.myAppointments();
      const processedAppointments = processAppointments(updatedAppointments.data);
      setAppointments(processedAppointments);
      
      toast.success("Appointment cancelled successfully");
      setIsCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  // Improved filtering for upcoming and past appointments
  const upcomingAppointments = appointments.filter(apt => {
    // Consider scheduled appointments as upcoming
    if (apt.status === "scheduled" || apt.status === "upcoming") {
      // Also check if the date is in the future
      const appointmentDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for proper comparison
      return appointmentDate >= today;
    }
    return false;
  });

  const pastAppointments = appointments.filter(apt => {
    // Consider completed or past appointments
    if (apt.status === "completed" || apt.status === "cancelled" || apt.status === "no-show") {
      return true;
    }
    
    // Also include scheduled appointments that are in the past
    if (apt.status === "scheduled") {
      const appointmentDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for proper comparison
      return appointmentDate < today;
    }
    
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Dashboard | Dental Smile</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user?.profile_picture} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{user?.name}</CardTitle>
                      <CardDescription>{user?.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard">
                        <CalendarDays className="w-5 h-5 mr-3" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard/profile">
                        <User className="w-5 h-5 mr-3" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard/settings">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <ul className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <li key={appointment.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-semibold">{appointment.service}</div>
                            <div className="text-sm text-gray-500">{appointment.date} at {appointment.time}</div>
                            <div className="text-sm text-gray-500">with {appointment.dentistName}</div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => handleReschedule(appointment)}>
                              Reschedule
                            </Button>
                            <Button variant="destructive" onClick={() => handleCancel(appointment)}>
                              Cancel
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">No upcoming appointments</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {pastAppointments.length > 0 ? (
                    <ul className="space-y-4">
                      {pastAppointments.map((appointment) => (
                        <li key={appointment.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-semibold">{appointment.service}</div>
                            <div className="text-sm text-gray-500">{appointment.date} at {appointment.time}</div>
                            <div className="text-sm text-gray-500">with {appointment.dentistName}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">No past appointments</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>


      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for your appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                className="rounded-md border"
                disabled={(date) => date < new Date() || date.getDay() === 0}
              />
            </div>
            <div className="space-y-2">
              <Label>New Time</Label>
              <Select onValueChange={setNewTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmReschedule}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Plus = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export default Dashboard;
