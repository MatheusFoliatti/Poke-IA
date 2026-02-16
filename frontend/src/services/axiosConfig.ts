import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8000';

// Criar instância do axios
export const api = axios.create({
  baseURL: API_URL,
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor de requisição - adiciona token
api.interceptors.request.use(
  (config) => {
    const { user } = useAuthStore.getState();
    
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - renova token automaticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se erro 401 e não é uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já está tentando refresh, adiciona à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { user } = useAuthStore.getState();

      if (!user?.token) {
        console.log('⚠️ Sem token, fazendo logout...');
        useAuthStore.getState().logout();
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        console.log('🔄 Tentando renovar token...');
        
        // Tentar renovar token
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const newToken = response.data.access_token;
        
        // Atualizar token no store
        useAuthStore.getState().updateToken(newToken);
        
        console.log('✅ Token renovado com sucesso!');

        // Processar fila de requisições pendentes
        processQueue(null, newToken);

        // Tentar novamente a requisição original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError);
        processQueue(refreshError, null);
        
        // Token inválido, fazer logout
        useAuthStore.getState().logout();
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;