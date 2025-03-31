import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      // Generate a username from email
      const username = userData.email.split('@')[0];
      
      const response = await api.post('/auth/register/', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        username: username // Add username explicitly
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
};

export const appointmentAPI = {
  getAppointments: () => api.get('/appointments/'),
  rescheduleAppointment: (id: number, data: any) => 
    api.put(`/appointments/${id}/reschedule/`, data),
  cancelAppointment: (id: number) => 
    api.delete(`/appointments/${id}/`),
};

export const userAPI = {
  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/auth/profile/', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        emergency_contact: data.emergencyContact, // Note the underscore
        emergency_phone: data.emergencyPhone     // Note the underscore
      });
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
}

export default api;
