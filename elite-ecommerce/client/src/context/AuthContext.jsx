import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  // Check current session on initial render
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const isEmail = identifier.includes('@');
    const payload = isEmail
      ? { email: identifier, password }
      : { mobile: identifier, password };

    const res = await api.post('/auth/login', payload);
    if (res.data.success) {
      setUser(res.data.user);
      setAuthModalOpen(false);
    }
    return res.data;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    if (res.data.success) {
      setUser(res.data.user);
      setAuthModalOpen(false);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    const res = await api.put('/users/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const addAddress = async (addrData) => {
    const res = await api.post('/users/address', addrData);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, addresses: res.data.addresses }));
    }
    return res.data;
  };

  const deleteAddress = async (addressId) => {
    const res = await api.delete(`/users/address/${addressId}`);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, addresses: res.data.addresses }));
    }
    return res.data;
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
