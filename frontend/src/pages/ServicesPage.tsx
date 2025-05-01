import { Helmet } from "react-helmet";
import ServiceManagement from "@/components/ServiceManagement";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ServicesPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);
      
      // If not admin, redirect to dashboard
      if (parsedUser.role !== "admin") {
        toast.error("You don't have permission to access Services management");
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Services Management | Dental Smile</title>
      </Helmet>
      
      <main className="pt-20 pb-16">
        <ServiceManagement />
      </main>
    </div>
  );
};

export default ServicesPage;