import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
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
  getAppointmentById: (id: number | string) => 
    api.get(`/appointments/${id}`),
  createAppointment: (appointmentData: any) => 
    api.post('/appointments', appointmentData),
  updateAppointment: (id: number | string, appointmentData: any) => 
    api.put(`/appointments/${id}`, appointmentData),
  deleteAppointment: (id: number | string) => 
    api.delete(`/appointments/${id}`),
  getAppointmentsByDentist: (dentistId: string) => 
    api.get(`/appointments/dentist/${dentistId}`),
  getAppointmentsByPatient: (patientId: string) => 
    api.get(`/appointments/patient/${patientId}`),
  getAppointmentsByDate: (date: string) => 
    api.get('/appointments/date', { params: { date } }),
  myAppointments: () => api.get('/appointments/my-appointments'),
  rescheduleAppointment: (id: number | string, data: any) => 
    api.put(`/appointments/${id}/reschedule/`, data),
  cancelAppointment: (id: number | string) => 
    api.delete(`/appointments/${id}/`),
  updateAppointmentStatus: (id: number | string, status: string) => {
    if (!id) {
      console.error("Cannot update appointment status: appointment ID is undefined");
      return Promise.reject(new Error("Appointment ID is undefined"));
    }
    return api.patch(`/appointments/${id}/status`, { status });
  },
};

export const scheduleAPI = {
  getDentistSchedule: (dentistId: string) => 
    api.get(`/schedules/dentist/${dentistId}`),
  
  updateSchedule: (dentistId: string, scheduleData: any) => 
    api.put(`/schedules/dentist/${dentistId}`, scheduleData),
    
  addTimeSlot: (dentistId: string, timeSlotData: any) => 
    api.post(`/schedules/dentist/${dentistId}`, timeSlotData),
    
  updateTimeSlot: (dentistId: string, timeSlotData: any) => {
    const { id, day, startTime, endTime, isAvailable } = timeSlotData;
    return api.put(`/schedules/dentist/${dentistId}/time-slot`, {
      id,
      day: day.toLowerCase(),
      startTime,
      endTime,
      isAvailable
    });
  },
    
  deleteTimeSlot: (dentistId: string, slotId: number, day: string) => 
    api.delete(`/schedules/dentist/${dentistId}/${slotId}`, {
      data: { day: day.toLowerCase() }
    }),
    
  addDayOff: (dentistId: string, dateStr: string) =>
    api.post(`/schedules/dentist/${dentistId}/day-off`, { date: dateStr }),
    
  removeDayOff: (dentistId: string, dateStr: string) =>
    api.post(`/schedules/dentist/${dentistId}/remove-day-off`, { date: dateStr }),
    
  checkAvailability: (dentistId: string, date: string, startTime: string, endTime: string) =>
    api.get('/schedules/availability', { 
      params: { dentistId, date, startTime, endTime } 
    }),
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
  }) => api.get('/services/dentists/public', { params }),
  
  getDentistById: (id: string) => api.get(`/users/${id}`),
  
  getDentistProfile: (id: string) => api.get(`/dentists/${id}/profile`),
  
  getDentistReviews: (id: string) => api.get(`/reviews/dentist/${id}`),
  
  getDentistSchedule: (id: string) => api.get(`/schedules/dentist/${id}`),
  
  checkDentistApplicationStatus: (id: string) => api.get(`/dentists/applications/${id}/status`),
  
   getDentistData: async (id: string) => {
    try {
       const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
       return api.get(`/dentists/${id}`);
    }
  }
};

export const reviewAPI = {
  getDentistReviews: (dentistId: string) => 
    api.get(`/reviews/dentist/${dentistId}/public`),
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
    api.post('/auth/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteAccount: () => 
    api.delete('/users/me'),
};

export default api;
