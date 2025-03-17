import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Set auth header before making request
        const response = await authAPI.getCurrentUser();
        if (response.data) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dentist-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
