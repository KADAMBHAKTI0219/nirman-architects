import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const EMAIL_ROLE_MAP = {
  'admin@nirman.com': 'Admin',
  'hr@nirman.com': 'HR',
  'pm@nirman.com': 'ProjectManager',
  'architect@nirman.com': 'Architect',
  'engineer@nirman.com': 'SiteEngineer',
  'employee@gmail.com': 'Employee',
  'customer@nirman.com': 'Customer'
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into Authorization header for protected routes only
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isPublicRoute = config.url.includes('/login') || config.url.includes('/register') || config.url.includes('/roles');
    if (token && !isPublicRoute) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling and Auto-Simulation Fallback
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle Connection Refused / Network Failures
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Network failure. Please check your internet connection and retry.',
        errorCode: 'NETWORK_ERROR'
      });
    }

    // Handle normal HTTP errors returned by active backend
    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return Promise.reject({
        success: false,
        message: data?.message || 'Unauthorized',
        errorCode: 'AUTH_REQUIRED'
      });
    }

    if (status === 403) {
      return Promise.reject({
        success: false,
        message: data?.message || 'Access denied for this role',
        errorCode: 'FORBIDDEN'
      });
    }

    return Promise.reject({
      success: false,
      message: data?.message || 'Validation or Server Error',
      errors: data?.errors || null,
      errorCode: data?.errorCode || 'BAD_REQUEST'
    });
  }
);

export default api;
