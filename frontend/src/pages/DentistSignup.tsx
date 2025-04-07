import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
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

const DentistSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    
    // Professional Information
    specialties: [] as string[],
    experience: "",
    education: "",
    certifications: "",
    licenseNumber: "",
    
    // Practice Information
    practiceName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    officePhone: "",
    businessHours: "",
    acceptedInsurance: "",
    
    // Additional Information
    bio: "",
    services: [] as string[],
    languages: "",
  });

  const [inputService, setInputService] = useState("");

  // Available dental services for the dropdown
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

  const updateForm = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally validate and submit to your backend
    console.log("Form submitted:", formData);
    toast.success("Registration submitted successfully!");
  };

  const addService = (service: string) => {
    if (service && !formData.services.includes(service)) {
      updateForm("services", [...formData.services, service]);
    }
    setInputService("");
  };

  const removeService = (service: string) => {
    updateForm("services", formData.services.filter(s => s !== service));
  };

  const handleServiceSelect = (value: string) => {
    addService(value);
  };

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
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => updateForm("password", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Password must be at least 8 characters with letters and numbers.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => updateForm("confirmPassword", e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
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
                      <Label htmlFor="businessHours" className="text-sm font-medium text-gray-700">Business Hours *</Label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <Textarea
                          id="businessHours"
                          value={formData.businessHours}
                          onChange={(e) => updateForm("businessHours", e.target.value)}
                          placeholder="Monday - Friday: 9 AM - 5 PM&#10;Saturday: 10 AM - 2 PM&#10;Sunday: Closed"
                          className="pl-10"
                          required
                        />
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
                              .filter(service => !formData.services.includes(service))
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
                          <div className="mt-2 flex items-center space-x-2">
                            <Input
                              value={inputService}
                              onChange={(e) => setInputService(e.target.value)}
                              placeholder="Enter custom service name"
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => addService(inputService)}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Display selected services */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.services.map((service) => (
                          <Badge 
                            key={service} 
                            variant="secondary"
                            className="pl-3 pr-2 py-1 flex items-center gap-1 bg-dentist-50 text-dentist-700 hover:bg-dentist-100"
                          >
                            {service}
                            <button 
                              type="button"
                              onClick={() => removeService(service)}
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
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/dentist-login" className="text-dentist-600 hover:text-dentist-700 font-medium">
              Sign in here
            </Link>
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
