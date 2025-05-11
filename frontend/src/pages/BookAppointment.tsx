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
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/services/api"; 

import { Dentist } from "@/types/dentist";

const defaultTimeSlots = [
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
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(defaultTimeSlots);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false);
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

  // Add a new state to track suggested alternative times
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);
  
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

  // Fetch available time slots when date or dentist changes
  useEffect(() => {
    if (selectedDate && selectedDentistId) {
      fetchAvailableTimeSlots(selectedDate, selectedDentistId);
    }
  }, [selectedDate, selectedDentistId]);

  // Reset selected time when available time slots change
  useEffect(() => {
    if (selectedTime && !availableTimeSlots.includes(selectedTime) && !showCustomTimeInput) {
      setSelectedTime(undefined);
    }
  }, [availableTimeSlots]);

  // Fetch available time slots based on dentist schedule and existing appointments
  const fetchAvailableTimeSlots = async (date: Date, dentistId: number) => {
    setIsLoadingTimeSlots(true);
    setAvailableTimeSlots([]);
    // Clear suggested times
    setSuggestedTimes([]);
    
    try {
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      // Get day of week as lowercase string (e.g., 'monday')
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

      console.log(`Fetching availability for date: ${formattedDate}, dentist: ${dentistId}, day: ${dayOfWeek}`);

      // 1. Fetch dentist's schedule
      let schedule;
      try {
        const scheduleResponse = await api.get(`/schedules/dentist/${dentistId}`);
        schedule = scheduleResponse.data;
        console.log("Dentist schedule:", schedule);
      } catch (error) {
        console.error("Failed to fetch dentist schedule:", error);
        setAvailableTimeSlots([]);
        setIsLoadingTimeSlots(false);
        return;
      }

      // 2. Check if the dentist works on this day
      // First check if the specific date is a day off
      const daysOff = schedule?.daysOff || [];
      const isDayOff = Array.isArray(daysOff) && daysOff.some(dayOff => {
        // Compare dates - convert string dates to Date objects if needed
        const offDate = typeof dayOff === 'string' ? new Date(dayOff) : dayOff;
        return offDate && offDate.toISOString().split('T')[0] === formattedDate;
      });

      if (isDayOff) {
        console.log(`Dentist is off on this specific date: ${formattedDate}`);
        toast.error("The dentist is not available on this date");
        setAvailableTimeSlots([]);
        setIsLoadingTimeSlots(false);
        return;
      }

      // Then check the day's schedule
      const dailySchedule = schedule?.[dayOfWeek];
      console.log(`Schedule for ${dayOfWeek}:`, dailySchedule);

      // Is this day a working day?
      const isWorkingDay = dailySchedule && (
        (typeof dailySchedule === 'object' && dailySchedule.isWorking !== false) ||
        (Array.isArray(dailySchedule) && dailySchedule.length > 0)
      );

      if (!isWorkingDay) {
        console.log(`Dentist does not work on ${dayOfWeek}`);
        toast.error("The dentist does not work on this day");
        setAvailableTimeSlots([]);
        setIsLoadingTimeSlots(false);
        return;
      }

      // 3. Get the dentist's working hours for this day
      const workHours = {
        start: dailySchedule?.startTime || "9:00 AM",
        end: dailySchedule?.endTime || "5:00 PM"
      };

      console.log("Working hours:", workHours);

      // 4. Get specific time slots for this day if available
      const daySpecificSlots = schedule?.[`${dayOfWeek}Slots`] || [];
      const hasSpecificSlots = Array.isArray(daySpecificSlots) && daySpecificSlots.length > 0;

      // 5. Try to fetch existing appointments
      let bookedTimeSlots = new Set();
      
      try {
        console.log(`Fetching booked appointments for dentist ${dentistId} on ${formattedDate}...`);
        // Use the public endpoint for appointment checking
        const appointmentsUrl = `/appointments/public`;
        const appointmentsResponse = await api.get(appointmentsUrl, { 
          params: { 
            date: formattedDate,
            dentist: dentistId
          }
        });
        
        const appointments = appointmentsResponse.data;
        console.log(`Found ${appointments.length} appointments for this date:`, appointments);
        
        // Process appointments to extract booked time slots
        if (appointments && Array.isArray(appointments)) {
          appointments.forEach(appointment => {
            // Skip cancelled or no-show appointments
            if (appointment.status === 'cancelled' || appointment.status === 'no-show') {
              console.log(`Skipping ${appointment.status} appointment:`, appointment);
              return;
            }
            
            // Add the appointment time to booked slots
            const startTime = appointment.startTime || appointment.time;
            if (startTime) {
              console.log(`Marking time slot as booked: ${startTime}`);
              bookedTimeSlots.add(startTime);
            }

            // Block any overlapping slots
            if (startTime && appointment.endTime) {
              console.log(`Checking for overlaps with: ${startTime} - ${appointment.endTime}`);
              
              defaultTimeSlots.forEach(slot => {
                // Calculate end time for this slot
                const slotEnd = calculateEndTime(slot, "30 min");
                
                // If this slot overlaps with the appointment, mark it as booked
                if (isTimeOverlapping(slot, slotEnd, startTime, appointment.endTime)) {
                  console.log(`Slot ${slot} overlaps with existing appointment, marking as booked`);
                  bookedTimeSlots.add(slot);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        // If we can't fetch appointments, we'll use an empty set (assume no bookings)
        console.log("No appointment data available - proceeding with empty booked slots");
      }

      console.log("All booked time slots:", [...bookedTimeSlots]);

      // 6. Determine available time slots
      let availableSlots = [];
      let allPossibleSlots = []; // All possible slots on this day
      
      if (hasSpecificSlots) {
        allPossibleSlots = daySpecificSlots
          .filter(slot => slot.isAvailable)
          .map(slot => slot.startTime);
          
        // Filter specific time slots that are available and not booked
        availableSlots = allPossibleSlots.filter(time => !bookedTimeSlots.has(time));
          
        console.log("Using specific time slots:", availableSlots);
      } else {
        // All default time slots within working hours
        allPossibleSlots = defaultTimeSlots.filter(time => 
          isTimeInRange(time, workHours.start, workHours.end)
        );
        
        // Filter default time slots based on working hours and bookings
        availableSlots = allPossibleSlots.filter(time => {
          const isWithinWorkHours = isTimeInRange(time, workHours.start, workHours.end);
          const isNotBooked = !bookedTimeSlots.has(time);
          
          if (!isWithinWorkHours) {
            console.log(`Time slot ${time} is outside working hours`);
          }
          if (!isNotBooked) {
            console.log(`Time slot ${time} is already booked`);
          }
          
          return isWithinWorkHours && isNotBooked;
        });
        
        console.log("Available time slots after filtering:", availableSlots);
      }
      
      // Generate suggested times if specific slot is requested
      // or if there are very few available slots
      if ((selectedTime && bookedTimeSlots.has(selectedTime)) || 
          (availableSlots.length < 3 && allPossibleSlots.length > 0)) {
        
        // Suggest up to 3 alternative times
        const suggestions = allPossibleSlots
          .filter(time => !bookedTimeSlots.has(time))
          .slice(0, 3);
        
        console.log("Generated time suggestions:", suggestions);
        setSuggestedTimes(suggestions);
      }
      
      // Update state with available slots
      setAvailableTimeSlots(availableSlots);
      
      // Reset selected time if it's not available
      if (selectedTime && !availableSlots.includes(selectedTime) && !showCustomTimeInput) {
        console.log(`Selected time ${selectedTime} is no longer available, clearing selection`);
        setSelectedTime(undefined);
      }
    } catch (error) {
      console.error("Error determining available time slots:", error);
      toast.error("Failed to fetch available times");
      setAvailableTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Helper function to check if two time ranges overlap
  const isTimeOverlapping = (startA: string, endA: string, startB: string, endB: string): boolean => {
    const startAMinutes = getTimeInMinutes(startA);
    const endAMinutes = getTimeInMinutes(endA);
    const startBMinutes = getTimeInMinutes(startB);
    const endBMinutes = getTimeInMinutes(endB);
    
    // Check if one time range starts during another time range
    return (startAMinutes < endBMinutes && endAMinutes > startBMinutes);
  };
  
  // Helper function to convert time string to minutes for comparison
  const getTimeInMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    
    const [timePart, period] = timeStr.split(' ');
    if (!timePart || !period) return 0;
    
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return 0;
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  // Helper function to check if a time is within a range
  const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
    // Convert to minutes for easier comparison
    const timeMinutes = getTimeInMinutes(time);
    const startMinutes = getTimeInMinutes(startTime);
    const endMinutes = getTimeInMinutes(endTime);
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  };

  // New function to check time slot availability before proceeding
  const checkTimeSlotAvailability = async (): Promise<boolean> => {
    if (!selectedDate || !selectedTime || !selectedDentistId) {
      return false;
    }
    
    try {
      // Format date in the same way we do for submission
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Get a preliminary end time for checking
      // We'll use 30 minutes as a default duration for this check
      const prelimEndTime = calculateEndTime(selectedTime, "30 min");
      
      // Make a request to check if this time slot is available
      const response = await api.get('/appointments/public', {
        params: {
          date: formattedDate,
          dentist: selectedDentistId
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Invalid response when checking appointment availability");
        return true; // Allow to proceed if we can't properly check
      }

      // Check for conflicts with existing appointments
      for (const appointment of response.data) {
        if (appointment.status === 'cancelled' || appointment.status === 'no-show') {
          continue; // Skip cancelled appointments
        }
        
        // Simple check for exact same start time
        if (appointment.startTime === selectedTime) {
          toast.error("This time slot is already booked. Please select a different time.");
          return false;
        }
        
        // Check for overlapping appointments using our time helper functions
        if (isTimeOverlapping(
          selectedTime, prelimEndTime,
          appointment.startTime, appointment.endTime
        )) {
          toast.error("This time conflicts with an existing appointment. Please select a different time.");
          return false;
        }
      }
      
      return true; // No conflicts found
    } catch (error) {
      console.error("Error checking appointment availability:", error);
      // Let them proceed if we can't check properly, backend will validate again on submit
      return true;
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !appointmentType || !selectedDentistId) {
      toast.error("Please complete all required fields");
      return;
    }
    
    try {
      // Create a date string in YYYY-MM-DD format that preserves the selected date
      // Using UTC date methods to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log("User selected date:", selectedDate);
      console.log("Formatted date being sent:", formattedDate);
      
      const appointmentData = {
        patient: user._id || user.id,
        dentist: selectedDentistId.toString(),
        date: formattedDate,  // Use the formatted date string
        startTime: selectedTime,
        endTime: calculateEndTime(selectedTime, 
          appointmentTypes.find(t => t.id === appointmentType)?.duration || "30 min"),
        service: appointmentTypes.find(t => t.id === appointmentType)?.label || "",
        notes: formData.notes
      };
      
      console.log("Sending appointment data:", appointmentData);
      
      try {
        await api.post('/appointments', appointmentData);
        toast.success("Appointment booked successfully!");
        navigate("/dashboard");
      } catch (error: any) {
        // Handle conflict errors specifically
        if (error.response?.status === 400 && 
            error.response?.data?.message === 'This time slot is already booked') {
          toast.error("This time slot is already booked. Please select a different time.");
          // Move back to time selection step
          setCurrentStep(2);
          // Refresh available time slots
          if (selectedDate) {
            fetchAvailableTimeSlots(selectedDate, selectedDentistId);
          }
        } else {
          const errorMessage = error.response?.data?.message || "Failed to book appointment";
          toast.error(errorMessage);
          console.error("Appointment booking error:", error);
        }
      }
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

  const handleNext = async () => {
    if (currentStep === 1 && !selectedDate) {
      toast.error("Please select a date");
      return;
    }
    
    if (currentStep === 2 && !selectedTime) {
      toast.error("Please select a time");
      return;
    }
    
    // Check time slot availability before proceeding to service selection
    if (currentStep === 2) {
      // Show loading indicator
      toast.loading("Checking appointment availability...");
      
      const isAvailable = await checkTimeSlotAvailability();
      
      // Dismiss the loading toast
      toast.dismiss();
      
      if (!isAvailable) {
        // If slot is not available, fetch new available time slots
        if (selectedDate && selectedDentistId) {
          fetchAvailableTimeSlots(selectedDate, selectedDentistId);
        }
        return; // Don't proceed if time slot is not available
      }
      
      // If available, show confirmation and proceed
      toast.success("Time slot available!");
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
                        return date < new Date() || date.getDay() === 6; 
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
                
                {isLoadingTimeSlots ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-8 h-8 text-dentist-600 animate-spin" />
                      <p className="text-dentist-600">Loading available times...</p>
                    </div>
                  </div>
                ) : availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                    {availableTimeSlots.map((time) => (
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
                ) : (
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
                    <div className="flex items-start">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800 mb-1">No Available Time Slots</h3>
                        <p className="text-yellow-700 mb-4">
                          There are no available time slots for the selected date. This could be because the dentist isn't working on this day, 
                          all slots are booked, or no schedule is defined.
                        </p>
                        
                        {suggestedTimes.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-yellow-800 mb-2">Available alternatives:</h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestedTimes.map(time => (
                                <button
                                  key={time}
                                  onClick={() => {
                                    setSelectedTime(time);
                                    setShowCustomTimeInput(false);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 bg-white border border-yellow-300 rounded-md text-sm text-yellow-800 hover:bg-yellow-50"
                                >
                                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {suggestedTimes.length === 0 && (
                          <p className="text-yellow-700 mt-2">
                            Please try another date or contact us directly to schedule an appointment.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
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
                    <p className="text-xs text-gray-500 mt-3">
                      Note: Custom times may not be available if the dentist is already booked or not working at that time.
                      The system will check availability when you submit your appointment.
                    </p>
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
