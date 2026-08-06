import api from '../auth';

/**
 * Get Offer Letter metadata for a user (history and latest)
 */
export const getOfferLetterMetadata = async (userId) => {
  try {
    const response = await api.get(`/offer-letter/${userId}`);
    return response.data;
  } catch (err) {
    // Graceful fallback when offer letter is not yet generated in backend
    return { success: false, data: { latest: null, history: [] } };
  }
};

/**
 * Download employee Offer Letter PDF
 */
export const downloadOfferLetterPDF = async (userId, employeeName) => {
  try {
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
  } catch (err) {
    console.log("Offer letter PDF notice:", err.message);
    alert("Offer letter PDF file is being initialized for this employee.");
    return { success: false };
  }
};

/**
 * Regenerate a new version of the Offer Letter for a user (Admin/HR only)
 */
export const regenerateOfferLetter = async (userId, payload) => {
  try {
    const response = await api.post(`/offer-letter/${userId}/regenerate`, payload);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};
