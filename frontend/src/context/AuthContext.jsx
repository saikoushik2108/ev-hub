import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('evhub_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('evhub_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            setOwnerProfile(res.data.ownerProfile || null);
          }
        } catch (err) {
          localStorage.removeItem('evhub_token');
          localStorage.removeItem('evhub_refresh_token');
          setUser(null);
          setOwnerProfile(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        localStorage.setItem('evhub_token', res.data.token);
        localStorage.setItem('evhub_refresh_token', res.data.refreshToken);
        setToken(res.data.token);
        setUser(res.data.user);
        setOwnerProfile(res.data.ownerProfile || null);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const registerUser = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        localStorage.setItem('evhub_token', res.data.token);
        localStorage.setItem('evhub_refresh_token', res.data.refreshToken);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Registration successful! Welcome to EV Hub.');
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const registerOwner = async (formData) => {
    try {
      const res = await api.post('/auth/register-owner', formData);
      if (res.data?.success) {
        localStorage.setItem('evhub_token', res.data.token);
        localStorage.setItem('evhub_refresh_token', res.data.refreshToken);
        setToken(res.data.token);
        setUser(res.data.user);
        setOwnerProfile(res.data.ownerProfile);
        toast.success('Host account submitted! Verification in progress.');
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Host registration failed.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('evhub_token');
    localStorage.removeItem('evhub_refresh_token');
    setUser(null);
    setOwnerProfile(null);
    setToken(null);
    toast.success('Signed out successfully.');
  };

  const refreshMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        setOwnerProfile(res.data.ownerProfile || null);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        ownerProfile,
        token,
        loading,
        role: user?.role || null,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isOwner: user?.role === 'OWNER',
        isUser: user?.role === 'USER',
        login,
        registerUser,
        registerOwner,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

