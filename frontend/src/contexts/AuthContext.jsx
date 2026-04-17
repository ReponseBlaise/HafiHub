import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Auth Context - Manages user authentication state
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.setToken(storedToken);
    }
    setLoading(false);
  }, []);

  /**
   * Register new user
   */
  const register = async (email, name, password, contact) => {
    try {
      const response = await api.register(email, name, password, contact);
      const { token, data } = response;

      setToken(token);
      setUser(data);
      api.setToken(token);
      localStorage.setItem('token', token);

      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      const { token, data } = response;

      setToken(token);
      setUser(data);
      api.setToken(token);
      localStorage.setItem('token', token);

      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    api.logout();
    localStorage.removeItem('token');
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
