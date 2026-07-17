import axios from 'axios';
import { offlineCache } from './offlineCache';
import useOffline from '../hooks/useOffline';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros e offline
api.interceptors.request.use(async (config) => {
  const isOffline = !navigator.onLine;
  
  if (isOffline && config.method !== 'get') {
    // Salvar operação para sincronização posterior
    offlineCache.savePendingOperation({
      type: config.method.toUpperCase(),
      endpoint: config.url,
      data: config.data
    });
    
    // Tentar usar cache para GET requests
    if (config.method === 'get') {
      const cachedData = offlineCache.get(config.url);
      if (cachedData) {
        return Promise.reject({
          isOffline: true,
          cachedData,
          message: 'Usando dados em cache'
        });
      }
    }
    
    return Promise.reject({
      isOffline: true,
      message: 'Sem conexão à internet. Operação salva para sincronização.'
    });
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Cache de respostas GET bem-sucedidas
    if (response.config.method === 'get') {
      offlineCache.set(response.config.url, response.data);
    }
    return response;
  },
  async (error) => {
    // Se for erro de rede, tentar usar cache
    if (!error.response && error.config?.method === 'get') {
      const cachedData = offlineCache.get(error.config.url);
      if (cachedData) {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          config: error.config,
          request: error.request
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
