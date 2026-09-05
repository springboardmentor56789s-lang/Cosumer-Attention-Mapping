import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser, authenticateGoogleWorker, registerUser, requestOTP, verifyOTP, authenticateUserOTP } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(false);

  // Auto token refresh simulation
  useEffect(() => {
    if (!token) return;
    const refreshInterval = setInterval(() => {
      const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshed_' + Date.now();
      setToken(newToken);
      localStorage.setItem('access_token', newToken);
    }, 15 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [token]);

  const loginManager = async (email, password) => {
    setLoading(true);
    try {
      const res = await authenticateUser(email, password, 'Manager');
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWorker = async (email, password) => {
    setLoading(true);
    try {
      const res = await authenticateUser(email, password, 'Worker');
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithOTP = async (target, code, expectedRole) => {
    setLoading(true);
    try {
      const res = await authenticateUserOTP(target, code, expectedRole);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const sendOTPCode = async (target, channel = 'email') => {
    try {
      const res = await requestOTP(target, channel);
      return { success: true, message: res.message, demo_otp: res.demo_otp };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const verifyOTPCode = async (target, code) => {
    try {
      const res = await verifyOTP(target, code);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginWorkerGoogle = async () => {
    setLoading(true);
    try {
      const mockGoogleProfile = {
        name: 'Sarah Connor',
        email: 'sarah.worker@retailstore.com',
      };
      const res = await authenticateGoogleWorker(mockGoogleProfile);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const registerNewUser = async (formData) => {
    setLoading(true);
    try {
      const res = await registerUser(formData);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginManager,
        loginWorker,
        loginWithOTP,
        sendOTPCode,
        verifyOTPCode,
        loginWorkerGoogle,
        registerNewUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
