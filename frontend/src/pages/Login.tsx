import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";
import axios from 'axios';
import { authAPI } from '@/services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // First store the basic user data and token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Show success toast
      toast.success('Logged in successfully!');
      
      // Then fetch the complete user data including profile picture
      try {
        // The token is now set in localStorage and will be included in API requests
        const currentUserResponse = await authAPI.getCurrentUser();
        if (currentUserResponse.data) {
          // Update user data in localStorage with complete user data
          localStorage.setItem('user', JSON.stringify(currentUserResponse.data));
          console.log("Updated user data:", currentUserResponse.data);
        }
      } catch (err) {
        console.error("Error fetching current user data:", err);
      }
      
      // Delay the navigation slightly to allow the animation to start
      // This helps ensure a smooth transition to the dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 50);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear password on error
      setFormData(prev => ({ ...prev, password: '' }));
      
      // Better error message extraction
      let errorMessage = 'Invalid credentials';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || error.response.data?.error || 'Login failed';
        
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      // Show error toast with the appropriate message
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Login | Smile Schedule Saver</title>
        <meta name="description" content="Login to your Smile Schedule Saver account to manage your dental appointments." />
      </Helmet>
      
      <div className="pt-24 pb-16 flex-grow">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 mb-8 text-lg">Log in to your account to manage your dental appointments</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
              {/* Decorative elements */}
              <div className="hidden lg:block absolute -z-10 top-10 right-10 w-32 h-32 bg-blue-50 rounded-full opacity-70"></div>
              <div className="hidden lg:block absolute -z-10 bottom-10 left-10 w-48 h-48 bg-dentist-50 rounded-full opacity-70"></div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dentist-500 to-blue-500"></div>
                
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-dentist-100 flex items-center justify-center mr-4">
                    <Lock className="h-5 w-5 text-dentist-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Login</h2>
                    <p className="text-sm text-gray-600">Access your account</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-dentist-600 hover:text-dentist-800">
                        Forgot password?
                      </Link>
                    </div>
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
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-dentist-600 to-dentist-700 hover:from-dentist-700 hover:to-dentist-800 text-white"
                  >
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                
                <div className="mt-8 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                    </div>
                  </div>
                  <Link to="/signup" className="mt-4 inline-block text-dentist-600 hover:text-dentist-800 font-medium">
                    Create an account
                  </Link>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-dentist-500 to-dentist-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-dentist-800 opacity-20 rounded-full -ml-16 -mb-16"></div>
                
                <h2 className="text-2xl font-semibold mb-6 relative z-10">Smile Schedule Saver Benefits</h2>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Book appointments with top dentists</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Manage and reschedule appointments with ease</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Access your dental records securely</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Get reminders for upcoming appointments</span>
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
    </div>
  );
};

export default Login;
