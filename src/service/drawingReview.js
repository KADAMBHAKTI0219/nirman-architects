import api, { isMockSession } from './auth';
import {
  mockGetAggregatedReviewData,
  mockPostCommentOrNote,
  mockGetVersionComments,
  mockPostMarking,
  mockGetVersionMarkings,
  mockDeleteMarking
} from './mockApi';

/**
 * ERP Module 4 - Drawing Review API Service (26.1 to 26.4)
 */

const isMongoObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

// 26.1 GET /api/drawing-versions/:versionId/review-data
export const getAggregatedReviewData = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockGetAggregatedReviewData(vId);
  }
  try {
    const res = await api.get(`/drawing-versions/${vId}/review-data`);
    if (res.data && res.data.success) return res.data;
  } catch (err) {}
  return mockGetAggregatedReviewData(vId);
};
export const getReviewData = getAggregatedReviewData;

// 26.2 POST /api/drawing-versions/:versionId/comments & GET /api/drawing-versions/:versionId/comments
export const postCommentOrNote = async (versionId, { commentText, annotationCoords, isDraft }) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!commentText || !commentText.trim()) {
    throw new Error('commentText is required.');
  }
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockPostCommentOrNote(vId, { commentText, annotationCoords, isDraft });
  }
  try {
    const res = await api.post(`/drawing-versions/${vId}/comments`, { commentText, annotationCoords, isDraft });
    if (res.data && res.data.success) return res.data;
  } catch (err) {}
  return mockPostCommentOrNote(vId, { commentText, annotationCoords, isDraft });
};

export const getVersionComments = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockGetVersionComments(vId);
  }
  try {
    const res = await api.get(`/drawing-versions/${vId}/comments`);
    if (res.data && res.data.success) return res.data;
  } catch (err) {}
  return mockGetVersionComments(vId);
};

// 26.3 POST /api/drawing-versions/:versionId/markings & GET /api/drawing-versions/:versionId/markings
export const postMarking = async (versionId, { markingType, geometry, color, linkedCommentId }) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!markingType || !geometry) {
    throw new Error('markingType and geometry are required.');
  }
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockPostMarking(vId, { markingType, geometry, color, linkedCommentId });
  }
  try {
    const res = await api.post(`/drawing-versions/${vId}/markings`, { markingType, geometry, color, linkedCommentId });
    if (res.data && res.data.success) return res.data;
  } catch (err) {}
  return mockPostMarking(vId, { markingType, geometry, color, linkedCommentId });
};

export const getVersionMarkings = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockGetVersionMarkings(vId);
  }
  try {
    const res = await api.get(`/drawing-versions/${vId}/markings`);
    if (res.data && res.data.success) return res.data;
  } catch (err) {}
  return mockGetVersionMarkings(vId);
};

// 26.4 DELETE /api/drawing-versions/:versionId/markings/:markingId
export const deleteMarking = async (versionId, markingId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockDeleteMarking(vId, markingId);
  }
  try {
    const res = await api.delete(`/drawing-versions/${vId}/markings/${markingId}`);
    if (res.data && res.data.success) return res.data;
  } catch (err) {}
  return mockDeleteMarking(vId, markingId);
};
