import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
};

export const storesAPI = {
  getAll: (params) => apiClient.get('/stores', { params }),
  getById: (id) => apiClient.get(`/stores/${id}`),
  create: (data) => apiClient.post('/stores', data),
  update: (id, data) => apiClient.put(`/stores/${id}`, data),
  delete: (id) => apiClient.delete(`/stores/${id}`),
};

export const shelvesAPI = {
  getAll: (params) => apiClient.get('/shelves', { params }),
  create: (data) => apiClient.post('/shelves', data),
};

export const camerasAPI = {
  getAll: (params) => apiClient.get('/cameras', { params }),
  create: (data) => apiClient.post('/cameras', data),
};

export const productsAPI = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
};

export const customersAPI = {
  getAll: (params) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getAttention: () => apiClient.get('/analytics/attention'),
  getTraffic: () => apiClient.get('/analytics/traffic'),
  getProducts: () => apiClient.get('/analytics/products'),
};

export const heatmapsAPI = {
  getPoints: (params) => apiClient.get('/heatmaps', { params }),
};

export const reportsAPI = {
  getAll: () => apiClient.get('/reports'),
  export: (params) => apiClient.post('/reports/export', null, { params }),
};

export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}`),
};

export default apiClient;
