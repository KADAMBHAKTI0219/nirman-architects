import api from './auth';

/**
 * ERP Module 4 - Drawing Review API Service (26.1 to 26.4)
 */

export const getAggregatedReviewData = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  const res = await api.get(`/drawing-versions/${vId}/review-data`);
  return res.data;
};
export const getReviewData = getAggregatedReviewData;

export const postCommentOrNote = async (versionId, { commentText, annotationCoords, isDraft }) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!commentText || !commentText.trim()) {
    throw new Error('commentText is required.');
  }
  const res = await api.post(`/drawing-versions/${vId}/comments`, { commentText, annotationCoords, isDraft });
  return res.data;
};

export const getVersionComments = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  const res = await api.get(`/drawing-versions/${vId}/comments`);
  return res.data;
};

export const postMarking = async (versionId, { markingType, geometry, color, linkedCommentId }) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!markingType || !geometry) {
    throw new Error('markingType and geometry are required.');
  }
  const res = await api.post(`/drawing-versions/${vId}/markings`, { markingType, geometry, color, linkedCommentId });
  return res.data;
};

export const getVersionMarkings = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  const res = await api.get(`/drawing-versions/${vId}/markings`);
  return res.data;
};

export const deleteMarking = async (versionId, markingId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  const res = await api.delete(`/drawing-versions/${vId}/markings/${markingId}`);
  return res.data;
};

