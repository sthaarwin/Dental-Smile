import { useState } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Form submitted:", formData);
      toast.success("Message sent successfully! We'll contact you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Contact Us | Dental Smile</title>
        <meta name="description" content="Contact our dental scheduling specialists for support or inquiries about our services." />
      </Helmet>
      
      <Navbar />
      
      <div className="pt-24 pb-16 flex-grow bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">Contact Us</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">We're here to help with all your dental scheduling needs. Reach out and we'll respond as soon as possible.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-dentist-600 mb-6 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-dentist-500" />
                    Get In Touch
                  </h2>
                  <p className="text-gray-700 mb-8">
                    Have questions about our service or need assistance with scheduling? 
                    Our team is here to help. Fill out the form and we'll get back to you as soon as possible.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start hover:bg-gray-50 p-3 rounded-md transition-colors">
                      <MapPin className="w-5 h-5 text-dentist-500 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Office Address</h3>
                        <p className="text-gray-600">123 Dental Street, Medical District, City, 12345</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start hover:bg-gray-50 p-3 rounded-md transition-colors">
                      <Phone className="w-5 h-5 text-dentist-500 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Phone</h3>
                        <p className="text-gray-600">(123) 456-7890</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start hover:bg-gray-50 p-3 rounded-md transition-colors">
                      <Mail className="w-5 h-5 text-dentist-500 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Email</h3>
                        <p className="text-gray-600">info@dentalsmile.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-4">Connect With Us</h3>
                    <div className="flex space-x-4">
                      {[
                        { icon: Facebook, label: "Facebook" },
                        { icon: Twitter, label: "Twitter" },
                        { icon: Instagram, label: "Instagram" },
                        { icon: Linkedin, label: "LinkedIn" },
                      ].map((social, idx) => (
                        <a 
                          key={idx}
                          href="#"
                          className="bg-gray-100 p-3 rounded-full hover:bg-dentist-100 hover:text-dentist-600 transition-colors"
                          aria-label={social.label}
                        >
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-dentist-500">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-dentist-600 mb-6 flex items-center">
                    <Mail className="w-5 h-5 mr-3 text-dentist-500" />
                    Send a Message
                  </h2>
                  <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium flex items-center">
                          Full Name <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="focus:ring-dentist-500 transition-all border-gray-200 hover:border-dentist-300"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center">
                          Email Address <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="focus:ring-dentist-500 transition-all border-gray-200 hover:border-dentist-300"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                        Phone Number <span className="text-gray-400 text-xs ml-2">(Optional)</span>
                      </Label>
                      <Input 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(123) 456-7890"
                        className="focus:ring-dentist-500 transition-all border-gray-200 hover:border-dentist-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium flex items-center">
                        Message <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="resize-none focus:ring-dentist-500 transition-all border-gray-200 hover:border-dentist-300"
                        placeholder="How can we help you? Please include any specific questions or details about your dental scheduling needs."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">We respect your privacy and will not share your information.</p>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-dentist-600 hover:bg-dentist-700 text-white transition-all py-6"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
