import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verify session on mount.
   * Cookies are sent automatically by the browser. If the short-lived access
   * token has expired, the axios response interceptor will transparently call
   * /api/auth/refresh (using the long-lived refresh token cookie) and replay
   * the /api/auth/me request. This keeps users logged in across browser
   * restarts for up to 7 days.
   */
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        return res.data.user;
      }
      setUser(null);
      return null;
    } catch (err) {
      // The axios interceptor already tried to refresh; if we still got an
      // error the session is truly expired — clean up local state.
      localStorage.removeItem('gdg_token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for session-expired events from the axios interceptor
  useEffect(() => {
    const handleExpired = () => {
      localStorage.removeItem('gdg_token');
      setUser(null);
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
  }, []);

  /**
   * Lightweight email existence check — no OTP is sent.
   * Returns { exists: boolean, email: string }
   */
  const checkEmail = async (email) => {
    const res = await api.post('/api/auth/check-email', { email });
    return res.data;
  };

  /**
   * Request a 6-digit OTP sent to user's real email address
   */
  const requestOtp = async (email, type = 'login') => {
    const res = await api.post('/api/auth/request-otp', { email, type });
    return res.data;
  };

  /**
   * Alias for requestOtp for backward compatibility
   */
  const sendOtp = async (email, type = 'login') => {
    return requestOtp(email, type);
  };

  /**
   * Verify 6-digit OTP and establish session
   */
  const verifyOtp = async (email, otp, name = '', password = '') => {
    const res = await api.post('/api/auth/verify-otp', { email, otp, name, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem('gdg_token', res.data.token);
      }
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data.message };
  };

  /**
   * Legacy password login (for backwards compatibility)
   */
  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem('gdg_token', res.data.token);
      }
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data.message };
  };

  /**
   * Revoke session and log out
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Clear client state even if network call fails
    }
    localStorage.removeItem('gdg_token');
    setUser(null);
  }, []);

  // Server-authorized admin flag
  const isAdmin = Boolean(user?.isAdmin || user?.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        checkEmail,
        requestOtp,
        sendOtp,
        verifyOtp,
        login,
        logout,
        checkAuth,
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

export default AuthContext;
