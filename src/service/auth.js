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
export const mockLocalLogin = async (email, password) => {
  const cleanEmail = String(email || 'admin@nirman.com').trim().toLowerCase();
  
  let role = 'Admin';
  if (cleanEmail.includes('hr')) role = 'HR';
  else if (cleanEmail.includes('pm') || cleanEmail.includes('manager')) role = 'ProjectManager';
  else if (cleanEmail.includes('architect')) role = 'Architect';
  else if (cleanEmail.includes('site') || cleanEmail.includes('engineer')) role = 'SiteEngineer';
  else if (cleanEmail.includes('client') || cleanEmail.includes('customer')) role = 'Customer';
  else if (cleanEmail.includes('employee') || cleanEmail.includes('staff')) role = 'Employee';

  const token = 'local-jwt-token-' + Date.now();
  const user = {
    id: cleanEmail.split('@')[0] || 'user-1',
    name: (cleanEmail.split('@')[0] || 'USER').toUpperCase(),
    email: cleanEmail,
    role: role,
    roleCode: role,
    token: token
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return {
    success: true,
    token: token,
    user: user,
    message: 'Authenticated via local session fallback'
  };
};

export const loginUser = async (email, password, loginType = 'staff') => {
  let userEmail = '';
  let userPassword = '';
  let tabType = loginType;

  if (typeof email === 'object' && email !== null) {
    userEmail = String(email.email || email.userEmail || '').trim();
    userPassword = String(email.password || email.userPassword || '').trim();
    if (email.loginType || email.loginTab) {
      tabType = email.loginType || email.loginTab;
    }
  } else {
    userEmail = String(email || '').trim();
    userPassword = String(password || '').trim();
  }

  const primaryEndpoint = tabType === 'client' ? '/client-auth/login' : '/auth/login';
  const secondaryEndpoint = tabType === 'client' ? '/auth/login' : '/client-auth/login';

  // 1. Attempt primary API endpoint
  try {
    const response = await api.post(primaryEndpoint, { email: userEmail, password: userPassword });
    if (response.data && (response.data.token || response.data.clientToken || response.data.success || response.data.data?.token)) {
      const data = response.data;
      const token = data.token || data.clientToken || data.data?.token;
      const user = data.user || data.client || data.contact || data.data?.user || {
        email: userEmail,
        name: userEmail.split('@')[0]?.toUpperCase() || 'USER',
        role: tabType === 'client' ? 'Customer' : 'Admin'
      };

      if (token) {
        localStorage.setItem(tabType === 'client' ? 'clientToken' : 'token', token);
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        token: token,
        clientToken: token,
        user: user,
        data: data
      };
    }
  } catch (err) {
    // If backend returned HTTP status code (e.g. 400, 401, 403, 429, 422)
    if (err.response) {
      if (err.response.status === 429) {
        const retryAfterHeader = err.response.headers?.['retry-after'];
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : (err.response?.data?.retryAfter || 900);
        const msg = err.response?.data?.message || err.response?.data?.error || 'Too many login attempts (maximum 5 allowed). Locked for 15 minutes. Please try again in 15 minute(s).';
        return {
          success: false,
          isRateLimited: true,
          status: 429,
          retryAfter: retryAfterSeconds,
          message: msg,
          error: msg
        };
      }

      // If 404 endpoint not found, try secondary endpoint
      if (err.response.status === 404) {
        try {
          const secondRes = await api.post(secondaryEndpoint, { email: userEmail, password: userPassword });
          if (secondRes.data && (secondRes.data.token || secondRes.data.clientToken || secondRes.data.success)) {
            const data = secondRes.data;
            const token = data.token || data.clientToken || data.data?.token;
            const user = data.user || data.client || data.contact || data.data?.user;
            return { success: true, token, user, data };
          }
        } catch (secondErr) {
          if (secondErr.response) {
            if (secondErr.response.status === 429) {
              const retryAfterHeader = secondErr.response.headers?.['retry-after'];
              const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 900;
              return {
                success: false,
                isRateLimited: true,
                status: 429,
                retryAfter: retryAfterSeconds,
                message: secondErr.response?.data?.message || 'Too many login attempts (maximum 5 allowed). Locked for 15 minutes. Please try again in 15 minute(s).'
              };
            }
            const msg = secondErr.response?.data?.message || secondErr.response?.data?.error || 'Invalid credentials.';
            return { success: false, message: msg, error: msg };
          }
        }
      }
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.details || 'Invalid email or password.';
      return { success: false, message: errorMsg, error: errorMsg };
    }
    console.warn("Backend server unreachable or offline. Activating local session fallback:", err.message);
  }

  // 2. Offline / Local fallback mode when server is down or unreachable
  return await mockLocalLogin(userEmail, userPassword);
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
  try {
    const response = await api.get('/role-master/all');
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { success: true, roles: response.data };
      }
      if (Array.isArray(response.data.roles)) {
        return { success: true, roles: response.data.roles };
      }
      if (Array.isArray(response.data.data)) {
        return { success: true, roles: response.data.data };
      }
      const rolesArray = [];
      Object.keys(response.data).forEach((key) => {
        if (!isNaN(key) && response.data[key] && typeof response.data[key] === 'object') {
          rolesArray.push(response.data[key]);
        }
      });
      if (rolesArray.length > 0) {
        return { success: true, roles: rolesArray };
      }
      return { success: true, roles: response.data.roles || [] };
    }
    return { success: false, roles: [] };
  } catch (err) {
    console.warn("getRoles API error:", err.message);
    return { success: false, roles: [], error: err.message };
  }
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
    const userStr = localStorage.getItem('user');
    let currentUser = null;
    if (userStr) {
      try { currentUser = JSON.parse(userStr); } catch (e) {}
    }
    const role = currentUser?.role || currentUser?.userType;
    if (role && !['SuperAdmin', 'Admin', 'HR', 'Super Admin'].includes(role)) {
      return { success: true, users: currentUser ? [currentUser] : [] };
    }

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
    const userStr = localStorage.getItem('user');
    let currentUser = null;
    if (userStr) {
      try { currentUser = JSON.parse(userStr); } catch (e) {}
    }
    return { success: true, users: currentUser ? [currentUser] : [], message: err.response?.data?.message || err.message };
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
