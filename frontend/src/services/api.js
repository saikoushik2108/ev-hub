import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests and attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('evhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('evhub_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
            { refreshToken }
          );
          if (res.data?.token) {
            localStorage.setItem('evhub_token', res.data.token);
            if (res.data.refreshToken) {
              localStorage.setItem('evhub_refresh_token', res.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('evhub_token');
          localStorage.removeItem('evhub_refresh_token');
          localStorage.removeItem('evhub_user');
          // Optional redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

