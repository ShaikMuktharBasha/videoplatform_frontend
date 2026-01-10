import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors (token expired/invalid)
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

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

// Video endpoints
export const videoAPI = {
  upload: (formData, onUploadProgress) => {
    return api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  getAll: (status) => {
    const params = status ? { status } : {};
    return api.get('/videos', { params });
  },
  getPublic: () => api.get('/videos/public'),
  getById: (id) => api.get(`/videos/${id}`),
  delete: (id) => api.delete(`/videos/${id}`),
  getStreamUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/videos/stream/${id}?token=${token}`;
  },
  toggleLike: (id) => api.post(`/videos/${id}/like`),
  addView: (id) => api.post(`/videos/${id}/view`),
  getComments: (videoId) => api.get(`/videos/${videoId}/comments`),
  addComment: (videoId, content) => api.post(`/videos/${videoId}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`)
};

export default api;
