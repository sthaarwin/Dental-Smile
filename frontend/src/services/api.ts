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
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login/', data),
  getCurrentUser: () => api.get('/auth/me/'), // ensure this matches your backend endpoint
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register/', userData),
};

export const appointmentAPI = {
  getAppointments: () => api.get('/appointments/'),
  rescheduleAppointment: (id: number, data: any) => 
    api.put(`/appointments/${id}/reschedule/`, data),
  cancelAppointment: (id: number) => 
    api.delete(`/appointments/${id}/`),
};

export default api;
