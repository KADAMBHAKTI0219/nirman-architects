import api from '../auth';

/**
 * Get own payroll records
 */
export const getMyPayroll = async (params) => {
  const response = await api.get('/payroll/my', { params });
  return response.data;
};

/**
 * Download own payslip PDF
 */
export const downloadOwnPayslip = async (month, year, employeeName) => {
  const response = await api.get('/payroll/my/download', {
    params: { month, year },
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Payslip_${employeeName.replace(/\s+/g, '_')}_${month}_${year}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { success: true };
};

/**
 * View all employee payroll records (Super Admin / HR)
 */
export const getAllPayroll = async (params) => {
  const response = await api.get('/payroll/all', { params });
  return response.data;
};

/**
 * Generate monthly payroll for all active employees (Super Admin)
 */
export const generateAllPayroll = async (payload) => {
  const response = await api.post('/payroll/generate', payload);
  return response.data;
};

/**
 * Generate monthly payroll for a specific user (Super Admin)
 */
export const generateSingleUserPayroll = async (userId, payload) => {
  const response = await api.post(`/payroll/generate/${userId}`, payload);
  return response.data;
};

/**
 * Download specific employee payslip PDF (Super Admin / HR)
 */
export const downloadEmployeePayslip = async (userId, employeeName, month, year) => {
  const response = await api.get(`/payroll/download/${userId}`, {
    params: { month, year },
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Payslip_${employeeName.replace(/\s+/g, '_')}_${month}_${year}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { success: true };
};

/**
 * Bulk download all employee payslips for a given month as a ZIP file (Super Admin)
 */
export const downloadAllPayslipsZip = async (month, year) => {
  const response = await api.get('/payroll/download-all', {
    params: { month, year },
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Payslips_${month}_${year}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { success: true };
};
