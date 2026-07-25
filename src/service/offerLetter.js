import api from './auth';

/**
 * Get Offer Letter metadata for a user (history and latest)
 */
export const getOfferLetterMetadata = async (userId) => {
  const response = await api.get(`/offer-letter/${userId}`);
  return response.data;
};

/**
 * Download employee Offer Letter PDF
 */
export const downloadOfferLetterPDF = async (userId, employeeName) => {
  const response = await api.get(`/offer-letter/${userId}/download`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `OfferLetter_${employeeName.replace(/\s+/g, '_')}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { success: true };
};

/**
 * Regenerate a new version of the Offer Letter for a user (Admin/HR only)
 */
export const regenerateOfferLetter = async (userId, payload) => {
  const response = await api.post(`/offer-letter/${userId}/regenerate`, payload);
  return response.data;
};
