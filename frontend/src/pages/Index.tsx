import { Link } from "react-router-dom";
import { Search, Calendar, Star, CheckCircle, Shield, Clock } from "lucide-react";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import DentistCard from "@/components/DentistCard";
import FeatureCard from "@/components/FeatureCard";
import { mockDentists } from "@/data/mockDentists";
import { Button } from "@/components/ui/button";

const Index = () => {
  // Get top-rated dentists for the featured section
  const topDentists = [...mockDentists]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-16 hero-pattern">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find the Perfect Dentist for Your Smile
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Book appointments with top dentists in your area, read patient reviews, and get the dental care you deserve.
            </p>
            
            <SearchBar />
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-dentist-600 mr-2" />
                <span className="text-gray-700">Verified Professionals</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-dentist-600 mr-2" />
                <span className="text-gray-700">Easy Scheduling</span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-dentist-600 mr-2" />
                <span className="text-gray-700">Patient Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Dentists */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Dentists</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our top-rated dental professionals with exceptional patient reviews and years of experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topDentists.map((dentist) => (
              <DentistCard key={dentist.id} dentist={dentist} />
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild>
              <Link to="/dentists">View All Dentists</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Book your dental appointment in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines (visible on md screens and up) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-dentist-100 via-dentist-300 to-dentist-100 -z-10"></div>
            
            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 relative transition-transform hover:shadow-md hover:-translate-y-1">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-dentist-500 to-dentist-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Search className="h-8 w-8 text-white" />
              </div>
              <div className="text-center pt-8">
                <div className="text-xl font-semibold mb-2 text-dentist-700 mt-2">Step 1: Find a Dentist</div>
                <p className="text-gray-600">
                  Search for dentists by location, specialty, or read reviews to find the perfect match for your needs.
                </p>
                <ul className="mt-4 space-y-2 text-left">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Search by location or specialty</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Read verified patient reviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">View available time slots</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 relative transition-transform hover:shadow-md hover:-translate-y-1 md:mt-12">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-dentist-500 to-dentist-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="text-center pt-8">
                <div className="text-xl font-semibold mb-2 text-dentist-700 mt-2">Step 2: Book an Appointment</div>
                <p className="text-gray-600">
                  Select a convenient date and time that works perfectly with your schedule.
                </p>
                <ul className="mt-4 space-y-2 text-left">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Online booking 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Instant confirmation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Free cancellation & rescheduling</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 relative transition-transform hover:shadow-md hover:-translate-y-1">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-dentist-500 to-dentist-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="text-center pt-8">
                <div className="text-xl font-semibold mb-2 text-dentist-700 mt-2">Step 3: Get Dental Care</div>
                <p className="text-gray-600">
                  Visit your dentist and receive quality care tailored to your dental needs.
                </p>
                <ul className="mt-4 space-y-2 text-left">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Receive appointment reminders</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Quality care from verified professionals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-dentist-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Share your experience with a review</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-dentist-500 to-dentist-600 hover:from-dentist-600 hover:to-dentist-700">
              <Link to="/dentists">Find a Dentist Now</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose DentalSmile</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to making dental care accessible and stress-free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Star}
              title="Verified Professionals"
              description="All dentists on our platform are licensed professionals with verified credentials and experience."
            />
            <FeatureCard
              icon={Shield}
              title="Secure Booking"
              description="Your personal information and appointment details are always protected and secure."
            />
            <FeatureCard
              icon={Clock}
              title="24/7 Booking"
              description="Book appointments anytime, day or night, from the comfort of your home."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Appointment Reminders"
              description="Never miss an appointment with automated email and text reminders."
            />
            <FeatureCard
              icon={Calendar}
              title="Easy Rescheduling"
              description="Need to change your appointment? Reschedule with just a few clicks."
            />
            <FeatureCard
              icon={Search}
              title="Find the Right Specialist"
              description="Whether you need a general check-up or specialized care, we've got you covered."
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-dentist-600 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Ready to Book Your Dental Appointment?</h2>
              <p className="text-dentist-100 max-w-xl">
                Join thousands of satisfied patients who have found their perfect dentist through DentalSmile.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="secondary" asChild className="text-dentist-800 font-semibold px-6 py-3">
                <Link to="/book">Book Appointment Now</Link>
              </Button>
              <Button variant="secondary" asChild className="text-dentist-800 font-semibold px-6 py-3">
                <Link to="/dentists">Find a Dentist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Index;
