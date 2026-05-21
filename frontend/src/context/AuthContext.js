import React, { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(apiUrl('/api/auth/verify'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.valid) {
        fetchUser();
      }
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(apiUrl('/api/users/me'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(apiUrl('/api/auth/login'), {
        email,
        password
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(apiUrl('/api/auth/register'), {
        username,
        email,
        password
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
