import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../lib/api';

// Contexto de autenticação
const AuthContext = createContext();

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const localUser = authAPI.getCurrentUser();
        if (localUser) {
          setUser(localUser);
          setIsAuthenticated(true);
        } else {
          const authData = await authAPI.checkAuth();
          if (authData && authData.user) {
            setUser(authData.user);
            localStorage.setItem('user', JSON.stringify(authData.user));
            setIsAuthenticated(true);
          } else {
            logout();
          }
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao fazer login',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authAPI.register(userData);
      return { success: true, data };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: error.response?.data || 'Erro ao registrar usuário',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
