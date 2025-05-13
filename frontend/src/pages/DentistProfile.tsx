import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { mockDentists } from "@/data/mockDentists";
import { mockReviews } from "@/data/mockReviews";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { dentistAPI, reviewAPI } from "@/services/api";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Shield,
  Globe,
  Award,
  Stethoscope,
  Languages,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// Function to format user data into dentist format
const formatUserDataToDentist = (userData: any) => {
  if (!userData) return null;
  
  // Handle different data formats (dentist application vs. approved dentist)
  const details = userData.dentist_details || {};
  const applicationStatus = details.application_status || userData.applicationStatus;
  
  return {
    id: userData._id || userData.id,
    firstName: userData.name?.split(' ')[0] || userData.firstName || '',
    lastName: userData.name?.split(' ').slice(1).join(' ') || userData.lastName || '',
    email: userData.email || '',
    specialty: Array.isArray(details.specialties) 
      ? details.specialties[0] 
      : details.specialties || userData.specialties || 'General Dentistry',
    image: userData.profile_picture || userData.image || '/placeholder.svg',
    phoneNumber: details.office_phone || userData.phone_number || userData.officePhone || '',
    address: details.address || userData.address || '',
    city: details.city || userData.city || '',
    state: details.state || userData.state || '',
    zipCode: details.zip_code || userData.zipCode || '',
    bio: details.bio || userData.bio || '',
    education: Array.isArray(details.education) 
      ? details.education 
      : typeof details.education === 'string'
        ? details.education.split('\n') 
        : typeof userData.education === 'string'
          ? userData.education.split('\n')
          : Array.isArray(userData.education) 
            ? userData.education 
            : [],
    certifications: Array.isArray(details.certifications) 
      ? details.certifications 
      : typeof details.certifications === 'string'
        ? details.certifications.split('\n')
        : typeof userData.certifications === 'string'
          ? userData.certifications.split('\n')
          : Array.isArray(userData.certifications)
            ? userData.certifications
            : [],
    services: Array.isArray(details.services) 
      ? details.services 
      : Array.isArray(userData.services)
        ? userData.services
        : [],
    languages: Array.isArray(details.languages) 
      ? details.languages 
      : typeof details.languages === 'string'
        ? details.languages.split(',').map(l => l.trim())
        : typeof userData.languages === 'string'
          ? userData.languages.split(',').map(l => l.trim())
          : Array.isArray(userData.languages)
            ? userData.languages
            : [],
    experience: details.experience || userData.experience || 0,
    rating: userData.rating || 0,
    reviewCount: userData.reviewCount || 0,
    availability: details.business_hours || userData.businessHours || userData.availability || '',
    acceptingNewPatients: userData.acceptingNewPatients !== false,
    insuranceAccepted: Array.isArray(details.accepted_insurance)
      ? details.accepted_insurance
      : typeof details.accepted_insurance === 'string'
        ? details.accepted_insurance.split(',').map(i => i.trim())
        : Array.isArray(userData.insuranceAccepted)
          ? userData.insuranceAccepted
          : [],
    applicationStatus: applicationStatus || 'approved'
  };
};

// Format business hours from object format if needed
const formatAvailability = (availabilityData) => {
  // Check if availability is a string or object
  if (typeof availabilityData === 'string') {
    return availabilityData;
  }
  
  // If it's an object (new format), format it as a readable string
  if (availabilityData && typeof availabilityData === 'object') {
    try {
      const businessHours = availabilityData;
      const daysOpen = [];
      
      // Loop through each day
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayAbbreviations = {
        'sunday': 'Sun',
        'monday': 'Mon',
        'tuesday': 'Tue',
        'wednesday': 'Wed',
        'thursday': 'Thu',
        'friday': 'Fri',
        'saturday': 'Sat',
      };
      
      // Group consecutive days with same hours
      let currentGroup = null;
      let lastDay = null;
      
      days.forEach(day => {
        const dayData = businessHours[day];
        
        if (!dayData || !dayData.isOpen) return;
        
        const hours = `${dayData.open}-${dayData.close}`;
        
        if (!currentGroup) {
          // Start new group
          currentGroup = { days: [day], hours };
        } else if (currentGroup.hours === hours && lastDay && days.indexOf(lastDay) === days.indexOf(day) - 1) {
          // Add to current group if hours match and days are consecutive
          currentGroup.days.push(day);
        } else {
          // If not consecutive or hours differ, finish group and start new one
          daysOpen.push(formatGroup(currentGroup, dayAbbreviations));
          currentGroup = { days: [day], hours };
        }
        
        lastDay = day;
      });
      
      // Add the last group
      if (currentGroup) {
        daysOpen.push(formatGroup(currentGroup, dayAbbreviations));
      }
      
      return daysOpen.length ? daysOpen.join(', ') : 'Hours not specified';
    } catch (error) {
      console.error('Error formatting availability:', error);
      return 'Hours not specified';
    }
  }
  
  return 'Hours not specified';
};

