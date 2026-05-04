import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('courier_user');
    const token = localStorage.getItem('courier_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        localStorage.removeItem('courier_user');
        localStorage.removeItem('courier_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('courier_user', JSON.stringify(userData));
    localStorage.setItem('courier_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('courier_user');
    localStorage.removeItem('courier_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem('courier_user', JSON.stringify(merged));
    setUser(merged);
  };

  const value = { user, login, logout, updateUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
