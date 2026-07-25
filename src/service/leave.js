import api from './auth';

/**
 * Apply for Leave
 * @param {object} payload - { leaveTypeId, fromDate, toDate, reason }
 */
export const applyLeave = async (payload) => {
  const response = await api.post('/leave/apply', payload);
  return response.data;
};

/**
 * Get own leave history and current balances
 */
export const getMyLeaves = async (year) => {
  const response = await api.get('/leave/my', { params: { year } });
  return response.data;
};

/**
 * Cancel own pending leave request
 * @param {string} leaveRequestId
 */
export const cancelLeave = async (leaveRequestId) => {
  const response = await api.post('/leave/cancel', { leaveRequestId });
  return response.data;
};

/**
 * Get pending leave requests queue (Super Admin / HR)
 */
export const getPendingLeaveRequests = async () => {
  const response = await api.get('/leave/pending');
  return response.data;
};

/**
 * Approve Leave Request (Super Admin)
 * @param {string} leaveRequestId
 */
export const approveLeaveRequest = async (leaveRequestId) => {
  const response = await api.post('/leave/approve', { leaveRequestId });
  return response.data;
};

/**
 * Reject Leave Request (Super Admin)
 * @param {string} leaveRequestId
 * @param {string} rejectionReason
 */
export const rejectLeaveRequest = async (leaveRequestId, rejectionReason) => {
  const response = await api.post('/leave/reject', { leaveRequestId, rejectionReason });
  return response.data;
};

/**
 * Get company-wide leave requests (HR / Super Admin)
 */
export const getCompanyLeaves = async (params) => {
  const response = await api.get('/leave/all', { params });
  return response.data;
};

/**
 * Manual Balance Adjustment (HR / SuperAdmin)
 * @param {object} payload - { targetUserId, leaveTypeId, newValue, reason }
 */
export const adjustLeaveBalance = async (payload) => {
  const response = await api.post('/leave/balance/adjust', payload);
  return response.data;
};

/**
 * Get leave balances by User ID (HR / SuperAdmin)
 * @param {string} userId
 * @param {number} year
 */
export const getUserBalances = async (userId, year) => {
  const response = await api.get(`/leave/balance/${userId}`, { params: { year } });
  return response.data;
};

/**
 * Get active leave types for dynamic dropdowns (All Roles)
 */
export const getActiveLeaveTypes = async () => {
  const response = await api.get('/leave-master/active');
  return response.data;
};

/**
 * Get all leave types (Super Admin)
 */
export const getAllLeaveTypes = async () => {
  const response = await api.get('/leave-master/all');
  return response.data;
};

/**
 * Create dynamic Leave Type (Super Admin)
 * @param {object} payload - { name, code, isPaid, defaultQuotaPerYear }
 */
export const createLeaveType = async (payload) => {
  const response = await api.post('/leave-master/create', payload);
  return response.data;
};

/**
 * Update an existing Leave Type (Super Admin)
 * @param {string} id
 * @param {object} payload - { name, isPaid, defaultQuotaPerYear, isActive }
 */
export const updateLeaveType = async (id, payload) => {
  const response = await api.put(`/leave-master/${id}/update`, payload);
  return response.data;
};

/**
 * Deactivate a Leave Type (Super Admin)
 * @param {string} id
 */
export const deactivateLeaveType = async (id) => {
  const response = await api.put(`/leave-master/${id}/deactivate`);
  return response.data;
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
