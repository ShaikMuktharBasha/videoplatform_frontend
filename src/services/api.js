import axios from 'axios';

// IMPORTANT: Replace this with your backend URL when deploying!
const DEPLOYED_BACKEND_URL = 'https://contentanalyzer-backend.vercel.app/api'; 
const API_URL = import.meta.env.VITE_API_URL || DEPLOYED_BACKEND_URL || 'http://localhost:5000/api';

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

// Helper: Upload directly to Cloudinary (bypasses Vercel's 4.5MB limit)
const uploadToCloudinary = async (file, signatureData, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', signatureData.timestamp);
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);
  
  const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`;
  
  const response = await axios.post(uploadUrl, formData, {
    onUploadProgress: onProgress
  });
  
  return response.data;
};

// Video endpoints
export const videoAPI = {
  // Get signature for direct Cloudinary upload
  getUploadSignature: () => api.get('/videos/upload-signature'),
  
  // Direct Cloudinary upload (recommended for large files)
  uploadDirect: async (file, title, description, duration, onProgress) => {
    // Step 1: Get signature from backend
    const sigResponse = await api.get('/videos/upload-signature');
    const signatureData = sigResponse.data;
    
    // Step 2: Upload directly to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file, signatureData, onProgress);
    
    // Step 3: Save video record to backend
    return api.post('/videos/save-cloudinary', {
      title,
      description,
      cloudinaryUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      filesize: cloudinaryResult.bytes,
      duration: duration || cloudinaryResult.duration,
      format: cloudinaryResult.format
    });
  },
  
  // Legacy upload via server (limited to ~4.5MB on Vercel)
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
  getAdult: () => api.get('/videos/adult'), // 18+ content (nudity, horror, violence)
  getLiked: () => api.get('/videos/liked'),
  getDisliked: () => api.get('/videos/disliked'),
  getSaved: () => api.get('/videos/saved'),
  getById: (id) => api.get(`/videos/${id}`),
  delete: (id) => api.delete(`/videos/${id}`),
  getStreamUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/videos/stream/${id}?token=${token}`;
  },
  toggleLike: (id) => api.post(`/videos/${id}/like`),
  toggleDislike: (id) => api.post(`/videos/${id}/dislike`),
  toggleSave: (id) => api.post(`/videos/${id}/save`),
  addView: (id) => api.post(`/videos/${id}/view`),
  getComments: (videoId) => api.get(`/videos/${videoId}/comments`),
  addComment: (videoId, content) => api.post(`/videos/${videoId}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`)
};

export const photoAPI = {
  // Get signature for direct Cloudinary upload
  getUploadSignature: () => api.get('/photos/upload-signature'),
  
  // Direct Cloudinary upload (recommended for large files)
  uploadDirect: async (file, title, description, onProgress) => {
    // Step 1: Get signature from backend
    const sigResponse = await api.get('/photos/upload-signature');
    const signatureData = sigResponse.data;
    
    // Step 2: Upload directly to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file, signatureData, onProgress);
    
    // Step 3: Save photo record to backend
    return api.post('/photos/save-cloudinary', {
      title,
      description,
      cloudinaryUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      filesize: cloudinaryResult.bytes,
      format: cloudinaryResult.format
    });
  },
  
  // Legacy upload via server (limited to ~4.5MB on Vercel)
  upload: (formData, onUploadProgress) => {
    return api.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  getAll: (status) => {
    const params = status ? { status } : {};
    return api.get('/photos', { params });
  },
  getPublic: () => api.get('/photos/public'),
  getAdult: () => api.get('/photos/adult'), // 18+ content (nudity, horror, violence)
  getLiked: () => api.get('/photos/liked'),
  getDisliked: () => api.get('/photos/disliked'),
  getSaved: () => api.get('/photos/saved'),
  getById: (id) => api.get(`/photos/${id}`),
  delete: (id) => api.delete(`/photos/${id}`),
  toggleLike: (id) => api.post(`/photos/${id}/like`),
  toggleDislike: (id) => api.post(`/photos/${id}/dislike`),
  toggleSave: (id) => api.post(`/photos/${id}/save`),
  addView: (id) => api.post(`/photos/${id}/view`)
};

export default api;
