import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        ...formData,
        username: formData.email, // Using email as username
      });
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Sign Up | Smile Schedule Saver</title>
        <meta name="description" content="Create a Smile Schedule Saver account to manage your dental appointments." />
      </Helmet>
      
      <Navbar />
      
      <div className="pt-24 pb-16 flex-grow">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600 mb-8 text-lg">Join thousands of patients managing their dental care with ease</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
              {/* Decorative elements */}
              <div className="hidden lg:block absolute -z-10 top-10 right-10 w-32 h-32 bg-blue-50 rounded-full opacity-70"></div>
              <div className="hidden lg:block absolute -z-10 bottom-10 left-10 w-48 h-48 bg-dentist-50 rounded-full opacity-70"></div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 relative overflow-hidden order-2 lg:order-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dentist-500 to-blue-500"></div>
                
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-dentist-100 flex items-center justify-center mr-4">
                    <User className="h-5 w-5 text-dentist-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Sign Up</h2>
                    <p className="text-sm text-gray-600">Create your free account</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Create Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="********"
                        required
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters long with letters and numbers
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-dentist-600 to-dentist-700 hover:from-dentist-700 hover:to-dentist-800 text-white"
                  >
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                
                <div className="mt-8 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                  </div>
                  <Link to="/login" className="mt-4 inline-block text-dentist-600 hover:text-dentist-800 font-medium">
                    Log in to your account
                  </Link>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-dentist-500 to-dentist-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden order-1 lg:order-2">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-dentist-800 opacity-20 rounded-full -ml-16 -mb-16"></div>
                
                <h2 className="text-2xl font-semibold mb-6 relative z-10">Why Join Smile Schedule Saver?</h2>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Access to a network of qualified dental professionals</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Easy scheduling and rescheduling at your convenience</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Appointment reminders to never miss your dental care</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Personalized recommendations based on your dental history</span>
                  </li>
                </ul>
                
                <div className="mt-8 relative z-10">
                  <p className="font-medium text-lg">Need Help?</p>
                  <div className="flex items-center mt-2">
                    <Mail className="h-5 w-5 mr-2 text-white opacity-80" />
                    <span>support@dentalsmile.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Signup;
