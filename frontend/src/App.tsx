import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import DentistList from "./pages/DentistList";
import DentistProfile from "./pages/DentistProfile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "./pages/NotFound";
import BookAppointment from "./pages/BookAppointment";
import DentistSignup from "./pages/DentistSignup";
import DentistLogin from "./pages/DentistLogin";
import { useScrollTop } from "@/hooks/useScrollTop";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Dashboard from "@/pages/Dashboard";
import PrivateRoute from "@/components/PrivateRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Footer from "./components/Footer";
import Admin from "./pages/Admin";
import DentistDashboard from "./pages/DentistDashboard";
import RoleDashboardRedirect from "./components/RoleDashboardRedirect";
import DentistManagement from "./pages/DentistManagement";
import ServicesPage from "./pages/ServicesPage";
import PatientDetail from "./pages/PatientDetail";
import DentalResources from "./pages/DentalResources";

// Initialize queryClient with secure configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const ScrollToTop = () => {
  useScrollTop();
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <>
      <Navbar />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ 
            duration: 0.35, 
            ease: "easeInOut",
            exitDuration: 0.2
          }}
          className="page-content"
        >
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/dentists" element={<DentistList />} />
            {/* Support both URL patterns for backward compatibility */}
            <Route path="/dentist/:id/:name" element={<DentistProfile />} />
            <Route path="/dentist/:name" element={<DentistProfile />} />
            <Route path="/dentist/:id" element={<DentistProfile />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/book/:dentistId" element={<BookAppointment />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dentist-signup" element={<DentistSignup />} />
            <Route path="/dentist-login" element={<DentistLogin />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/dental-resources" element={<DentalResources />} />
            
            {/* Role-based dashboard routing */}
            <Route path="/my-dashboard" element={<PrivateRoute><RoleDashboardRedirect /></PrivateRoute>} />
            
            {/* Role-specific dashboards */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/dashboard/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/dashboard/dentists" element={<PrivateRoute><DentistManagement /></PrivateRoute>} />
            <Route path="/dashboard/services" element={<PrivateRoute><ServicesPage /></PrivateRoute>} />
            
            <Route path="/dentist-dashboard" element={<PrivateRoute><DentistDashboard /></PrivateRoute>} />
            <Route path="/dentist-dashboard/patients/:patientId" element={<PrivateRoute><PatientDetail /></PrivateRoute>} />
            
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
       
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Router>
        <ScrollToTop />
        <AnimatedRoutes />
        <Toaster />
        <Sonner />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;