import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, Navigate } from "react-router-dom";
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
} from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  User,
  Settings,
  LogOut,
  Calendar,
  Search,
  Users,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock3,
  FileText,
  Stethoscope,
  CalendarRange,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { appointmentAPI } from '@/services/api';
import api from "@/services/api";
import { scheduleAPI } from "@/services/api";

interface Appointment {
  id: number | string; 
  _id?: string; 
  date: string;
  time: string;
  patientName: string;
  patientId: number | string;
  patientEmail?: string;
  patientPhone?: string;
  service: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment: string | null;
  appointments?: Appointment[];
}

interface TimeSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DentistDashboard = () => {
  const navigate = useNavigate();
  const [dentist, setDentist] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [schedule, setSchedule] = useState<{ [key: string]: TimeSlot[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: "Monday",
    startTime: "",
    endTime: "",
    isAvailable: true
  });

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    // Load dentist data
    const dentistData = localStorage.getItem("user");
    if (dentistData) {
      const parsedData = JSON.parse(dentistData);
      setDentist(parsedData);
      
      // Check if role is dentist
      if (parsedData.role !== "dentist") {
        toast.error("Access denied. This page is only for dentists.");
        
        if (parsedData.role === "admin") {
          navigate("/admin");
        } else if (parsedData.role === "patient") {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
        return;
      }
    } else {
      navigate("/dentist-login");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dentistData = localStorage.getItem("user");
      let currentDentist = dentist;
      
      if (!currentDentist && dentistData) {
        currentDentist = JSON.parse(dentistData);
      }
      
      try {
        const dentistId = currentDentist?._id || currentDentist?.id;
        
        if (!dentistId) {
          console.error("No dentist ID available for fetching appointments");
          toast.error("Unable to fetch appointments: Missing dentist ID");
          return;
        }
        
        console.log(`Fetching appointments for dentist ID: ${dentistId}`);
        const appointmentsResponse = await appointmentAPI.getAppointmentsByDentist(dentistId);
        console.log("Appointments response:", appointmentsResponse.data);
        
        // Process and normalize the appointments data
        const processedAppointments = (appointmentsResponse.data || []).map(appointment => {
          // Ensure we have consistent data structure
          return {
            id: appointment._id || appointment.id,
            _id: appointment._id || appointment.id,
            date: formatDateIfNeeded(appointment.date),
            time: appointment.startTime || appointment.time || "Not specified", 
            patientName: getPatientName(appointment),
            patientId: appointment.patientId || appointment.patient?._id || appointment.patient?.id,
            patientEmail: appointment.patient?.email || "",
            patientPhone: appointment.patient?.phone_number || "",
            service: appointment.service || "General Appointment",
            status: appointment.status || "scheduled",
            notes: appointment.notes || ""
          };
        });
        
        setAppointments(processedAppointments);
        
        if (processedAppointments.length > 0) {
          const patientMap = new Map();
          
          processedAppointments.forEach(appointment => {
            const patientId = appointment.patientId;
            
            if (!patientId) {
              console.log("Skipping appointment with missing patient ID:", appointment);
              return;
            }
            
            if (!patientMap.has(patientId)) {
              // Extract patient data from the appointment
              const patient = appointment.patient || {};
              
              patientMap.set(patientId, {
                id: patientId,
                name: appointment.patientName || "Unknown Patient",
                email: appointment.patientEmail || patient.email || "",
                phone: appointment.patientPhone || patient.phone_number || patient.phone || "",
                lastVisit: appointment.status === "completed" ? appointment.date : "",
                nextAppointment: appointment.status === "scheduled" ? appointment.date : null,
                appointments: [appointment]
              });
            } else {
              const patientRecord = patientMap.get(patientId);
              
              // Add appointment to patient's appointment history
              patientRecord.appointments = [...patientRecord.appointments, appointment];
              
              const today = new Date().toISOString().split('T')[0];
              if (appointment.date > today && appointment.status === "scheduled") {
                if (!patientRecord.nextAppointment || appointment.date < patientRecord.nextAppointment) {
                  patientRecord.nextAppointment = appointment.date;
                }
              }
              
              if (appointment.status === "completed") {
                if (!patientRecord.lastVisit || appointment.date > patientRecord.lastVisit) {
                  patientRecord.lastVisit = appointment.date;
                }
              }
            }
          });
          
          const patientList = Array.from(patientMap.values());
          console.log("Extracted patient list:", patientList);
          setPatients(patientList);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
        setAppointments([]);
        setPatients([]);
      }

      // Rest of the function remains the same
      try {
        if (currentDentist?._id || currentDentist?.id) {
          const dentistId = currentDentist._id || currentDentist.id;
          console.log("Fetching schedule for dentist ID:", dentistId);
          
          try {
            const scheduleResponse = await scheduleAPI.getDentistSchedule(dentistId);
            setSchedule(scheduleResponse.data || {});
          } catch (scheduleError) {
            console.log("Schedule not found, creating an empty schedule structure");
            const emptySchedule = {};
            weekdays.forEach(day => {
              emptySchedule[day] = [];
            });
            setSchedule(emptySchedule);
          }
        } else {
          console.error("No dentist ID available for fetching schedule");
          toast.error("Unable to fetch schedule: Missing dentist ID");
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast.error("Failed to load schedule data");
        setSchedule({});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper functions for processi ng appointment data
  const getPatientName = (appointment) => {
    // Try to get patient name from all possible sources
    if (appointment.patientName) {
      return appointment.patientName;
    }
    
    const patient = appointment.patient || {};
    if (patient.name) {
      return patient.name;
    }
    
    // Try to construct from first name and last name
    const firstName = patient.firstName || patient.first_name || "";
    const lastName = patient.lastName || patient.last_name || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    // Fallback
    return "Unknown Patient";
  };
  
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/dentist-login");
  };

  const handleAppointmentAction = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentStatus(appointment.status);
    setIsAppointmentDialogOpen(true);
  };

  const updateAppointmentStatus = async () => {
    if (!selectedAppointment) {
      toast.error("No appointment selected");
      return;
    }
    
    if (!appointmentStatus) {
      toast.error("Please select a status");
      return;
    }

    // Check if we have a valid ID (either _id or id)
    const appointmentId = selectedAppointment._id || selectedAppointment.id;
    
    if (!appointmentId) {
      console.error("Cannot update appointment: Missing ID", selectedAppointment);
      toast.error("Cannot update this appointment: Missing ID");
      return;
    }

    try {
      console.log("Updating appointment status for ID:", appointmentId, "to status:", appointmentStatus);
      await appointmentAPI.updateAppointmentStatus(appointmentId, appointmentStatus);
      
      // Update local state
      setAppointments(appointments.map(apt => 
        (apt.id === appointmentId || apt._id === appointmentId) ? 
          { ...apt, status: appointmentStatus as any } : apt
      ));
      
      toast.success(`Appointment marked as ${appointmentStatus}`);
      setIsAppointmentDialogOpen(false);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const toggleTimeSlotAvailability = async (day: string, slotId: number) => {
    try {
      // Find the slot to toggle
      const slot = schedule[day].find(s => s.id === slotId);
      if (!slot) return;
      
      // Get dentist ID, ensuring we have a value
      const dentistId = dentist?._id || dentist?.id;
      
      if (!dentistId) {
        toast.error("Unable to update time slot: Missing dentist ID");
        console.error("Cannot update time slot: Missing dentist ID", dentist);
        return;
      }
      
      // Toggle the slot
      const updatedSlot = { ...slot, isAvailable: !slot.isAvailable };
      
      // Make API call to update the schedule
      await scheduleAPI.updateSchedule(dentistId, {
        day,
        slotId,
        isAvailable: updatedSlot.isAvailable
      });
      
      // Update local state
      setSchedule({
        ...schedule,
        [day]: schedule[day].map(s => s.id === slotId ? updatedSlot : s)
      });
      
      toast.success(`Time slot ${updatedSlot.isAvailable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    }
  };

  const handleAddTimeSlot = async () => {
    if (!newTimeSlot.startTime || !newTimeSlot.endTime) {
      toast.error("Please provide both start time and end time");
      return;
    }

    try {
      // Get dentist ID, using both possible ID field names and showing error if missing
      const dentistId = dentist?._id || dentist?.id;
      
      if (!dentistId) {
        toast.error("Unable to add time slot: Missing dentist ID");
        console.error("Cannot add time slot: Missing dentist ID", dentist);
        return;
      }

      // Create the new time slot object with dentist ID
      const timeSlotToAdd = {
        ...newTimeSlot,
        day: newTimeSlot.day.toLowerCase() // Make sure day is lowercase to match backend expectations
      };
      
      // Make API call to add the time slot using the scheduleAPI
      const response = await scheduleAPI.addTimeSlot(dentistId, timeSlotToAdd);
      
      // Use the complete formatted schedule returned by backend to update our state
      if (response.data) {
        // Extract the added slot from the response
        const day = newTimeSlot.day;
        setSchedule(response.data);
        console.log("Updated schedule with new time slot:", response.data);
      }
      
      // Reset form and close dialog
      setNewTimeSlot({
        day: "Monday",
        startTime: "",
        endTime: "",
        isAvailable: true
      });
      setIsTimeSlotDialogOpen(false);
      
      toast.success("Time slot added successfully");
      
      // Force refresh of schedule data to ensure we have the latest
      const dentistId2 = dentist?._id || dentist?.id;
      if (dentistId2) {
        try {
          const scheduleResponse = await scheduleAPI.getDentistSchedule(dentistId2);
          if (scheduleResponse.data) {
            setSchedule(scheduleResponse.data);
          }
        } catch (error) {
          console.error("Error refreshing schedule:", error);
        }
      }
    } catch (error) {
      console.error("Error adding time slot:", error);
      toast.error("Failed to add time slot");
    }
  };

  const deleteTimeSlot = async (day: string, slotId: number) => {
    try {
      // Check if slot ID exists
      if (!slotId) {
        console.error("Cannot delete time slot: Invalid slot ID", slotId);
        toast.error("Failed to remove time slot: Invalid time slot ID");
        return;
      }

      console.log(`Attempting to delete time slot: day=${day}, slotId=${slotId}`);
      
      // Get dentist ID, ensuring we have a value
      const dentistId = dentist?._id || dentist?.id;
      
      if (!dentistId) {
        toast.error("Unable to delete time slot: Missing dentist ID");
        console.error("Cannot delete time slot: Missing dentist ID", dentist);
        return;
      }
      
      // Make API call to delete the time slot using the scheduleAPI
      await scheduleAPI.deleteTimeSlot(dentistId, slotId, day);
      
      // Update local state by removing the time slot
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        [day]: prevSchedule[day].filter(slot => slot.id !== slotId)
      }));
      
      toast.success("Time slot removed successfully");
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error("Failed to remove time slot");
    }
  };

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter(appointment => {
    // Safely access properties with optional chaining
    const patientNameMatch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const serviceMatch = appointment.service?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSearch = searchTerm === '' || patientNameMatch || serviceMatch;
    const matchesStatus = appointmentFilter === 'all' || appointment.status === appointmentFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(apt => apt.date === today);

  // Upcoming appointments (not including today)
  const upcomingAppointments = appointments.filter(apt => 
    apt.date > today && apt.status === "scheduled"
  );

  if (!localStorage.getItem("token")) {
    return <Navigate to="/dentist-login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Dentist Dashboard | Dental Smile</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={dentist?.profile_picture} alt={dentist?.name} />
                      <AvatarFallback>{dentist?.name?.charAt(0) || 'D'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{dentist?.name}</CardTitle>
                      <CardDescription className="flex items-center text-dentist-600">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        Dentist
                      </CardDescription>
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
                      <Link to="/dentist-dashboard">
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
            <div className="lg:col-span-4 space-y-8">
              <h1 className="text-3xl font-bold text-gray-800">Dentist Dashboard</h1>
              
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-dentist-50 border-dentist-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Today's Appointments</p>
                      <h2 className="text-3xl font-bold text-gray-800">{todaysAppointments.length}</h2>
                    </div>
                    <CalendarDays className="w-12 h-12 text-dentist-400" />
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Upcoming Appointments</p>
                      <h2 className="text-3xl font-bold text-gray-800">{upcomingAppointments.length}</h2>
                    </div>
                    <Calendar className="w-12 h-12 text-blue-400" />
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                      <h2 className="text-3xl font-bold text-gray-800">{patients.length}</h2>
                    </div>
                    <Users className="w-12 h-12 text-green-400" />
                  </CardContent>
                </Card>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dentist-600"></div>
                    <p className="text-dentist-600">Loading data...</p>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="appointments">
                  <TabsList className="grid w-full md:w-[500px] grid-cols-3">
                    <TabsTrigger value="appointments" className="flex items-center">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Appointments
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex items-center">
                      <CalendarRange className="mr-2 h-4 w-4" />
                      Schedule
                    </TabsTrigger>
                    <TabsTrigger value="patients" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Patients
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Appointments Tab */}
                  <TabsContent value="appointments" className="space-y-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search appointments"
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={appointmentFilter} onValueChange={setAppointmentFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAppointments.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                  No appointments found
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAppointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                  <TableCell className="font-medium">
                                    {appointment.patientName}
                                  </TableCell>
                                  <TableCell>
                                    {appointment.service}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span>{appointment.date}</span>
                                      <span className="text-gray-500 text-sm">{appointment.time}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className={`
                                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                      ${appointment.status === 'scheduled' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : appointment.status === 'completed' 
                                          ? 'bg-green-100 text-green-800' 
                                          : appointment.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                      }
                                    `}>
                                      {appointment.status === 'scheduled' && <Clock className="mr-1 h-3 w-3" />}
                                      {appointment.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                                      {appointment.status === 'cancelled' && <XCircle className="mr-1 h-3 w-3" />}
                                      {appointment.status === 'no-show' && <XCircle className="mr-1 h-3 w-3" />}
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAppointmentAction(appointment)}
                                    >
                                      Update Status
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Schedule Tab */}
                  <TabsContent value="schedule" className="space-y-4 py-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Weekly Schedule</h2>
                      <Button onClick={() => setIsTimeSlotDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Time Slot
                      </Button>
                    </div>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {weekdays.map((day) => (
                            <Card key={day} className="overflow-hidden">
                              <CardHeader className="bg-gray-50 p-4">
                                <CardTitle className="text-lg">{day}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                {schedule[day] && schedule[day].length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {schedule[day].map((slot) => (
                                        <TableRow key={slot.id}>
                                          <TableCell>
                                            {slot.startTime} - {slot.endTime}
                                          </TableCell>
                                          <TableCell>
                                            {slot.isAvailable ? (
                                              <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Available
                                              </div>
                                            ) : (
                                              <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                                                <XCircle className="mr-1 h-3 w-3" />
                                                Unavailable
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleTimeSlotAvailability(day, slot.id)}
                                            >
                                              {slot.isAvailable ? "Disable" : "Enable"}
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteTimeSlot(day, slot.id)}
                                            >
                                              <XCircle className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <div className="p-4 text-center text-gray-500">
                                    No time slots available for this day
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Patients Tab */}
                  <TabsContent value="patients" className="space-y-4 py-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search patients by name or email"
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient Name</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Last Visit</TableHead>
                              <TableHead>Next Appointment</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPatients.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                  No patients found
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredPatients.map((patient) => (
                                <TableRow key={patient.id}>
                                  <TableCell className="font-medium">
                                    {patient.name}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <div className="flex items-center text-sm">
                                        <Link to={`mailto:${patient.email}`}>
                                          {patient.email}
                                        </Link>
                                      </div>
                                      <div className="flex items-center text-sm text-gray-500">
                                        {patient.phone}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : "None scheduled"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                      >
                                        <Link to={`/dentist-dashboard/patients/${patient.id}`}>
                                          <FileText className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Update Appointment Status Dialog */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Change the status of this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <div className="font-medium">{selectedAppointment.patientName}</div>
              </div>
              <div className="space-y-2">
                <Label>Appointment Details</Label>
                <div className="text-sm">
                  <div>Service: {selectedAppointment.service}</div>
                  <div>Date: {selectedAppointment.date}</div>
                  <div>Time: {selectedAppointment.time}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={appointmentStatus} onValueChange={setAppointmentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAppointmentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateAppointmentStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Time Slot Dialog */}
      <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Time Slot</DialogTitle>
            <DialogDescription>
              Create a new time slot in your weekly schedule
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day of Week</Label>
              <Select 
                value={newTimeSlot.day} 
                onValueChange={(day) => setNewTimeSlot({...newTimeSlot, day})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTimeSlotDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTimeSlot}>
              Add Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DentistDashboard;