import axios from 'axios';

const API_BASE = 'https://leavemaster-backend-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data; 
  },
};

export const leaveAPI = {
  create: (data) => api.post('/leave', data),
  getMyRequests: () => api.get('/leave/my-requests'),
  getPending: () => api.get('/leave/pending'),
  updateStatus: (id, status) => api.put(`/leave/${id}/status`, { status }),
  // Calendar endpoints - TAMBAHKAN INI
  getCalendarEvents: () => api.get('/calendar/events'),
  getTeamCalendar: () => api.get('/calendar/team'),
};

export const reportsAPI = {
  getDashboardStats: () => api.get('/reports/dashboard-stats'),
  getDepartmentStats: () => api.get('/reports/department-stats'),
  getMonthlyTrends: () => api.get('/reports/monthly-trends'),
  getLeaveTypeDistribution: () => api.get('/reports/leave-type-distribution'),
  getRecentActivities: () => api.get('/reports/recent-activities'),
  // Generic API client untuk endpoints lain
  apiClient: {
    get: (url) => api.get(url),
    post: (url, data) => api.post(url, data),
    put: (url, data) => api.put(url, data),
    delete: (url) => api.delete(url),
  }
};

export default api;