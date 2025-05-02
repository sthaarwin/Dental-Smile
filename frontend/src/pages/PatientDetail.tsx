import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  User,
  CalendarDays,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Calendar
} from "lucide-react";
import { appointmentAPI } from '@/services/api';
import api from "@/services/api";

interface Appointment {
  id: string | number;
  _id?: string;
  date: string;
  time: string;
  service: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

interface Patient {
  id: string | number;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  lastVisit?: string;
  nextAppointment?: string;
  appointments: Appointment[];
  profile_picture?: string;
  profilePicture?: string;
}

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view this page");
      navigate("/dentist-login");
      return;
    }
    
    // Get user info to verify dentist role
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user.role !== "dentist" && user.role !== "admin") {
        toast.error("You don't have permission to view this page");
        navigate("/dashboard");
        return;
      }
    }

    fetchPatientData();
  }, [patientId, navigate]);

  const fetchPatientData = async () => {
    if (!patientId) {
      toast.error("Patient ID is missing");
      navigate("/dentist-dashboard");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch basic patient data using the dentist-specific patient endpoint
      const response = await api.get(`/users/patients/${patientId}`);
      if (!response.data) {
        throw new Error("Failed to get patient data");
      }

      const userData = response.data;
      
      // Then fetch all appointments for this patient using the query parameter
      const appointmentsResponse = await api.get(`/appointments`, {
        params: { patient: patientId }
      });
      const appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
      
      // Process and sort appointments by date
      const processedAppointments = appointments.map(appointment => ({
        id: appointment._id || appointment.id,
        _id: appointment._id || appointment.id,
        date: formatDateIfNeeded(appointment.date),
        time: appointment.startTime || appointment.time || "Not specified",
        service: appointment.service || "General Appointment",
        status: appointment.status || "scheduled",
        notes: appointment.notes || ""
      })).sort((a, b) => {
        // Sort by date, most recent first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      // Create a complete patient object
      setPatient({
        id: patientId,
        _id: userData._id,
        name: userData.name || "Unknown Patient",
        email: userData.email || "",
        phone: userData.phone_number || "",
        lastVisit: getLastVisitDate(processedAppointments),
        nextAppointment: getNextAppointmentDate(processedAppointments),
        appointments: processedAppointments,
        profile_picture: userData.profile_picture,
        profilePicture: userData.profilePicture
      });

    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast.error("Failed to load patient data");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get the last visit date
  const getLastVisitDate = (appointments: Appointment[]): string | undefined => {
    const completedAppointments = appointments.filter(app => app.status === "completed");
    if (completedAppointments.length === 0) return undefined;
    
    // Find the most recent completed appointment
    return completedAppointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0].date;
  };

  // Helper function to get the next appointment date
  const getNextAppointmentDate = (appointments: Appointment[]): string | undefined => {
    const today = new Date().toISOString().split('T')[0];
    const upcomingAppointments = appointments.filter(
      app => app.status === "scheduled" && app.date >= today
    );
    
    if (upcomingAppointments.length === 0) return undefined;
    
    // Find the nearest upcoming appointment
    return upcomingAppointments.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0].date;
  };

  // Helper function to format dates consistently
  const formatDateIfNeeded = (dateString) => {
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

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDialogOpen(true);
  };

  const getUpcomingAppointments = () => {
    if (!patient) return [];
    const today = new Date().toISOString().split('T')[0];
    return patient.appointments.filter(app => app.status === "scheduled" && app.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPastAppointments = () => {
    if (!patient) return [];
    const today = new Date().toISOString().split('T')[0];
    return patient.appointments.filter(app => app.date < today || app.status !== "scheduled")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Helper function to render appointment status with appropriate styling
  const renderAppointmentStatus = (status: string) => {
    let className = "";
    let icon = null;
    
    switch(status) {
      case "scheduled":
        className = "bg-blue-100 text-blue-800";
        icon = <Clock className="mr-1 h-3 w-3" />;
        break;
      case "completed":
        className = "bg-green-100 text-green-800";
        icon = <CheckCircle className="mr-1 h-3 w-3" />;
        break;
      case "cancelled":
        className = "bg-red-100 text-red-800";
        icon = <XCircle className="mr-1 h-3 w-3" />;
        break;
      case "no-show":
        className = "bg-yellow-100 text-yellow-800";
        icon = <AlertCircle className="mr-1 h-3 w-3" />;
        break;
      default:
        className = "bg-gray-100 text-gray-800";
    }
    
    return (
      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dentist-600"></div>
            <p className="text-dentist-600">Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Patient Not Found</h1>
          <p className="text-gray-600 mb-6">The patient you're looking for could not be found.</p>
          <Button asChild>
            <Link to="/dentist-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Patient Details | {patient.name} | Dental Smile</title>
        <meta name="description" content={`Patient profile and history for ${patient.name}`} />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button variant="outline" className="mr-4" asChild>
              <Link to="/dentist-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Patient Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Patient Information Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center">
                    <Avatar className="h-16 w-16 mr-4">
                      {patient.profile_picture || patient.profilePicture ? (
                        <AvatarImage 
                          src={patient.profile_picture || patient.profilePicture} 
                          alt={patient.name} 
                          className="object-cover" 
                        />
                      ) : (
                        <AvatarFallback className="bg-dentist-100 text-dentist-600">
                          {patient.name[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold">{patient.name}</h2>
                      <p className="text-gray-500">Patient</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3 border-t">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <a href={`mailto:${patient.email}`} className="text-dentist-600 hover:underline">
                        {patient.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <a href={`tel:${patient.phone}`} className="text-dentist-600 hover:underline">
                        {patient.phone}
                      </a>
                    </div>
                    {patient.lastVisit && (
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Last visit: <span className="font-medium">
                          {new Date(patient.lastVisit).toLocaleDateString()}
                        </span></span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {patient.nextAppointment && (
                <Card className="mt-6 bg-blue-50 border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-blue-800 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Next Appointment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-lg font-medium text-blue-800">
                      {new Date(patient.nextAppointment).toLocaleDateString()}
                    </div>
                    <div className="text-blue-700">
                      {upcomingAppointments[0]?.time} - {upcomingAppointments[0]?.service}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Appointment History */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming" className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Upcoming Appointments ({upcomingAppointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="past" className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Past Appointments ({pastAppointments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row justify-between items-center">
                      <div>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <div className="mt-1.5">
                          <CardDescription>
                            Scheduled appointments for this patient
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {upcomingAppointments.length === 0 ? (
                        <div className="py-8 text-center">
                          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">No upcoming appointments</p>
                          <p className="text-gray-400 text-sm mt-1">This patient doesn't have any scheduled appointments</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {upcomingAppointments.map((appointment) => (
                            <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-grow">
                                  <div className="flex items-center space-x-2">
                                    <div className="bg-blue-50 p-2 rounded-full">
                                      <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {new Date(appointment.date).toLocaleDateString('en-US', {
                                          weekday: 'long',
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </div>
                                      <div className="text-sm text-gray-500 flex items-center mt-1">
                                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                        {appointment.time}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-3 ml-9">
                                    <div className="text-gray-800">{appointment.service}</div>
                                    <div className="mt-2">
                                      {renderAppointmentStatus(appointment.status)}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAppointmentClick(appointment)}
                                  className="flex items-center ml-2"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="past">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Past Appointments</CardTitle>
                      <div className="mt-1.5">
                        <CardDescription>
                          Appointment history for this patient
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {pastAppointments.length === 0 ? (
                        <div className="py-8 text-center">
                          <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">No past appointments</p>
                          <p className="text-gray-400 text-sm mt-1">This patient doesn't have any appointment history</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {pastAppointments.map((appointment) => (
                            <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-grow">
                                  <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-full ${
                                      appointment.status === "completed" 
                                        ? "bg-green-50" 
                                        : appointment.status === "cancelled"
                                          ? "bg-red-50"
                                          : "bg-yellow-50"
                                    }`}>
                                      {appointment.status === "completed" && (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      )}
                                      {appointment.status === "cancelled" && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                      )}
                                      {appointment.status === "no-show" && (
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {new Date(appointment.date).toLocaleDateString('en-US', {
                                          weekday: 'long',
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </div>
                                      <div className="text-sm text-gray-500 flex items-center mt-1">
                                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                        {appointment.time}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-3 ml-9">
                                    <div className="text-gray-800">{appointment.service}</div>
                                    <div className="mt-2">
                                      {renderAppointmentStatus(appointment.status)}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAppointmentClick(appointment)}
                                  className="flex items-center ml-2"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Details for appointment on {new Date(selectedAppointment.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Date</Label>
                  <div className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Time</Label>
                  <div className="font-medium">{selectedAppointment.time}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Service</Label>
                <div className="font-medium">{selectedAppointment.service}</div>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <div className="mt-1">
                  {renderAppointmentStatus(selectedAppointment.status)}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <Label className="text-sm text-gray-500">Notes</Label>
                  <div className="p-3 bg-gray-50 rounded-md mt-1 text-sm">{selectedAppointment.notes}</div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Link to={`/dentist-dashboard/appointments/${selectedAppointment.id}/edit`}>
                <Button variant="outline">Edit Appointment</Button>
              </Link>
              <Button onClick={() => setIsAppointmentDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PatientDetail;