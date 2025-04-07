import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DentistLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted:", formData);
    toast.success("Login successful!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Helmet>
        <title>Dentist Login | Dental Smile</title>
        <meta name="description" content="Login to your dental practice account to manage appointments and patient care." />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block p-3 rounded-full bg-dentist-50 mb-4">
                <User className="w-8 h-8 text-dentist-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Dentist Login</h1>
              <p className="mt-2 text-gray-600">Welcome back! Please log in to your practice account</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              {/* Login Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-dentist-500 to-dentist-600 rounded-t-2xl">
                <div className="flex items-center text-white">
                  <Shield className="w-6 h-6 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold">Secure Login</h2>
                    <p className="text-sm opacity-90">Access your practice dashboard</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="doctor@dentalclinic.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/dentist-forgot-password"
                      className="text-sm text-dentist-600 hover:text-dentist-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, rememberMe: checked as boolean })
                    }
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-normal cursor-pointer select-none"
                  >
                    Remember me on this device
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-dentist-600 to-dentist-700 hover:from-dentist-700 hover:to-dentist-800"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have a practice account?{" "}
                <Link
                  to="/dentist-signup"
                  className="text-dentist-600 hover:text-dentist-700 font-medium"
                >
                  Register your practice
                </Link>
              </p>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                <Shield className="w-4 h-4 mr-2" />
                Secure Practice Portal
              </h3>
              <p className="text-sm text-blue-700">
                This portal is exclusively for verified dental professionals. All activities are
                monitored and secured with enterprise-grade encryption.
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default DentistLogin;
