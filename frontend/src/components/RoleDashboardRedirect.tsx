import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboardUrlByRole } from '@/lib/utils';

/**
 * A component that automatically redirects users to their appropriate dashboard
 * based on their role (patient, dentist, or admin)
 */
const RoleDashboardRedirect = () => {
  // Get user data from local storage
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const token = localStorage.getItem('token');
  
  // Determine the appropriate dashboard URL based on the user's role
  const dashboardUrl = getDashboardUrlByRole(user?.role);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to the appropriate dashboard
  return <Navigate to={dashboardUrl} replace />;
}

export default RoleDashboardRedirect;