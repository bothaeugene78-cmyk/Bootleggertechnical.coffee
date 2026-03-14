import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('bootlegger_token');
    const savedUser = localStorage.getItem('bootlegger_user');
    
    if (token && savedUser) {
      // Verify token is still valid
      axios.get(`${API}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setUser(JSON.parse(savedUser));
        setLoading(false);
      })
      .catch(() => {
        // Token invalid, clear storage
        localStorage.removeItem('bootlegger_token');
        localStorage.removeItem('bootlegger_user');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('bootlegger_token', token);
      localStorage.setItem('bootlegger_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API}/auth/register`, { name, email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('bootlegger_token', token);
      localStorage.setItem('bootlegger_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bootlegger_token');
    localStorage.removeItem('bootlegger_user');
    setUser(null);
  }, []);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('bootlegger_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout,
      getAuthHeader,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