// Helper function to format a group of days
const formatGroup = (group, abbreviations) => {
  if (group.days.length === 1) {
    return `${abbreviations[group.days[0]]}, ${formatTimeRange(group.hours)}`;
  }
  
  const firstDay = abbreviations[group.days[0]];
  const lastDay = abbreviations[group.days[group.days.length - 1]];
  return `${firstDay} to ${lastDay}, ${formatTimeRange(group.hours)}`;
};

// Helper function to format time range in a nice format
const formatTimeRange = (timeRange) => {
  const [start, end] = timeRange.split('-');
  
  // Handle case where hours might be in 24h format
  if (start && end) {
    try {
      const formatTime = (time) => {
        // Convert 24h format to 12h with proper formatting
        if (time.includes(':')) {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours, 10);
          if (hour < 12) {
            return hour === 0 ? `12${minutes === '00' ? '' : `:${minutes}`} AM` : `${hour}${minutes === '00' ? '' : `:${minutes}`} AM`;
          } else {
            return hour === 12 ? `12${minutes === '00' ? '' : `:${minutes}`} PM` : `${hour - 12}${minutes === '00' ? '' : `:${minutes}`} PM`;
          }
        }
        return time;
      };
      
      return `${formatTime(start)} - ${formatTime(end)}`;
    } catch (e) {
      return timeRange;
    }
  }
  
  return timeRange;
};

