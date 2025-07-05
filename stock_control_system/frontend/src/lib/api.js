import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/"; // já inclui /api/

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para adicionar token JWT nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para renovar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}auth/token/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;
          localStorage.setItem("access_token", access);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("auth/token/", credentials);
    const { access, refresh, user } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("auth/register/", userData);
    return response.data;
  },

  logout: () => {
    localStorage.clear();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  checkAuth: async () => {
    try {
      const response = await api.get("auth/check-auth/");
      return response.data;
    } catch {
      return null;
    }
  },
};

export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("products/", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`products/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("products/", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`products/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`products/${id}/`);
    return response.data;
  },

  getExpiringSoon: async (days = 30) => {
    const response = await api.get("products/expiring-soon/", { params: { days } });
    return response.data;
  },

  getExpired: async () => {
    const response = await api.get("products/expired/");
    return response.data;
  },

  getLowStock: async (min = 10) => {
    const response = await api.get("products/low-stock/", { params: { min_quantity: min } });
    return response.data;
  },

  export: async (format = "csv") => {
    return await api.get("products/export/", {
      params: { format },
      responseType: "blob",
    });
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get("products/dashboard/stats/");
    return response.data;
  },
};

export const systemAPI = {
  downloadBackup: async () => {
    return await api.get("backup/", {
      responseType: "blob",
    });
  },
};

export { api };
export default api;
