import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Clock, Check, Award, Smile, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Sarah Johnson",
    role: "Co-founder & Chief Dental Officer",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80",
    bio: "With over 15 years of clinical experience, Dr. Johnson saw the need for better access to dental care."
  },
  {
    name: "Michael Chen",
    role: "Co-founder & CEO",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80",
    bio: "Former tech executive with a passion for healthcare innovation and improved patient experiences."
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Dentist Relations",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80",
    bio: "Emily works closely with our dental partners to ensure seamless integration with our platform."
  },
  {
    name: "James Wilson",
    role: "Chief Technology Officer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
    bio: "James leads our engineering team in building secure, accessible dental scheduling technology."
  }
];

const stats = [
  { value: "10k+", label: "Appointments Booked Monthly" },
  { value: "500+", label: "Dental Professionals" },
  { value: "50+", label: "Cities Covered" },
  { value: "98%", label: "Patient Satisfaction" }
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About Us | Dental Smile</title>
        <meta name="description" content="Learn about our mission to simplify dental care access and improve oral health outcomes." />
      </Helmet>
      
      <Navbar />
      
      <main className="pt-24 pb-16 flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-dentist-50 to-white py-12 mb-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/2">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Revolutionizing Dental Care Access</h1>
                <p className="text-lg text-gray-700 mb-6">
                  At Dental Smile, we're on a mission to connect patients with quality dental care through innovative technology and a patient-first approach.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild>
                    <Link to="/dentists">Find a Dentist</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&q=80&w=600" 
                      alt="Dental professionals" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 border border-gray-100 hidden md:block">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Trusted Platform</p>
                        <p className="text-sm text-gray-600">Verified dental professionals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our story section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100">
            <div className="flex flex-col md:flex-row items-start gap-10">
              <div className="md:w-1/3">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                <div className="h-1 w-20 bg-dentist-600 mb-6"></div>
                <div className="relative h-full">
                  <img 
                    src="https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&q=80&w=400" 
                    alt="Dental clinic" 
                    className="rounded-lg object-cover shadow-md"
                  />
                  <div className="absolute bottom-4 left-4 bg-dentist-600 text-white py-1 px-3 rounded-full text-sm">
                    Since 2025  
                  </div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-semibold text-dentist-600 mb-4">Reimagining Dental Appointments</h3>
                <p className="text-gray-700 mb-6">
                  Founded in 2025, Dental Smile was born from a simple observation: booking dental appointments 
                  was unnecessarily complicated. Our founders experienced firsthand the frustration of calling multiple 
                  dental offices, waiting on hold, and struggling to find appointments that fit their schedules.
                </p>
                <p className="text-gray-700 mb-6">
                  We set out to create a platform that makes dental care more accessible by streamlining the appointment 
                  booking process. Today, we're proud to connect thousands of patients with qualified dental professionals 
                  every month, improving oral health outcomes and practice efficiency.
                </p>
                <p className="text-gray-700">
                  Our team combines expertise in dentistry, technology, and customer experience to build a service that truly 
                  benefits both patients and dental professionals. We're constantly innovating and expanding to serve more 
                  communities and make dental care accessible to all.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics section */}
        <section className="bg-dentist-600 py-16 mb-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-dentist-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission and values */}
        <section className="container mx-auto px-6 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're guided by a set of core principles that shape everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-dentist-100 rounded-full flex items-center justify-center mb-6">
                <Smile className="h-7 w-7 text-dentist-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessibility</h3>
              <p className="text-gray-700">
                We believe dental care should be accessible to everyone, regardless of location or schedule. 
                Our platform removes barriers to quality oral healthcare.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-dentist-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-dentist-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-700">
                We provide clear, honest information about dentists, services, and patient experiences to help 
                you make informed decisions about your dental care.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-dentist-100 rounded-full flex items-center justify-center mb-6">
                <Award className="h-7 w-7 text-dentist-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-700">
                We partner only with qualified dental professionals committed to excellent patient care.
                Our verification process ensures you receive the highest standard of treatment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-semibold text-dentist-600 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                For Patients
              </h3>
              <p className="text-gray-700 mb-4">
                We empower patients to take control of their dental health by providing:
              </p>
              <ul className="space-y-3">
                {[
                  "Access to a network of verified dental professionals",
                  "Transparent information about each dentist's qualifications",
                  "Real patient reviews and ratings",
                  "Simple online booking system",
                  "Appointment reminders and easy rescheduling"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-dentist-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-semibold text-dentist-600 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                For Dentists
              </h3>
              <p className="text-gray-700 mb-4">
                We help dental practices grow and manage their patient base by offering:
              </p>
              <ul className="space-y-3">
                {[
                  "Increased online visibility to potential patients",
                  "Streamlined appointment management",
                  "Reduced administrative work",
                  "Lower no-show rates with automated reminders",
                  "A platform to showcase specialties and services"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-dentist-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Team section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate professionals behind Dental Smile
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-transform hover:scale-[1.02] hover:shadow-md">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-56 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-dentist-600 mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Locations */}
        <section className="container mx-auto px-6 mb-16">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Where We Operate</h2>
                <p className="text-gray-600 mb-6 max-w-xl">
                  We're currently available in over 50 cities across the country and rapidly expanding 
                  to bring better dental care access to more communities.
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-dentist-600 mr-2" />
                    <span>New York</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-dentist-600 mr-2" />
                    <span>Los Angeles</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-dentist-600 mr-2" />
                    <span>Chicago</span>
                  </div>
                </div>
                <Button className="mt-6" asChild>
                  <Link to="/dentists">Find dentists near you</Link>
                </Button>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&q=80&w=500" 
                  alt="Office locations" 
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-gradient-to-r from-dentist-600 to-dentist-700 py-12 rounded-xl mx-6">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Better Dental Care?</h2>
                <p className="text-dentist-100 mb-0 max-w-xl">
                  Join thousands of patients who've simplified their dental care journey with Dental Smile.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" className="min-w-[140px]" asChild>
                  <Link to="/dentists">Find a Dentist</Link>
                </Button>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-dentist-700 min-w-[140px]" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      
    </div>
    
  );
};

export default About;
