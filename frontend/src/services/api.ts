import axios from 'axios';
import { 
  DentalService, 
  CreateServiceRequest, 
  UpdateServiceRequest,
  PaginatedServicesResponse,
  BulkServiceUpdate
} from '../types/service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login/', {
        email: data.email,
        password: data.password
      });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response format');
      }
      
      return response;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw error;
    }
  },
  getCurrentUser: () => api.get('/auth/me/'), // ensure this matches your backend endpoint
  register: async (userData: { 
    name: string; 
    email: string; 
    password: string;
    phone_number?: string;
  }) => {
    try {
      const username = userData.email.split('@')[0];
      
      const response = await api.post('/auth/register/', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        username: username,
        phone_number: userData.phone_number || '' // Changed to match backend field name
      });
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  requestPasswordReset: (email: string) =>
    api.post('/auth/password-reset/', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/password-reset/confirm/', { token, password }),
  
  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/auth/profile/', data);
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  
  uploadProfilePicture: async (formData: FormData) => {
    try {
      const response = await api.post('/auth/upload-profile-picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  }
};

export const appointmentAPI = {
  getAppointments: () => api.get('/appointments/'),
  rescheduleAppointment: (id: number, data: any) => 
    api.put(`/appointments/${id}/reschedule/`, data),
  cancelAppointment: (id: number) => 
    api.delete(`/appointments/${id}/`),
  updateAppointmentStatus: (id: number, status: string) =>
    api.put(`/appointments/${id}/status`, { status }),
};

export const dentistAPI = {
  // Get all dentists with optional filtering
  getAllDentists: (params?: {
    specialty?: string;
    city?: string;
    state?: string;
    search?: string;
    acceptingNewPatients?: boolean;
    page?: number;
    limit?: number;
  }) => api.get('/dentists', { params }),
  
  // Get a specific dentist by ID
  getDentistById: (id: string) => api.get(`/dentists/${id}`),
  
  // Get dentist availability for appointment booking
  getDentistAvailability: (id: string, date: string) => 
    api.get(`/dentists/${id}/availability`, { params: { date } }),
  
  // Get the patients of a specific dentist (for dentist dashboard)
  getDentistPatients: (id?: string) => api.get(`/dentists/patients`),
  
  // Get the schedule of a dentist
  getDentistSchedule: (id?: string) => api.get(`/dentists/schedule`),
};

export const userAPI = {
  updateProfile: async (data: any) => {
    try {
      console.log("API updateProfile called with:", data);
      
      // Create a new object without the profile_picture field
      // to avoid any issues with the backend expecting a file
      const { profile_picture, ...profileData } = data;
      
      // Send the request without the profile_picture field
      const response = await api.put('/auth/profile/', profileData);
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  
  uploadProfilePicture: async (file: File) => {
    try {
      // Validate file size and type first
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size should be less than 2MB');
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Only JPG and PNG files are allowed');
      }
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/auth/upload-profile-picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data.imageUrl;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  }
}

export const servicesAPI = {
  // Get all dental services with filtering options
  getAllServices: (params?: {
    active?: boolean; 
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<PaginatedServicesResponse>('/services', { params }),
  
  // Get active services only (public endpoint)
  getActiveServices: (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get<PaginatedServicesResponse>('/services/public', { params }),
  
  // Get a specific service by ID
  getServiceById: (id: string) => api.get<DentalService>(`/services/${id}`),
  
  // Create a new service (admin only)
  createService: (serviceData: CreateServiceRequest) => api.post<DentalService>('/services', serviceData),
  
  // Update an existing service (admin only)
  updateService: (id: string, serviceData: UpdateServiceRequest) => 
    api.put<DentalService>(`/services/${id}`, serviceData),
  
  // Delete a service (admin only)
  deleteService: (id: string) => api.delete<DentalService>(`/services/${id}`),
  
  // Activate a service (admin only)
  activateService: (id: string) => api.patch<DentalService>(`/services/${id}/activate`),
  
  // Deactivate a service (admin only)
  deactivateService: (id: string) => api.patch<DentalService>(`/services/${id}/deactivate`),
  
  // Bulk create services (admin only)
  bulkCreateServices: (servicesData: CreateServiceRequest[]) => 
    api.post<{ success: number; failed: number }>('/services/bulk', servicesData),
  
  // Bulk update services (admin only)
  bulkUpdateServices: (updates: BulkServiceUpdate[]) => 
    api.put<{ success: number; failed: number }>('/services/bulk', updates),
};

export default api;
