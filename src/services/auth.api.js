import api from './api';

export const getRoles = async () => {
  return api.get('/roles');
};

export const register = async (payload) => {
  try {
    return await api.post('/register', payload);
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const getMe = async () => {
  try {
    return await api.get('/auth/me');
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      const isSiteEngineer = user.role?.toLowerCase().includes('site');
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (isSiteEngineer) {
        await api.post('/attendance/site/checkout', {
          projectId: '6a607dae7f99c70902371c1d',
          lat: 23.0225,
          lng: 72.5714
        }, { headers });
      } else {
        await api.post('/attendance/office/event', {
          userId: user.id,
          deviceId: user.registeredDeviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb',
          type: 'CLOCK_OUT',
          source: 'SYSTEM_SHUTDOWN',
          time: new Date().toISOString()
        }, { headers });
      }
    }
  } catch (err) {
    console.error("Logout auto-clockout failed:", err);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const getUsers = async () => {
  return api.get('/users');
};
