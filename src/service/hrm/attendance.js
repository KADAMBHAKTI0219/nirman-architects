import api from '../auth';

/**
 * Get Today's Attendance Status
 * Access: All roles
 */
export const getTodayAttendance = async () => {
  const response = await api.get('/attendance/today');
  return response.data;
};

/**
 * Get own attendance history
 * Access: All roles
 * @param {object} params - { month, year } (optional)
 */
export const getMyAttendance = async (params) => {
  const response = await api.get('/attendance/my', { params });
  return response.data;
};

/**
 * Get all attendance records (HR / SuperAdmin)
 * Access: HR / SuperAdmin
 * @param {object} params - { month, year, userId } (optional)
 */
export const getAllAttendanceList = async (params) => {
  const response = await api.get('/attendance/all', { params });
  return response.data;
};

export default api;
