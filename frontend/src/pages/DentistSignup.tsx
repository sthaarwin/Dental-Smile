import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Clock,
  Shield,
  FileCheck,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";

const DentistSignup = () => {
  const [step, setStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    
    specialties: [] as string[],
    experience: "",
    education: "",
    certifications: "",
    licenseNumber: "",
    
    practiceName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    officePhone: "",
    businessHours: {
      sunday: { open: "10:00", close: "16:00", isOpen: true },
      monday: { open: "10:00", close: "16:00", isOpen: true },
      tuesday: { open: "10:00", close: "16:00", isOpen: true },
      wednesday: { open: "10:00", close: "16:00", isOpen: true },
      thursday: { open: "10:00", close: "16:00", isOpen: true },
      friday: { open: "10:00", close: "16:00", isOpen: true },
      saturday: { open: "10:00", close: "16:00", isOpen: false },
    },
    acceptedInsurance: "",
    
    bio: "",
    services: [] as { name: string; price: number }[],
    languages: "",
    
    applicationStatus: "pending",
  });

  const [inputService, setInputService] = useState("");

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
         const userString = localStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          
           setFormData(prev => ({
            ...prev,
            firstName: userData.name?.split(' ')[0] || "",
            lastName: userData.name?.split(' ').slice(1).join(' ') || "",
            email: userData.email || "",
            phone: userData.phone_number || "",
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

   const availableServices = [
    "General Check-up",
    "Teeth Cleaning",
    "Teeth Whitening",
    "Root Canal",
    "Dental Fillings",
    "Dental Crowns",
    "Dental Bridges",
    "Dental Implants",
    "Dentures",
    "Orthodontics",
    "Periodontal Treatment",
    "Endodontics",
    "Oral Surgery",
    "Pediatric Dentistry",
    "Cosmetic Dentistry",
    "Emergency Dental Care"
  ];

  const updateForm = (key: string, value: string | string[] | object) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
     if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error("Please fill in all required personal information");
        return;
      }

      // Format the name field as required by the backend
      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();
      
      // Create the data object with fields the backend expects
      const dentistData = {
        name: fullName,
        email: formData.email,
        phone_number: formData.phone,
        role: 'dentist',
        
        // Professional details
        dentist_details: {
          specialties: formData.specialties,
          experience: parseInt(formData.experience) || 0,
          education: formData.education,
          certifications: formData.certifications,
          license_number: formData.licenseNumber,
          practice_name: formData.practiceName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          office_phone: formData.officePhone,
          business_hours: formData.businessHours,
          accepted_insurance: formData.acceptedInsurance.split(',').map(item => item.trim()),
          bio: formData.bio,
          services: formData.services,
          languages: formData.languages.split(',').map(item => item.trim()),
          application_status: "pending"
        }
      };
      
      let response;
      
      // Check if we're already logged in
      if (isAuthenticated && user) {
        // Update existing user with dentist details
        
        // Format the data properly for the backend API endpoint
        // The backend expects the ID as a direct parameter, not in the request body
        // So we pass it directly in the URL path
        response = await api.put(`/users/update-to-dentist?userId=${user._id || user.id}`, dentistData);
        
        toast.success("Dentist application submitted successfully! Our team will review your details.");
      } else {
        // Register as a new dentist
        response = await api.post('/auth/register', dentistData);
        
        // Store token if returned by API
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        
        // Store user data if returned
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        
        toast.success("Registration successful! Your application will be reviewed shortly.");
      }
      
      // Redirect after a slight delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      
    } catch (error: any) {
      // Enhanced error handling
      console.error("Application submission error:", error);
      
      // Handle specific status codes
      if (error.response?.status === 409) {
        toast.error("This email is already registered. Please log in first, then complete your dentist profile.");
      } else {
        // Extract more specific error message if available
        const errorMessage = 
          error.response?.data?.message || 
          error.response?.data?.error || 
          "Failed to submit application. Please check your information and try again.";
        
        toast.error(errorMessage);
      }
    }
  };

  const addService = (service: { name: string; price: number }) => {
    if (service && !formData.services.some(s => s.name === service.name)) {
      updateForm("services", [...formData.services, service]);
    }
    setInputService("");
  };

  const removeService = (serviceName: string) => {
    updateForm("services", formData.services.filter(s => s.name !== serviceName));
  };

  const handleServiceSelect = (value: string) => {
    if (value === "custom") {
      setInputService("custom");
    } else {
      addService({ name: value, price: 0 });
    }
  };

  const updateBusinessHours = (day: string, key: string, value: string | boolean) => {
    // If updating time values, ensure proper formatting
    if (key === "open" || key === "close") {
      // Format time values from 24h "HH:MM" format to "h:MM AM/PM" format
      if (typeof value === 'string' && value) {
        const [hours, minutes] = value.split(':');
        const hour = parseInt(hours, 10);
        const isPM = hour >= 12;
        const formattedHour = hour % 12 || 12;
        const formattedTime = `${formattedHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
        
        setFormData((prev) => ({
          ...prev,
          businessHours: {
            ...prev.businessHours,
            [day]: {
              ...prev.businessHours[day],
              [key]: formattedTime,
            },
          },
        }));
        return;
      }
    }
    
    // For boolean values or if we couldn't format the time
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [key]: value,
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-dentist-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Dentist Registration | Dental Smile</title>
        <meta name="description" content="Join our network of dental professionals and grow your practice." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Join Our Dental Network</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Register your practice and start accepting online appointments</p>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-dentist-500 to-dentist-600 -translate-y-1/2 transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
              <div className="relative flex justify-between">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`flex flex-col items-center ${
                      stepNumber <= step ? "text-dentist-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-2 shadow transition-all
                        ${
                          stepNumber === step
                            ? "bg-white border-2 border-dentist-600 text-dentist-600"
                            : stepNumber < step
                            ? "bg-gradient-to-r from-dentist-500 to-dentist-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                    >
                      {stepNumber < step ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {stepNumber === 1 && "Personal"}
                      {stepNumber === 2 && "Professional"}
                      {stepNumber === 3 && "Practice"}
                      {stepNumber === 4 && "Additional"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-dentist-500 to-dentist-600 text-white">
              <h2 className="text-2xl font-semibold">
                {step === 1 && "Personal Information"}
                {step === 2 && "Professional Information"}
                {step === 3 && "Practice Information"}
                {step === 4 && "Additional Information"}
              </h2>
              <p className="mt-1 opacity-90">
                {step === 1 && "Tell us who you are"}
                {step === 2 && "Tell us about your qualifications"}
                {step === 3 && "Tell us about your practice"}
                {step === 4 && "Almost done! Just a few more details"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="p-8">
                  {isAuthenticated && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-green-800 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">You're signed in as {user.name}</span>
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        We've pre-filled some of your information. Please review and complete the rest of the form.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateForm("firstName", e.target.value)}
                          placeholder="John"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="middleName" className="text-sm font-medium text-gray-700">Middle Name (optional)</Label>
                        <Input
                          id="middleName"
                          value={formData.middleName}
                          onChange={(e) => updateForm("middleName", e.target.value)}
                          placeholder="Middle name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateForm("lastName", e.target.value)}
                          placeholder="Doe"
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="john@example.com"
                          className="pl-10"
                          required
                          readOnly={isAuthenticated}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          placeholder="(123) 456-7890"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="bg-dentist-50 p-4 rounded-lg border border-dentist-100 mt-6">
                      <h3 className="text-sm font-medium text-dentist-800 flex items-center mb-2">
                        <Shield className="h-4 w-4 mr-2" />
                        Privacy Notice
                      </h3>
                      <p className="text-sm text-dentist-700">
                        Your information is secured using industry-standard encryption. We will never share your data without permission.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Professional Information */}
              {step === 2 && (
                <div className="p-8">                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="education" className="text-sm font-medium text-gray-700">Education *</Label>
                      <div className="relative mt-1">
                        <GraduationCap className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <Textarea
                          id="education"
                          value={formData.education}
                          onChange={(e) => updateForm("education", e.target.value)}
                          placeholder="e.g. Doctor of Dental Surgery (DDS), Boston University, 2015"
                          className="pl-10 min-h-[100px] resize-y"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        List your degrees, schools, and graduation years
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="certifications" className="text-sm font-medium text-gray-700">Certifications *</Label>
                      <div className="relative mt-1">
                        <FileCheck className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <Textarea
                          id="certifications"
                          value={formData.certifications}
                          onChange={(e) => updateForm("certifications", e.target.value)}
                          placeholder="e.g. Board Certified, American Board of Periodontology"
                          className="pl-10 min-h-[100px] resize-y"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">License Number *</Label>
                      <div className="relative mt-1">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={(e) => updateForm("licenseNumber", e.target.value)}
                          placeholder="Your dental license number"
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Your dental license will be verified before your profile goes live
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Years of Experience *</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.experience}
                        onChange={(e) => updateForm("experience", e.target.value)}
                        placeholder="Number of years in practice"
                        min="0"
                        required
                        className="mt-1 w-full md:w-1/3"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">Specialties</Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {["General Dentistry", "Orthodontics", "Periodontics", "Endodontics", "Oral Surgery", "Pediatric Dentistry", "Prosthodontics", "Cosmetic Dentistry"].map((specialty) => (
                          <div key={specialty} className="flex items-center space-x-2">
                            <Checkbox 
                              id={specialty.replace(/\s+/g, '-').toLowerCase()}
                              checked={formData.specialties.includes(specialty)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateForm("specialties", [...formData.specialties, specialty]);
                                } else {
                                  updateForm("specialties", formData.specialties.filter(s => s !== specialty));
                                }
                              }}
                            />
                            <Label 
                              htmlFor={specialty.replace(/\s+/g, '-').toLowerCase()}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {specialty}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Practice Information */}
              {step === 3 && (
                <div className="p-8">                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="practiceName" className="text-sm font-medium text-gray-700">Practice Name *</Label>
                      <Input
                        id="practiceName"
                        value={formData.practiceName}
                        onChange={(e) => updateForm("practiceName", e.target.value)}
                        placeholder="Your practice name"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => updateForm("address", e.target.value)}
                        placeholder="123 Dental Street"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => updateForm("city", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => updateForm("state", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => updateForm("zipCode", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="officePhone" className="text-sm font-medium text-gray-700">Office Phone *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="officePhone"
                          value={formData.officePhone}
                          onChange={(e) => updateForm("officePhone", e.target.value)}
                          placeholder="(123) 456-7890"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Business Hours *</Label>
                      <div className="mt-2 space-y-4">
                        {Object.keys(formData.businessHours).map((day) => (
                          <div key={day} className="flex items-center space-x-4">
                            <Label className="text-sm font-medium text-gray-700 w-20">{day.charAt(0).toUpperCase() + day.slice(1)}</Label>
                            <Checkbox
                              checked={formData.businessHours[day].isOpen}
                              onCheckedChange={(checked) => updateBusinessHours(day, "isOpen", checked)}
                            />
                            <Input
                              type="time"
                              value={formData.businessHours[day].open}
                              onChange={(e) => updateBusinessHours(day, "open", e.target.value)}
                              disabled={!formData.businessHours[day].isOpen}
                              className="w-24"
                            />
                            <span>-</span>
                            <Input
                              type="time"
                              value={formData.businessHours[day].close}
                              onChange={(e) => updateBusinessHours(day, "close", e.target.value)}
                              disabled={!formData.businessHours[day].isOpen}
                              className="w-24"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Your practice location will be displayed on our interactive map for patients to find you easily.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 4: Additional Information */}
              {step === 4 && (
                <div className="p-8">                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Professional Bio *</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => updateForm("bio", e.target.value)}
                        placeholder="Tell us about yourself, your approach to dental care, and what makes your practice unique."
                        className="mt-1 min-h-[150px] resize-y"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        This will be displayed on your public profile (minimum 100 characters)
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Services Offered *</Label>
                      <div className="mt-2">
                        <Select onValueChange={handleServiceSelect}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a service to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableServices
                              .filter(service => !formData.services.some(s => s.name === service))
                              .map(service => (
                                <SelectItem key={service} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            <SelectItem value="custom">Add Custom Service</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Custom service input */}
                        {inputService === "custom" && (
                          <div className="mt-2 flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <Input
                                value={inputService}
                                onChange={(e) => setInputService(e.target.value)}
                                placeholder="Enter custom service name"
                                className="flex-1"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                id="servicePrice"
                                name="servicePrice"
                                placeholder="Price ($)"
                                className="w-32"
                                onChange={(e) => {
                                  const price = parseFloat(e.target.value);
                                  // Store price temporarily in a data attribute
                                  e.target.dataset.price = isNaN(price) ? "0" : price.toString();
                                }}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  const priceInput = document.getElementById("servicePrice") as HTMLInputElement;
                                  const price = parseFloat(priceInput?.dataset.price || "0");
                                  addService({ name: inputService, price });
                                }}
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Display selected services */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.services.map((service) => (
                          <Badge 
                            key={service.name} 
                            variant="secondary"
                            className="pl-3 pr-2 py-1 flex items-center gap-1 bg-dentist-50 text-dentist-700 hover:bg-dentist-100"
                          >
                            {service.name} (${service.price})
                            <button 
                              type="button"
                              onClick={() => removeService(service.name)}
                              className="ml-1 rounded-full hover:bg-dentist-200 p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {formData.services.length === 0 && (
                          <p className="text-sm text-gray-500 italic">No services selected</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="languages" className="text-sm font-medium text-gray-700">Languages Spoken *</Label>
                      <Input
                        id="languages"
                        value={formData.languages}
                        onChange={(e) => updateForm("languages", e.target.value)}
                        placeholder="English, Spanish, etc."
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="acceptedInsurance" className="text-sm font-medium text-gray-700">Accepted Insurance *</Label>
                      <Textarea
                        id="acceptedInsurance"
                        value={formData.acceptedInsurance}
                        onChange={(e) => updateForm("acceptedInsurance", e.target.value)}
                        placeholder="List the insurance providers you accept"
                        className="mt-1 min-h-[100px] resize-y"
                        required
                      />
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h3 className="font-medium text-green-800 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        You're almost there!
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        After submission, our team will review your information and contact you within 1-2 business days to complete the verification process.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="px-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                {step < 4 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="px-6 bg-gradient-to-r from-dentist-500 to-dentist-600 hover:from-dentist-600 hover:to-dentist-700"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="px-6 bg-gradient-to-r from-dentist-500 to-dentist-600 hover:from-dentist-600 hover:to-dentist-700"
                  >
                    Complete Registration
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
      
    </div>
  );
};

const Info = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

export default DentistSignup;