const DentistProfile = () => {
  const { id, name } = useParams<{ id?: string; name?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [dentist, setDentist] = useState<any>(null);
  const [dentistReviews, setDentistReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [newReview, setNewReview] = useState({ rating: 0, procedure: "", comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDentistData = async () => {
      setIsLoading(true);
      try {
        let dentistData;
        // First check if we have an ID, which is preferred
        if (id) {
          try {
            const response = await dentistAPI.getDentistById(id);
            if (response.data) {
              dentistData = formatUserDataToDentist(response.data);
            }
          } catch (error) {
            console.error("Failed to fetch dentist by ID:", error);
          }
        } 
        
        // If no ID or the ID request failed, try by name
        if (!dentistData && name) {
          try {
            // Try to fetch all dentists and find by name
            const response = await dentistAPI.getAllDentists();
            if (response.data?.data && Array.isArray(response.data.data)) {
              const matchingDentist = response.data.data.find((d: any) => {
                const dentistFullName = `${d.firstName}-${d.lastName}`.toLowerCase();
                return dentistFullName === name.toLowerCase();
              });
              if (matchingDentist) {
                dentistData = formatUserDataToDentist(matchingDentist);
              }
            }
          } catch (error) {
            console.error("Failed to fetch dentist by name:", error);
          }
        }

        // If both methods failed, fall back to mock data (for development only)
        if (!dentistData && name) {
          const mockDentist = mockDentists.find((d) => {
            const dentistFullName = `${d.firstName}-${d.lastName}`.toLowerCase();
            return dentistFullName === name.toLowerCase();
          });
          if (mockDentist) {
            dentistData = formatUserDataToDentist(mockDentist);
          }
        }

        if (dentistData) {
          setDentist(dentistData);
          
          // Try to fetch reviews for this dentist
          try {
            if (dentistData.id) {
              try {
                console.log(`Attempting to fetch reviews for dentist ID: ${dentistData.id}`);
                // First try to get reviews from the API
                const reviewsResponse = await reviewAPI.getDentistReviews(dentistData.id);
                setDentistReviews(reviewsResponse.data || []);
                console.log("Reviews loaded successfully:", reviewsResponse.data);
              } catch (error) {
                console.error("Failed to load reviews from API, using mock data:", error);
                // If API fails, fall back to mock data
                const mockDentistId = parseInt(dentistData.id, 10) || 1;
                console.log(`Falling back to mock reviews for dentist ID: ${mockDentistId}`);
                const mockFilteredReviews = mockReviews.filter(r => r.dentistId === mockDentistId);
                if (mockFilteredReviews.length === 0) {
                  const firstDentistId = mockDentists[0].id;
                  const firstDentistReviews = mockReviews.filter(r => r.dentistId === firstDentistId);
                  setDentistReviews(firstDentistReviews);
                  console.log(`Using mock reviews for first dentist (ID: ${firstDentistId})`);
                } else {
                  setDentistReviews(mockFilteredReviews);
                  console.log(`Using ${mockFilteredReviews.length} mock reviews for dentist ID: ${mockDentistId}`);
                }
              }
            }
          } catch (error) {
            console.error("Critical error loading reviews:", error);
            toast.error("Failed to load reviews. Using sample data instead.");
            // Last resort, use mock data
            const firstMockDentist = mockDentists[0];
            const mockFilteredReviews = mockReviews.filter(r => r.dentistId === firstMockDentist.id);
            setDentistReviews(mockFilteredReviews);
          }
        }
      } catch (error) {
        console.error("Failed to load dentist:", error);
        toast.error("Failed to load dentist information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDentistData();
  }, [id, name]);

  const submitReview = async () => {
    setIsSubmittingReview(true);
    try {
      // Attempt to submit the review to the API
      let reviewData;
      try {
        const response = await reviewAPI.submitReview(dentist.id, newReview);
        if (response.data) {
          reviewData = response.data;
        }
      } catch (error) {
        console.error("Failed to submit review to API, using mock data:", error);
        // If API fails, create a mock review response
        reviewData = {
          id: Date.now(),
          dentistId: parseInt(dentist.id, 10) || 1,
          patientId: 999,
          patientName: "Current User",
          rating: newReview.rating,
          comment: newReview.comment,
          date: new Date().toISOString().split('T')[0],
          procedure: newReview.procedure
        };
        // Show a toast indicating we're using sample mode
        toast.warning("Using demo mode. Your review was saved locally.");
      }
      
      // Add the review to the UI regardless of API success
      setDentistReviews((prevReviews) => [reviewData, ...prevReviews]);
      setNewReview({ rating: 0, procedure: "", comment: "" });
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Critical error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-dentist-600 animate-spin" />
            <p className="text-dentist-600 font-medium">Loading dentist details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dentist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Dentist Not Found</h2>
            <p className="mb-6">The dentist you're looking for doesn't exist or may have been removed.</p>
            <Link to="/dentists">
              <Button>Browse All Dentists</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ensure arrays are properly initialized even if some properties are missing
  const languages = Array.isArray(dentist.languages) ? dentist.languages : [];
  const insuranceAccepted = Array.isArray(dentist.insuranceAccepted) ? dentist.insuranceAccepted : [];
  const education = Array.isArray(dentist.education) ? dentist.education : [];
  const certifications = Array.isArray(dentist.certifications) ? dentist.certifications : [];
  const services = Array.isArray(dentist.services) ? dentist.services : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-8 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <img
                    src={dentist.image || "/placeholder.svg"}
                    alt={`Dr. ${dentist.firstName} ${dentist.lastName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-semibold mr-2">{dentist.rating || 0}</span>
                    <span className="text-gray-500">({dentist.reviewCount || 0} reviews)</span>
                  </div>
                  
                  {/* Display pending application status if applicable */}
                  {dentist.applicationStatus === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
                      <div className="flex items-center text-yellow-800">
                        <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Application Under Review</p>
                          <p className="text-sm">Your dentist application is currently being reviewed by our team. Some profile information may be limited until approval.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">{dentist.address || 'No address provided'}</p>
                        <p className="text-gray-900">{dentist.city && dentist.state ? `${dentist.city}, ${dentist.state} ${dentist.zipCode || ''}` : 'Location not available'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <p className="text-gray-900">{dentist.phoneNumber || 'No phone provided'}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <p className="text-gray-900">{dentist.email || 'No email provided'}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <p className="text-gray-900">{formatAvailability(dentist.availability)}</p>
                    </div>
                    
                    <div className="flex items-center">
                      {dentist.acceptingNewPatients !== false ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-dentist-600 mr-3 flex-shrink-0" />
                          <p className="text-dentist-600 font-medium">Accepting New Patients</p>
                        </>
                      ) : (
                        <>
                          <div className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0">✕</div>
                          <p className="text-gray-500">Not Accepting New Patients</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button className="w-full" asChild>
                      <Link to={`/book/${dentist.id}`}>Book Appointment</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Dr. {dentist.firstName} {dentist.lastName}
              </h1>
              <p className="text-xl text-dentist-600 font-medium mb-6">{dentist.specialty || 'General Dentistry'}</p>
              
              <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="education">Education & Experience</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">About Dr. {dentist.lastName}</h2>
                    <p className="mb-6 text-gray-700">{dentist.bio || 'No bio provided.'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <div className="mr-4 h-10 w-10 bg-dentist-100 rounded-full flex items-center justify-center text-dentist-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Experience</h3>
                          <p className="text-gray-700">{dentist.experience || 0} years</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <div className="mr-4 h-10 w-10 bg-dentist-100 rounded-full flex items-center justify-center text-dentist-600">
                          <Languages className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Languages</h3>
                          <p className="text-gray-700">{languages.length > 0 ? languages.join(", ") : 'English'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-4">Insurance Accepted</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {insuranceAccepted.length > 0 ? (
                        insuranceAccepted.map((insurance) => (
                          <div key={insurance} className="flex items-center">
                            <Shield className="h-4 w-4 text-dentist-500 mr-2" />
                            <span className="text-gray-700">{insurance}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">Insurance information not available</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="education">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Education</h2>
                    {education.length > 0 ? (
                      <ul className="space-y-4 mb-6">
                        {education.map((edu, index) => (
                          <li key={index} className="flex">
                            <div className="mr-3 h-6 w-6 bg-dentist-100 rounded-full flex items-center justify-center text-dentist-600 flex-shrink-0 mt-0.5">
                              <span className="text-sm">{index + 1}</span>
                            </div>
                            <span className="text-gray-700">{edu}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-6 text-gray-500">Education information not available</p>
                    )}
                    
                    <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                    {certifications.length > 0 ? (
                      <ul className="space-y-4 mb-6">
                        {certifications.map((cert, index) => (
                          <li key={index} className="flex">
                            <Award className="h-5 w-5 text-dentist-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{cert}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-6 text-gray-500">Certification information not available</p>
                    )}
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Briefcase className="h-6 w-6 text-dentist-600 mr-3" />
                        <h3 className="text-lg font-semibold">Professional Experience</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Dr. {dentist.lastName} has {dentist.experience || 'several'} years of experience in {dentist.specialty || 'dentistry'}.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="services">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                    {services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {services.map((service) => {
                          // Check if service is a string or an object with name and price
                          const serviceName = typeof service === 'string' ? service : service.name;
                          const servicePrice = typeof service === 'string' ? null : service.price;
                          
                          return (
                            <div key={serviceName} className="flex items-start bg-gray-50 p-4 rounded-lg justify-between">
                              <div className="flex items-start">
                                <Stethoscope className="h-5 w-5 text-dentist-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{serviceName}</span>
                              </div>
                              {servicePrice !== null && (
                                <span className="font-medium text-dentist-600">${servicePrice}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500">Services information not available</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="flex items-center mr-4">
                        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-2xl font-bold">{dentist.rating || '0'}</span>
                      </div>
                      <span className="text-gray-500">
                        Based on {dentist.reviewCount || '0'} reviews
                      </span>
                    </div>

                    {/* Review submission form */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-8">
                      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</Label>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-7 w-7 ${
                                    star <= newReview.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="procedure" className="block text-sm font-medium text-gray-700 mb-1">Procedure</Label>
                          <Select
                            value={newReview.procedure}
                            onValueChange={(value) => setNewReview({ ...newReview, procedure: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select the procedure you received" />
                            </SelectTrigger>
                            <SelectContent>
                              {services && services.length > 0 ? (
                                services.map((service) => {
                                  const serviceName = typeof service === 'string' ? service : service.name;
                                  if (!serviceName) return null;
                                  
                                  return (
                                    <SelectItem key={serviceName} value={serviceName}>
                                      {serviceName}
                                    </SelectItem>
                                  );
                                })
                              ) : (
                                <SelectItem value="General Check-up">General Check-up</SelectItem>
                              )}
                              <SelectItem value="Dental Cleaning">Dental Cleaning</SelectItem>
                              <SelectItem value="Consultation">Consultation</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {newReview.procedure === "Other" && (
                            <Input
                              className="mt-2"
                              placeholder="Please specify the procedure"
                              onChange={(e) => setNewReview({ ...newReview, procedure: e.target.value })}
                            />
                          )}
                        </div>
                        <div>
                          <Label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</Label>
                          <Textarea
                            id="comment"
                            placeholder="Share your experience with this dentist..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="min-h-[120px]"
                          />
                        </div>
                        <Button 
                          type="button"
                          onClick={submitReview}
                          disabled={!newReview.rating || !newReview.comment || isSubmittingReview}
                          className="w-full md:w-auto"
                        >
                          {isSubmittingReview ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Review"
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {dentistReviews.length > 0 ? (
                        dentistReviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))
                      ) : (
                        <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DentistProfile;
