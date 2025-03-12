import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { mockDentists } from "@/data/mockDentists";
import { mockReviews } from "@/data/mockReviews";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Briefcase
} from "lucide-react";

const DentistProfile = () => {
  const { name } = useParams<{ name: string }>();
  
  const dentist = mockDentists.find((d) => {
    const dentistFullName = `${d.firstName}-${d.lastName}`.toLowerCase();
    return dentistFullName === name?.toLowerCase();
  });
  
  const dentistId = dentist?.id || 0;
  const dentistReviews = mockReviews.filter((r) => r.dentistId === dentistId);
  
  const [activeTab, setActiveTab] = useState("overview");

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
        <Footer />
      </div>
    );
  }

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
                    <span className="font-semibold mr-2">{dentist.rating}</span>
                    <span className="text-gray-500">({dentist.reviewCount} reviews)</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">{dentist.address}</p>
                        <p className="text-gray-900">{dentist.city}, {dentist.state} {dentist.zipCode}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <p className="text-gray-900">{dentist.phoneNumber}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <p className="text-gray-900">{dentist.email}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <p className="text-gray-900">{dentist.availability}</p>
                    </div>
                    
                    <div className="flex items-center">
                      {dentist.acceptingNewPatients ? (
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
                      <Link to={`/book/${dentistId}`}>Book Appointment</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Dr. {dentist.firstName} {dentist.lastName}
              </h1>
              <p className="text-xl text-dentist-600 font-medium mb-6">{dentist.specialty}</p>
              
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
                    <p className="mb-6 text-gray-700">{dentist.bio}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <div className="mr-4 h-10 w-10 bg-dentist-100 rounded-full flex items-center justify-center text-dentist-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Experience</h3>
                          <p className="text-gray-700">{dentist.experience} years</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                        <div className="mr-4 h-10 w-10 bg-dentist-100 rounded-full flex items-center justify-center text-dentist-600">
                          <Languages className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Languages</h3>
                          <p className="text-gray-700">{dentist.languages.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-4">Insurance Accepted</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                      {dentist.insuranceAccepted.map((insurance) => (
                        <div key={insurance} className="flex items-center">
                          <Shield className="h-4 w-4 text-dentist-500 mr-2" />
                          <span className="text-gray-700">{insurance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="education">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Education</h2>
                    <ul className="space-y-4 mb-6">
                      {dentist.education.map((edu, index) => (
                        <li key={index} className="flex">
                          <div className="mr-3 h-6 w-6 bg-dentist-100 rounded-full flex items-center justify-center text-dentist-600 flex-shrink-0 mt-0.5">
                            <span className="text-sm">{index + 1}</span>
                          </div>
                          <span className="text-gray-700">{edu}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                    <ul className="space-y-4 mb-6">
                      {dentist.certifications.map((cert, index) => (
                        <li key={index} className="flex">
                          <Award className="h-5 w-5 text-dentist-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{cert}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <Briefcase className="h-6 w-6 text-dentist-600 mr-3" />
                        <h3 className="text-lg font-semibold">Professional Experience</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Dr. {dentist.lastName} has {dentist.experience} years of experience in {dentist.specialty}.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="services">
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {dentist.services.map((service) => (
                        <div key={service} className="flex items-start bg-gray-50 p-4 rounded-lg">
                          <Stethoscope className="h-5 w-5 text-dentist-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="flex items-center mr-4">
                        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-2xl font-bold">{dentist.rating}</span>
                      </div>
                      <span className="text-gray-500">
                        Based on {dentist.reviewCount} reviews
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {dentistReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DentistProfile;
