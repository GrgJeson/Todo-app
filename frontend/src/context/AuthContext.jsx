import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    if (accessToken && username) {
      setUser({ username });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('login/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', username);
      
      setUser({ username });
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data?.detail || "Invalid username or password.";
      return { success: false, error: errorMsg };
    }
  };

  const register = async (username, email, password, first_name, last_name) => {
    try {
      const response = await api.post('register/', {
        username,
        email,
        password,
        first_name,
        last_name,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Registration error:", error);
      let errorMsg = "Registration failed.";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          // Flatten standard DRF serializer errors
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join('\n');
        } else {
          errorMsg = data;
        }
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
