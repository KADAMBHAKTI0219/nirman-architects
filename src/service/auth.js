import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://nirman-architects.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isMockSession = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('clientToken') || '';
  return !token || token.startsWith('mock-') || token.startsWith('mock_');
};

api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || '';
    const isClientEndpoint = requestUrl.includes('/client') || requestUrl.includes('/client-auth') || requestUrl.includes('/client-portal');
    
    const token = isClientEndpoint
      ? (localStorage.getItem('clientToken') || localStorage.getItem('token'))
      : (localStorage.getItem('token') || localStorage.getItem('clientToken'));

    const isLoginEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/client-auth/login');
    if (token && !isLoginEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors safely without kicking client portal users to login screen
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token') || localStorage.getItem('clientToken') || '';
    const isMockToken = !token || token.startsWith('mock-') || token.startsWith('mock_');
    const requestUrl = error.config?.url || '';
    const isLoginEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/client-auth/login');
    const isClientEndpoint = requestUrl.includes('/client') || requestUrl.includes('/client-auth') || requestUrl.includes('/client-portal');
    const isDataEndpoint = isClientEndpoint || requestUrl.includes('/drawings') || requestUrl.includes('/documents') || requestUrl.includes('/projects') || requestUrl.includes('/tasks') || requestUrl.includes('/crm');
    
    const userStr = localStorage.getItem('user') || '';
    const isClientUser = userStr.includes('"isClientPortal":true') || userStr.includes('"Customer"');

    // Do NOT redirect or clear session if this is a client portal endpoint or client user session
    if (error.response && error.response.status === 401 && !isLoginEndpoint && !isMockToken && !isDataEndpoint && !isClientUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('clientToken');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.includes('/login')) {
        window.location.href = '/';
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
  try {
    const response = await api.get('/users');
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { success: true, users: response.data };
      }
      if (Array.isArray(response.data.users)) {
        return { success: true, users: response.data.users };
      }
      if (Array.isArray(response.data.data)) {
        return { success: true, users: response.data.data };
      }
      const usersArray = [];
      Object.keys(response.data).forEach((key) => {
        if (!isNaN(key) && response.data[key] && typeof response.data[key] === 'object') {
          usersArray.push(response.data[key]);
        }
      });
      if (usersArray.length > 0) {
        return { success: true, users: usersArray };
      }
      return response.data;
    }
    return { success: false, users: [] };
  } catch (err) {
    console.error("Error fetching users list:", err);
    return { success: false, users: [], message: err.message };
  }
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

/**
 * Change password for a specific user.
 * @param {string} id - Target User ID
 * @param {object} payload - { newPassword }
 */
export const changeUserPassword = async (id, payload) => {
  const response = await api.put(`/users/${id}/change-password`, payload);
  return response.data;
};

/**
 * Permanently delete user and ALL associated data (Cascade Delete - Admin / HR only).
 * @param {string} userId - Target User ID
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export default api;
