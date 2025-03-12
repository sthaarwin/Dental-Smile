import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search, Calendar, CheckCircle, ArrowRight, Star, Shield, User } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>How It Works | Smile Schedule Saver</title>
        <meta name="description" content="Learn how to book dental appointments easily with Smile Schedule Saver." />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How Smile Schedule Saver Works</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book your dental appointment in three simple steps
            </p>
          </div>

          {/* Steps Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-dentist-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-dentist-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3">1. Find a Dentist</h2>
              <p className="text-gray-600 mb-4">
                Search for dentists by location, read reviews, and compare credentials to find the perfect match for your dental needs.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Browse verified dental professionals
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Read patient reviews and ratings
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Compare services and specialties
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-dentist-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-dentist-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3">2. Book Appointment</h2>
              <p className="text-gray-600 mb-4">
                Select your preferred date and time, choose your service, and book instantly with our easy-to-use scheduling system.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  View real-time availability
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Choose your preferred time slot
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Instant confirmation
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-dentist-100 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-dentist-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3">3. Get Care</h2>
              <p className="text-gray-600 mb-4">
                Visit your dentist, receive quality care, and manage your dental health with ease through our platform.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Automated appointment reminders
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Easy rescheduling if needed
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-dentist-600 mt-1 mr-2 flex-shrink-0" />
                  Post-visit feedback system
                </li>
              </ul>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Smile Schedule Saver?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start p-4">
                <Shield className="h-8 w-8 text-dentist-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Verified Professionals</h3>
                  <p className="text-gray-600">All dentists are licensed and credentials are verified</p>
                </div>
              </div>
              <div className="flex items-start p-4">
                <Calendar className="h-8 w-8 text-dentist-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">24/7 Booking</h3>
                  <p className="text-gray-600">Book appointments anytime, anywhere</p>
                </div>
              </div>
              <div className="flex items-start p-4">
                <User className="h-8 w-8 text-dentist-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Patient-First Approach</h3>
                  <p className="text-gray-600">Focused on providing the best patient experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Book Your Appointment?</h2>
            <p className="text-gray-600 mb-6">Join thousands of patients who trust Smile Schedule Saver</p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link to="/dentists">
                  Find a Dentist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
