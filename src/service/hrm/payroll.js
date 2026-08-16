import api from '../auth';

/**
 * Helper to extract error message from a Blob response (when responseType is 'blob')
 */
export const parseBlobError = async (errorOrBlob) => {
  try {
    let blob = errorOrBlob;
    if (errorOrBlob && errorOrBlob.response && errorOrBlob.response.data instanceof Blob) {
      blob = errorOrBlob.response.data;
    }
    if (blob instanceof Blob) {
      const text = await blob.text();
      if (!text || text.trim().length === 0) {
        return 'Backend server error (500) occurred during ZIP compilation.';
      }
      try {
        const parsed = JSON.parse(text);
        let msg = parsed.message || parsed.error || text;
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        return String(msg);
      } catch {
        if (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('Internal Server Error')) {
          return 'Backend server error (500) during ZIP compilation on server.';
        }
        return text.length < 200 ? text : 'Server error occurred during download.';
      }
    }
    let msg = errorOrBlob?.response?.data?.message || errorOrBlob?.message || 'Download failed.';
    if (typeof msg === 'object') msg = JSON.stringify(msg);
    return String(msg);
  } catch (e) {
    return errorOrBlob?.message || 'Download failed.';
  }
};


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
  try {
    const response = await api.get('/payroll/my/download', {
      params: { month, year },
      responseType: 'blob'
    });

    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const errorMessage = await parseBlobError(response.data);
      throw new Error(errorMessage);
    }

    const cleanName = (employeeName || 'Employee').replace(/\s+/g, '_');
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Payslip_${cleanName}_${month}_${year}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (err) {
    const message = await parseBlobError(err);
    throw new Error(message);
  }
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
  try {
    const response = await api.get(`/payroll/download/${userId}`, {
      params: { month, year },
      responseType: 'blob'
    });

    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const errorMessage = await parseBlobError(response.data);
      throw new Error(errorMessage);
    }

    const cleanName = (employeeName || 'Employee').replace(/\s+/g, '_');
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Payslip_${cleanName}_${month}_${year}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (err) {
    const message = await parseBlobError(err);
    throw new Error(message);
  }
};

/**
 * Bulk download all employee payslips for a given month as a ZIP file (Super Admin)
 */
export const downloadAllPayslipsZip = async (month, year) => {
  try {
    const response = await api.get('/payroll/download-all', {
      params: { month, year },
      responseType: 'blob'
    });

    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const errorMessage = await parseBlobError(response.data);
      throw new Error(errorMessage);
    }

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Payslips_${month}_${year}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (err) {
    const message = await parseBlobError(err);
    throw new Error(message);
  }
};

