import axios from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://localhost:8000/api';

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos, por exemplo
});

// Interceptor para adicionar o token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e renovar token se necessário
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token inválido, redireciona para o login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Funções de autenticação
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/token/', credentials); // CORRIGIDO
    const { access, refresh, user } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check-auth/');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

// Funções para produtos
export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products/', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}/`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}/`);
    return response.data;
  },

  getExpiringSoon: async (days = 30) => {
    const response = await api.get('/products/expiring-soon/', { params: { days } });
    return response.data;
  },

  getExpired: async () => {
    const response = await api.get('/products/expired/');
    return response.data;
  },

  getLowStock: async (minQuantity = 10) => {
    const response = await api.get('/products/low-stock/', { params: { min_quantity: minQuantity } });
    return response.data;
  },
};

// Funções para dashboard
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/products/dashboard/stats/');
    return response.data;
  },
};

export default api;
