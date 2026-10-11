import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Automatically send/receive httpOnly auth cookies
});

// Request interceptor to attach bearer token as reliable fallback for cross-origin hosting
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gdg_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle transparent token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Skip refresh logic for auth endpoints
    const authUrlPatterns = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/request-otp',
      '/api/auth/send-otp',
      '/api/auth/verify-otp',
      '/api/auth/refresh',
      '/api/auth/logout',
      '/api/auth/me',
    ];

    const isAuthRoute = authUrlPatterns.some((pattern) =>
      originalRequest.url?.includes(pattern)
    );

    if (isAuthRoute || originalRequest._retry) {
      if (originalRequest.url?.includes('/api/auth/refresh') || !isAuthRoute) {
        window.dispatchEvent(new Event('auth:session-expired'));
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt silent refresh via server refresh session cookie
      const refreshRes = await axios.post(
        `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );

      if (refreshRes.data.success) {
        processQueue(null);
        return api(originalRequest);
      } else {
        processQueue(new Error('Refresh failed'));
        window.dispatchEvent(new Event('auth:session-expired'));
        return Promise.reject(error);
      }
    } catch (refreshErr) {
      processQueue(refreshErr);
      window.dispatchEvent(new Event('auth:session-expired'));
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
