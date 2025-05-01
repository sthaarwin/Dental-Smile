import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  CalendarDays,
  AlarmClock,
  Stethoscope,
  UserCircle,
  Plus,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/services/api"; 

import { Dentist } from "@/types/dentist";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

const appointmentTypes = [
  { id: "regular-checkup", label: "Regular Check-up", duration: "30 min" },
  { id: "cleaning", label: "Teeth Cleaning", duration: "45 min" },
  { id: "consultation", label: "Consultation", duration: "30 min" },
  { id: "emergency", label: "Emergency Visit", duration: "60 min" }
];

const BookAppointment = () => {
  const { dentistId } = useParams();
  const navigate = useNavigate();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [isDentistsLoading, setIsDentistsLoading] = useState<boolean>(true);
  const selectedDentist = dentistId ? dentists.find(d => d.id === Number(dentistId)) : undefined;
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [appointmentType, setAppointmentType] = useState<string>();
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [customTimeHours, setCustomTimeHours] = useState("");
  const [customTimeMinutes, setCustomTimeMinutes] = useState("");
  const [customTimeAmPm, setCustomTimeAmPm] = useState("AM");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    insurance: "",
    isNewPatient: "new"
  });

  const [selectedDentistId, setSelectedDentistId] = useState<number | undefined>(
    selectedDentist?.id
  );
  
  // Fetch dentists from the backend
  useEffect(() => {
    const fetchDentists = async () => {
      setIsDentistsLoading(true);
      try {
        const response = await api.get('/services/dentists/public');
        let dentistsArray: Dentist[] = [];
        
        // Check if response has a nested data property containing dentists array
        if (response.data && Array.isArray(response.data.data)) {
          dentistsArray = response.data.data;
          setDentists(dentistsArray);
        } else if (Array.isArray(response.data)) {
          dentistsArray = response.data;
          setDentists(dentistsArray);
        } else {
          console.error("Unexpected API response format:", response.data);
          setDentists([]);
          toast.error("Failed to parse dentist data");
          return;
        }
        
        // Set selectedDentistId after dentists are loaded
        if (dentistId) {
          const dentistIdNum = Number(dentistId);
          const foundDentist = dentistsArray.find(d => d.id === dentistIdNum);
          
          if (foundDentist) {
            setSelectedDentistId(foundDentist.id);
            console.log("Dentist found and ID set:", foundDentist.id);
          } else {
            // If dentist not found with numeric ID, try string comparison
            const foundByString = dentistsArray.find(d => d.id.toString() === dentistId);
            if (foundByString) {
              setSelectedDentistId(foundByString.id);
              console.log("Dentist found by string ID:", foundByString.id);
            } else {
              console.error("Dentist not found with ID:", dentistId);
              // If a specific dentist was requested but not found, show error
              toast.error("Selected dentist not found");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dentists:", error);
        toast.error("Failed to load dentists");
        setDentists([]);
      } finally {
        setIsDentistsLoading(false);
      }
    };

    fetchDentists();
  }, [dentistId]);

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Get user data from localStorage
        const userString = localStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,  
            firstName: userData.name?.split(' ')[0] || "",
            lastName: userData.name?.split(' ').slice(1).join(' ') || "",
            email: userData.email || "",
            phone: userData.phone_number || "",
            isNewPatient: "existing"  // Set as existing patient
          }));
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error loading user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !appointmentType || !selectedDentistId) {
      toast.error("Please complete all required fields");
      return;
    }
    
    try {
      // Format the data for the API
      const appointmentData = {
        patient: user._id || user.id, // Changed from patient_id to patient
        dentist: selectedDentistId.toString(), // Changed from dentist_id to dentist
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedTime, // Changed from start_time to startTime
        endTime: calculateEndTime(selectedTime, 
          appointmentTypes.find(t => t.id === appointmentType)?.duration || "30 min"), // Changed from end_time to endTime
        service: appointmentTypes.find(t => t.id === appointmentType)?.label || "", // Changed from service_type to service
        notes: formData.notes
        // Removed additional fields not expected by the backend:
        // - status
        // - patient_name
        // - patient_email
        // - patient_phone
      };
      
      console.log("Sending appointment data:", appointmentData);
      await api.post('/appointments', appointmentData);
      
      toast.success("Appointment booked successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to book appointment";
      toast.error(errorMessage);
      console.error("Appointment booking error:", error);
    }
  };
  
   const calculateEndTime = (startTime: string, duration: string): string => {
    const [hours, minutesPart] = startTime.split(':');
    const [minutes, period] = minutesPart.split(' ');
    
    const startHour = parseInt(hours);
    const startMinute = parseInt(minutes);
    
     const durationMinutes = parseInt(duration.split(' ')[0]);
    
    let totalMinutes = startHour * 60 + startMinute + durationMinutes;
    if (period.toUpperCase() === 'PM' && startHour !== 12) {
      totalMinutes += 12 * 60;
    }
    if (period.toUpperCase() === 'AM' && startHour === 12) {
      totalMinutes -= 12 * 60;
    }
    
     let endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    
     let endPeriod = 'AM';
    if (endHour >= 12) {
      endPeriod = 'PM';
      if (endHour > 12) {
        endHour -= 12;
      }
    }
    if (endHour === 0) {
      endHour = 12;
    }
    
    return `${endHour}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;
  };

  const handleNext = () => {
     if (currentStep === 1 && !selectedDate) {
      toast.error("Please select a date");
      return;
    }
    
    if (currentStep === 2 && !selectedTime) {
      toast.error("Please select a time");
      return;
    }
    
    if (currentStep === 3 && !appointmentType) {
      toast.error("Please select a service");
      return;
    }
    
    if (currentStep === 4) {
      if (!formData.firstName || !formData.lastName) {
        toast.error("Please enter your name");
        return;
      }
      if (!formData.email) {
        toast.error("Please enter your email");
        return;
      }
      if (!formData.phone) {
        toast.error("Please enter your phone number");
        return;
      }
    }
    
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCustomTimeSelect = () => {
    setShowCustomTimeInput(true);
    setSelectedTime("custom");
  };

  const applyCustomTime = () => {
    // Validate hours and minutes
    const hours = parseInt(customTimeHours);
    const minutes = parseInt(customTimeMinutes);
    
    if (isNaN(hours) || hours < 1 || hours > 12 || isNaN(minutes) || minutes < 0 || minutes > 59) {
      toast.error("Please enter a valid time");
      return;
    }
    
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${customTimeAmPm}`;
    setSelectedTime(formattedTime);
    setShowCustomTimeInput(false);
  };

  const renderDentistSelection = () => {
    if (dentistId || selectedDentistId) return null;

    if (isDentistsLoading) {
      return (
        <div className="p-6 flex justify-center items-center">
          <Loader2 className="w-6 h-6 text-dentist-600 animate-spin" />
        </div>
      );
    }

    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <User className="w-6 h-6 mr-2 text-dentist-600" />
          Select a Dentist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dentists.map((dentist) => (
            <div
              key={dentist.id}
              onClick={() => setSelectedDentistId(dentist.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                ${
                  selectedDentistId === dentist.id
                    ? "border-dentist-600 bg-dentist-50 ring-2 ring-dentist-200"
                    : "border-gray-200 hover:border-dentist-300"
                }`}
            >
              <div className="flex items-center">
                <img
                  src={dentist.image}
                  alt={`Dr. ${dentist.lastName}`}
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-100"
                />
                <div>
                  <h3 className="font-medium">Dr. {dentist.firstName} {dentist.lastName}</h3>
                  <p className="text-sm text-gray-500">{dentist.specialty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-dentist-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-dentist-600 font-medium">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
            <p className="text-gray-600">Complete the steps below to schedule your dental visit</p>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-dentist-600 -translate-y-1/2 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
              <div className="relative flex justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center ${
                      step <= currentStep ? "text-dentist-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-2 shadow-sm
                        ${
                          step === currentStep
                            ? "bg-white border-2 border-dentist-600 text-dentist-600"
                            : step < currentStep
                            ? "bg-dentist-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      {step < currentStep ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <>
                          {step === 1 && <CalendarDays className="w-5 h-5" />}
                          {step === 2 && <AlarmClock className="w-5 h-5" />}
                          {step === 3 && <Stethoscope className="w-5 h-5" />}
                          {step === 4 && <UserCircle className="w-5 h-5" />}
                        </>
                      )}
                    </div>
                    <span className="text-xs font-medium">
                      {step === 1 && "Date"}
                      {step === 2 && "Time"}
                      {step === 3 && "Service"}
                      {step === 4 && "Details"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all">
            {/* Render dentist selection if needed */}
            {renderDentistSelection()}

            {/* Step 1: Date Selection */}
            {currentStep === 1 && (
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <CalendarIcon className="w-6 h-6 mr-2 text-dentist-600" />
                  Select a Date
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border shadow-sm"
                      disabled={(date) => {
                        return date < new Date() || date.getDay() === 0;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
                      <h3 className="font-medium mb-3 flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2 text-dentist-600" />
                        Selected Date
                      </h3>
                      {selectedDate ? (
                        <>
                          <p className="text-dentist-600 text-lg">
                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </p>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Note:</span> Weekends and past dates are not available for scheduling.
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">Please select a date from the calendar</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Time Selection */}
            {currentStep === 2 && (
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-dentist-600" />
                  Select a Time
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        setShowCustomTimeInput(false);
                      }}
                      className={`p-4 rounded-lg border text-center transition-colors flex flex-col items-center justify-center hover:shadow-md
                        ${
                          selectedTime === time
                            ? "bg-dentist-50 border-dentist-600 text-dentist-600 ring-2 ring-dentist-200"
                            : "border-gray-200 hover:border-dentist-600"
                        }`}
                    >
                      <Clock className="w-5 h-5 mb-1" />
                      {time}
                    </button>
                  ))}
                  
                  {/* Custom time button */}
                  <button
                    onClick={handleCustomTimeSelect}
                    className={`p-4 rounded-lg border text-center transition-colors flex flex-col items-center justify-center hover:shadow-md
                      ${
                        selectedTime === "custom" || showCustomTimeInput
                          ? "bg-dentist-50 border-dentist-600 text-dentist-600 ring-2 ring-dentist-200"
                          : "border-gray-200 hover:border-dentist-600"
                      }`}
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    Custom Time
                  </button>
                </div>
                
                {/* Custom time input section */}
                {showCustomTimeInput && (
                  <div className="mt-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-3">Enter Custom Time</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-20">
                        <Label htmlFor="hours" className="text-sm mb-1">Hours</Label>
                        <Input
                          id="hours"
                          placeholder="1-12"
                          value={customTimeHours}
                          onChange={(e) => setCustomTimeHours(e.target.value)}
                          className="text-center"
                          maxLength={2}
                        />
                      </div>
                      <div className="pt-5">:</div>
                      <div className="w-20">
                        <Label htmlFor="minutes" className="text-sm mb-1">Minutes</Label>
                        <Input
                          id="minutes"
                          placeholder="00-59"
                          value={customTimeMinutes}
                          onChange={(e) => setCustomTimeMinutes(e.target.value)}
                          className="text-center"
                          maxLength={2}
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor="ampm" className="text-sm mb-1">AM/PM</Label>
                        <Select value={customTimeAmPm} onValueChange={setCustomTimeAmPm}>
                          <SelectTrigger id="ampm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        className="mt-5 ml-2" 
                        onClick={applyCustomTime}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Office hours are from 9:00 AM to 5:00 PM</p>
                  </div>
                )}
                
                {/* Selected time display */}
                {selectedTime && !showCustomTimeInput && (
                  <div className="mt-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-2">You selected:</h3>
                    <p className="text-dentist-600 text-lg font-medium">{selectedTime}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Service Selection */}
            {currentStep === 3 && (
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Stethoscope className="w-6 h-6 mr-2 text-dentist-600" />
                  Select Service
                </h2>
                <div className="space-y-4">
                  {appointmentTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setAppointmentType(type.id)}
                      className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md
                        ${
                          appointmentType === type.id
                            ? "border-dentist-600 bg-dentist-50 ring-2 ring-dentist-200"
                            : "border-gray-200 hover:border-dentist-300"
                        }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{type.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">Duration: {type.duration}</p>
                        </div>
                        <RadioGroup value={appointmentType}>
                          <RadioGroupItem value={type.id} className="h-5 w-5" />
                        </RadioGroup>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Patient Details */}
            {currentStep === 4 && (
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <UserCircle className="w-6 h-6 mr-2 text-dentist-600" />
                  Your Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="firstName" className="mb-1 block">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="mb-1 block">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="email" className="mb-1 block">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="mb-1 block">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="insurance" className="mb-1 block">Insurance Provider (Optional)</Label>
                    <Input
                      id="insurance"
                      value={formData.insurance}
                      onChange={(e) =>
                        setFormData({ ...formData, insurance: e.target.value })
                      }
                      placeholder="Enter your insurance provider"
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Patient Status</Label>
                    <RadioGroup
                      value={formData.isNewPatient}
                      onValueChange={(value) => setFormData({ ...formData, isNewPatient: value })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center">
                        <RadioGroupItem id="new" value="new" />
                        <Label htmlFor="new" className="ml-2">New Patient</Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem id="existing" value="existing" />
                        <Label htmlFor="existing" className="ml-2">Existing Patient</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="mb-1 block">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any special concerns or requests..."
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium mb-3">Appointment Summary</h3>
                    <div className="space-y-2 text-sm">
                      {selectedDate && (
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2 text-dentist-500" />
                          <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-dentist-500" />
                          <span>{selectedTime}</span>
                        </div>
                      )}
                      {appointmentType && (
                        <div className="flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2 text-dentist-500" />
                          <span>{appointmentTypes.find(t => t.id === appointmentType)?.label}</span>
                        </div>
                      )}
                      {selectedDentistId && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-dentist-500" />
                          <span>Dr. {dentists.find(d => d.id === selectedDentistId)?.firstName} {dentists.find(d => d.id === selectedDentistId)?.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-5"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                className="px-5 bg-dentist-600 hover:bg-dentist-700"
              >
                {currentStep === 4 ? "Confirm Booking" : "Continue"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default BookAppointment;
