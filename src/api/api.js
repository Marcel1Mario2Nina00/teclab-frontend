import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor: si hay un token guardado, lo envía en el header Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;