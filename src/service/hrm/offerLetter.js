import api from '../auth';
import { parseBlobError } from './payroll';

/**
 * Get Offer Letter metadata for a user (history and latest)
 * Endpoint: GET /offer-letter/:userId
 */
export const getOfferLetterMetadata = async (userId) => {
  try {
    const response = await api.get(`/offer-letter/${userId}`);
    const data = response.data;
    if (data?.latest !== undefined || data?.history !== undefined) {
      return { success: true, latest: data.latest || null, history: data.history || [] };
    }
    if (data?.data?.latest !== undefined || data?.data?.history !== undefined) {
      return { success: true, latest: data.data.latest || null, history: data.data.history || [] };
    }
    return { success: true, latest: data, history: [] };
  } catch (err) {
    return { success: false, latest: null, history: [] };
  }
};

/**
 * Download employee Offer Letter PDF
 * Endpoint: GET /offer-letter/:userId/download
 */
export const downloadOfferLetterPDF = async (userId, employeeName) => {
  try {
    const response = await api.get(`/offer-letter/${userId}/download`, {
      responseType: 'blob'
    });

    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const errorMessage = await parseBlobError(response.data);
      throw new Error(errorMessage);
    }

    const safeName = (employeeName || 'employee').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Offer_Letter_${safeName}.pdf`;

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
    return true;
  } catch (err) {
    if (err.response && err.response.data) {
      const parsedMsg = await parseBlobError(err.response.data);
      throw new Error(parsedMsg);
    }
    throw err;
  }
};

/**
 * Regenerate Offer Letter for user
 * Endpoint: POST /offer-letter/:userId/regenerate
 */
export const regenerateOfferLetter = async (userId, payload = {}) => {
  const response = await api.post(`/offer-letter/${userId}/regenerate`, payload);
  return response.data;
};
