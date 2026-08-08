import api from '../auth';

/**
 * Leave Management System API Services
 * Matches client controllers & endpoints (6.1 to 6.15)
 */

// 6.1 GET /api/leave-type/active (or /api/leave-master/active)
export const getActiveLeaveTypes = async () => {
  try {
    const response = await api.get('/leave-type/active');
    return response.data;
  } catch (err) {
    const response = await api.get('/leave-master/active');
    return response.data;
  }
};

// 6.2 GET /api/leave-type/all (or /api/leave-master/all)
export const getAllLeaveTypes = async () => {
  try {
    const response = await api.get('/leave-type/all');
    return response.data;
  } catch (err) {
    const response = await api.get('/leave-master/all');
    return response.data;
  }
};

// 6.3 POST /api/leave-type/create (or /api/leave-master/create)
export const createLeaveType = async (payload) => {
  try {
    const response = await api.post('/leave-type/create', payload);
    return response.data;
  } catch (err) {
    const response = await api.post('/leave-master/create', payload);
    return response.data;
  }
};

// 6.4 PUT /api/leave-type/:id/update (or /api/leave-master/:id/update)
export const updateLeaveType = async (id, payload) => {
  try {
    const response = await api.put(`/leave-type/${id}/update`, payload);
    return response.data;
  } catch (err) {
    const response = await api.put(`/leave-master/${id}/update`, payload);
    return response.data;
  }
};

// 6.5 PUT /api/leave-type/:id/deactivate (or /api/leave-master/:id/deactivate)
export const deactivateLeaveType = async (id) => {
  try {
    const response = await api.put(`/leave-type/${id}/deactivate`);
    return response.data;
  } catch (err) {
    const response = await api.put(`/leave-master/${id}/deactivate`);
    return response.data;
  }
};

// 6.6 POST /api/leave/apply
export const applyLeave = async (payload) => {
  const response = await api.post('/leave/apply', payload);
  return response.data;
};

// 6.7 GET /api/leave/my
export const getMyLeaves = async (year) => {
  const response = await api.get('/leave/my', { params: { year } });
  return response.data;
};

// 6.8 POST /api/leave/cancel
export const cancelLeave = async (leaveRequestId) => {
  const response = await api.post('/leave/cancel', { leaveRequestId });
  return response.data;
};

// 6.9 GET /api/leave/pending
export const getPendingLeaveRequests = async () => {
  const response = await api.get('/leave/pending');
  return response.data;
};

// 6.10 POST /api/leave/approve
export const approveLeaveRequest = async (leaveRequestId) => {
  const response = await api.post('/leave/approve', { leaveRequestId });
  return response.data;
};

// 6.11 POST /api/leave/reject
export const rejectLeaveRequest = async (leaveRequestId, rejectionReason = '') => {
  const response = await api.post('/leave/reject', { leaveRequestId, rejectionReason });
  return response.data;
};

// 6.12 GET /api/leave/all
export const getCompanyLeaves = async (params = {}) => {
  const response = await api.get('/leave/all', { params });
  return response.data;
};

// 6.13 GET /api/leave-balance/my (or /api/leave/balance/my)
export const getMyLeaveBalances = async (year) => {
  try {
    const response = await api.get('/leave-balance/my', { params: { year } });
    return response.data;
  } catch (err) {
    const response = await api.get('/leave/balance/my', { params: { year } });
    return response.data;
  }
};

// 6.14 GET /api/leave-balance/:userId (or /api/leave/balance/:userId)
export const getUserBalances = async (userId, year) => {
  try {
    const response = await api.get(`/leave-balance/${userId}`, { params: { year } });
    return response.data;
  } catch (err) {
    const response = await api.get(`/leave/balance/${userId}`, { params: { year } });
    return response.data;
  }
};

// 6.15 POST /api/leave-balance/adjust (or /api/leave/balance/adjust)
export const adjustLeaveBalance = async (payload) => {
  try {
    const response = await api.post('/leave-balance/adjust', payload);
    return response.data;
  } catch (err) {
    const response = await api.post('/leave/balance/adjust', payload);
    return response.data;
  }
};

export const parseIndexedObjectToArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  
  const items = [];
  let i = 0;
  while (res[String(i)] !== undefined || res[i] !== undefined) {
    items.push(res[String(i)] || res[i]);
    i++;
  }
  if (items.length > 0) return items;

  const data = res.data;
  if (data) {
    if (Array.isArray(data)) return data;
    let j = 0;
    const nestedItems = [];
    while (data[String(j)] !== undefined || data[j] !== undefined) {
      nestedItems.push(data[String(j)] || data[j]);
      j++;
    }
    if (nestedItems.length > 0) return nestedItems;
  }
  
  const possibleWrappers = ['requests', 'leaveTypes', 'balances', 'users', 'logs', 'data'];
  for (const wrapper of possibleWrappers) {
    if (res[wrapper]) {
      if (Array.isArray(res[wrapper])) return res[wrapper];
      let k = 0;
      const wrappedItems = [];
      const sub = res[wrapper];
      while (sub[String(k)] !== undefined || sub[k] !== undefined) {
        wrappedItems.push(sub[String(k)] || sub[k]);
        k++;
      }
      if (wrappedItems.length > 0) return wrappedItems;
    }
  }

  return [];
};

export default api;
