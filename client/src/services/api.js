import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: isLocal ? (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bnz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('bnz_token');
      // Redirecionamento suave via event listener (se necessário) ou deixamos a UI lidar
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
