import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
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

// Handle auth errors
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

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (task) => api.post('/tasks', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`),
  getCounts: () => api.get('/tasks/stats/counts'),
  // Deleted tasks management
  getDeleted: () => api.get('/tasks/deleted'),
  restore: (id) => api.patch(`/tasks/${id}/restore`),
  permanentDelete: (id) => api.delete(`/tasks/${id}/permanent`),
  deleteAllCompleted: () => api.delete('/tasks/completed/all'),
  deleteAllDeleted: () => api.delete('/tasks/deleted/all'),
  bulkDelete: (taskIds) => api.post('/tasks/bulk-delete', { taskIds }),
};

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  verifyRegistration: (data) => api.post('/auth/verify-registration', data),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyPasswordReset: (data) => api.post('/auth/verify-password-reset', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Lists API
export const listsAPI = {
  getAll: () => api.get('/lists'),
  create: (list) => api.post('/lists', list),
  update: (id, list) => api.put(`/lists/${id}`, list),
  delete: (id) => api.delete(`/lists/${id}`),
};

export default api;
