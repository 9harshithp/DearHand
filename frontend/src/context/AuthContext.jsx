import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dearhand_token'));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('dearhand_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrateUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await apiRequest('/auth/me');
        setUser(userData);
        localStorage.setItem('dearhand_user', JSON.stringify(userData));
      } catch (err) {
        console.warn('Session expired or invalid, logging out', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    hydrateUser();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const userObj = {
      id: res.id,
      name: res.name,
      email: res.email,
      phone: res.phone,
      role: res.role,
      helperStatus: res.helperStatus,
    };

    localStorage.setItem('dearhand_token', res.token);
    localStorage.setItem('dearhand_user', JSON.stringify(userObj));
    setToken(res.token);
    setUser(userObj);
    return userObj;
  };

  const register = async (userData) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const userObj = {
      id: res.id,
      name: res.name,
      email: res.email,
      phone: res.phone,
      role: res.role,
      helperStatus: res.helperStatus,
    };

    localStorage.setItem('dearhand_token', res.token);
    localStorage.setItem('dearhand_user', JSON.stringify(userObj));
    setToken(res.token);
    setUser(userObj);
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('dearhand_token');
    localStorage.removeItem('dearhand_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
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
