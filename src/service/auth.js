import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://nirman-architects.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Token if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use Bearer token pattern
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Automatically clear session and redirect to login on 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Log in a user.
 * @param {string} email 
 * @param {string} password 
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Register a new workforce member.
 * @param {object} payload - The complete user registration data
 */
export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

/**
 * Create a new user account (Admin / HR).
 * @param {object} payload - User creation payload
 */
export const createUser = async (payload) => {
  const response = await api.post('/users/create', payload);
  return response.data;
};

/**
 * Fetch all roles from the backend and normalize them into an array.
 */
export const getRoles = async () => {
  const response = await api.get('/role-master/all');
  if (response.data && response.data.success) {
    const rolesArray = [];
    // The response returns roles with index keys (e.g. "0", "1", etc.)
    Object.keys(response.data).forEach((key) => {
      if (!isNaN(key)) {
        rolesArray.push(response.data[key]);
      }
    });
    return {
      success: true,
      roles: rolesArray,
      message: response.data.message,
    };
  }
  return response.data || { success: false, message: 'Failed to retrieve roles' };
};

/**
 * Create a new system role (Admin only).
 * @param {object} payload - Contains roleName, roleCode, description
 */
export const createRole = async (payload) => {
  const response = await api.post('/role-master/create', payload);
  return response.data;
};

/**
 * Fetch all registered users from the backend and normalize them into an array.
 */
export const getUsersList = async () => {
  const response = await api.get('/users');
  if (response.data && response.data.success) {
    const usersArray = [];
    // The response returns users with index keys (e.g. "0", "1", etc.)
    Object.keys(response.data).forEach((key) => {
      if (!isNaN(key)) {
        usersArray.push(response.data[key]);
      }
    });
    return {
      success: true,
      users: usersArray,
      message: response.data.message,
    };
  }
  return response.data || { success: false, message: 'Failed to retrieve users' };
};

/**
 * Get detailed profile information of a single user by ID.
 * @param {string} id - The user ID
 */
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

/**
 * Update user details.
 * @param {string} id - The user ID
 * @param {object} payload - The fields to update
 */
export const updateUser = async (id, payload) => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

/**
 * Register or request device binding.
 * @param {string} userId - User ID (optional if authenticated)
 * @param {string} deviceId - Machine GUID / Device ID
 */
export const registerDevice = async (userId, deviceId) => {
  const response = await api.post('/device/register', { userId, deviceId });
  return response.data;
};

/**
 * Get device status for a user.
 * @param {string} userId - Target user ID (optional for self)
 */
export const getDeviceStatus = async (userId) => {
  const response = await api.get('/device/status', { params: { userId } });
  return response.data;
};

/**
 * List pending device change requests (Admin/HR only).
 */
export const getPendingDeviceRequests = async () => {
  const response = await api.get('/device/pending');
  return response.data;
};

/**
 * Approve or reject a device change request (Admin/HR only).
 * @param {string} requestId - Request ID
 * @param {string} action - 'APPROVE' or 'REJECT'
 */
export const approveDevice = async (requestId, action) => {
  const response = await api.post('/device/approve', { requestId, action });
  return response.data;
};

/**
 * Directly assign a Device ID to a user (Admin/HR only).
 * @param {string} targetUserId - Target User ID
 * @param {string} deviceId - Machine GUID / Device ID
 */
export const assignDevice = async (targetUserId, deviceId) => {
  const response = await api.post('/device/assign', { targetUserId, deviceId });
  return response.data;
};

export default api;
