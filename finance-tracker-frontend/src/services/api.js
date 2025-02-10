import axios from 'axios';
import { getToken } from '@/utils/auth';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const mediaURL = baseURL;

const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle Authorization token
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  // Remove content-type for FormData (multipart uploads)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Normalize URL paths (remove leading slashes)
  config.url = config.url.replace(/^\/+/, '');
  return config;
});

// Global Response Handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const transactionsBase = 'transactions/transactions/';
const categoriesBase = 'transactions/categories/';

export const api = {
  auth: {
    login: (credentials) => axiosInstance.post('auth/login/', credentials),
    register: (data) => axiosInstance.post('auth/register/', data),
    me: () => axiosInstance.get('auth/me/'),
    getProfile: () => axiosInstance.get('auth/me/'),
    updateProfile: (data) => axiosInstance.patch('auth/me/', data),
  },

  users: {
    updateProfile: (data) => axiosInstance.patch('auth/profile/', data),
    updateSettings: (data) => axiosInstance.patch('auth/settings/', data),
    deleteAccount: () => axiosInstance.delete('auth/delete/'),
  },

  notifications: {
    getAll: () => axiosInstance.get('notifications/'),
    markAsRead: (id) => axiosInstance.post(`notifications/${id}/read/`),
    markAllAsRead: () => axiosInstance.post('notifications/mark-all-read/'),
    getUnreadCount: () => axiosInstance.get('notifications/unread-count/'),
  },

  transactions: {
    getAll: () => axiosInstance.get(transactionsBase),
    getById: (id) => axiosInstance.get(`${transactionsBase}${id}/`),
    create: (data) => axiosInstance.post(transactionsBase, data),
    update: (id, data) => axiosInstance.patch(`${transactionsBase}${id}/`, data),
    delete: (id) => axiosInstance.delete(`${transactionsBase}${id}/`),
    getExpensesByCategory: () => axiosInstance.get(`${transactionsBase}by-category/`),
    getTrends: () => axiosInstance.get(`${transactionsBase}trends/`),
    getSummary: () => axiosInstance.get(`${transactionsBase}summary/`),
  },

  categories: {
    getAll: () =>
      axiosInstance.get(categoriesBase).then((response) => ({
        data: Array.isArray(response.data) ? response.data : response.data?.results || [],
      })),
    getById: (id) => axiosInstance.get(`${categoriesBase}${id}/`),
    create: (data) =>
      axiosInstance.post(categoriesBase, {
        ...data,
        type: data.type || 'expense',
        icon: data.icon || '',
        color: data.color || '#000000',
      }),
    update: (id, data) =>
      axiosInstance.put(`${categoriesBase}${id}/`, {
        ...data,
        type: data.type || 'expense',
        icon: data.icon || '',
        color: data.color || '#000000',
      }),
    delete: (id) => axiosInstance.delete(`${categoriesBase}${id}/`),
  },

  goals: {
    getAll: () => axiosInstance.get('goals/'),
    create: (data) => axiosInstance.post('goals/', data),
    update: (id, data) => axiosInstance.put(`goals/${id}/`, data),
    delete: (id) => axiosInstance.delete(`goals/${id}/`),
    updateProgress: (goalId, data) => axiosInstance.patch(`goals/${goalId}/progress/`, data),
  },
};

export default api;
