import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: any) => 
    api.post('/auth/register', userData),
  verifyEmail: (token: string) => 
    api.get(`/auth/verify-email?token=${token}`),
  requestPasswordReset: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
  getCurrentUser: () => 
    api.get('/users/me'),
};

export const appointmentAPI = {
  getAppointments: (params?: any) => 
    api.get('/appointments', { params }),
  getAppointmentById: (id: number) => 
    api.get(`/appointments/${id}`),
  createAppointment: (appointmentData: any) => 
    api.post('/appointments', appointmentData),
  updateAppointment: (id: number, appointmentData: any) => 
    api.put(`/appointments/${id}`, appointmentData),
  deleteAppointment: (id: number) => 
    api.delete(`/appointments/${id}`),
  getAppointmentsByDentist: (dentistId: string) => 
    api.get(`/appointments/dentist/${dentistId}`),
  getAppointmentsByPatient: (patientId: string) => 
    api.get(`/appointments/patient/${patientId}`),
  getAppointmentsByDate: (date: string) => 
    api.get('/appointments/date', { params: { date } }),
  myAppointments: () => api.get('/appointments/my-appointments'),
  rescheduleAppointment: (id: number, data: any) => 
    api.put(`/appointments/${id}/reschedule/`, data),
  cancelAppointment: (id: number) => 
    api.delete(`/appointments/${id}/`),
  updateAppointmentStatus: (id: number, status: string) =>
    api.put(`/appointments/${id}/status`, { status }),
};

export const dentistAPI = {
  getAllDentists: (params?: {
    specialty?: string;
    city?: string;
    state?: string;
    search?: string;
    acceptingNewPatients?: boolean;
    page?: number;
    limit?: number;
  }) => api.get('/services/dentists/public', { params }), // Updated to use public endpoint
  
  getDentistById: (id: string) => api.get(`/users/${id}`),
  
  getDentistAvailability: (id: string, date: string) => 
    api.get(`/schedules/dentist/${id}/availability`, { params: { date } }),
  
  searchDentists: (query: string) => 
    api.get(`/services/dentists/public`, { params: { search: query } }),
    
  getDentistsBySpecialty: (specialty: string) => 
    api.get(`/services/dentists/public`, { params: { specialty } }),

  getDentistsByLocation: (city: string, state?: string) => 
    api.get(`/services/dentists/public`, { params: { city, state } }),
    
  getRecommendedDentists: () => 
    api.get('/services/dentists/public', { params: { sortBy: 'rating' } }),
};

export const reviewAPI = {
  getDentistReviews: (dentistId: string) => 
    api.get(`/reviews/dentist/${dentistId}`),
  submitReview: (reviewData: any) => 
    api.post('/reviews', reviewData),
  updateReview: (id: string, reviewData: any) => 
    api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id: string) => 
    api.delete(`/reviews/${id}`),
};

export const servicesAPI = {
  getAllServices: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    category?: string;
    active?: boolean;
  }) => api.get('/services', { params }),
  getServiceById: (id: string) => 
    api.get(`/services/${id}`),
  createService: (serviceData: any) => 
    api.post('/services', serviceData),
  updateService: (id: string, serviceData: any) => 
    api.put(`/services/${id}`, serviceData),
  deleteService: (id: string) => 
    api.delete(`/services/${id}`),
  activateService: (id: string) => 
    api.patch(`/services/${id}/activate`),
  deactivateService: (id: string) => 
    api.patch(`/services/${id}/deactivate`),
  getServicesByCategory: (category: string) => 
    api.get(`/services/category/${category}`),
};

export const userAPI = {
  updateProfile: (userData: any) => 
    api.put('/users/profile', userData),
  updatePassword: (passwords: { currentPassword: string; newPassword: string }) => 
    api.put('/users/update-password', passwords),
  uploadProfilePicture: (formData: FormData) => 
    api.post('/users/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteAccount: () => 
    api.delete('/users/me'),
};

export default api;
