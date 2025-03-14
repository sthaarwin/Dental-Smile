import axios from 'axios';

const baseURL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
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

// Add response interceptor
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
    api.post('/auth/login/', credentials),

  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register/', userData),

  getCurrentUser: () => api.get('/auth/user/'),
};

export const appointmentAPI = {
  getAppointments: () => api.get('/appointments/'),
  rescheduleAppointment: (id: number, data: any) => 
    api.put(`/appointments/${id}/reschedule/`, data),
  cancelAppointment: (id: number) => 
    api.delete(`/appointments/${id}/`),
};

export default api;
