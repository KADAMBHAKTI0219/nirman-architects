import api, { isMockSession } from './auth';
import {
  mockGetAggregatedReviewData,
  mockPostCommentOrNote,
  mockGetVersionComments,
  mockPostMarking,
  mockGetVersionMarkings,
  mockDeleteMarking
} from './mockApi';

const isMongoObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

/**
 * ERP Module 4 - Drawing Review API Service (26.1 to 26.4)
 */

// 26.1 GET /api/drawing-versions/:versionId/review-data
export const getAggregatedReviewData = async (versionId) => {
  if (!isMongoObjectId(versionId) || isMockSession()) {
    return mockGetAggregatedReviewData(versionId);
  }
  try {
    const response = await api.get(`/drawing-versions/${versionId}/review-data`);
    return response.data;
  } catch (error) {
    return mockGetAggregatedReviewData(versionId);
  }
};
export const getReviewData = getAggregatedReviewData;

// 26.2 POST /api/drawing-versions/:versionId/comments & GET /api/drawing-versions/:versionId/comments
export const postCommentOrNote = async (versionId, { commentText, annotationCoords, isDraft }) => {
  if (!commentText || !commentText.trim()) {
    throw new Error('commentText is required.');
  }
  if (!isMongoObjectId(versionId) || isMockSession()) {
    return mockPostCommentOrNote(versionId, { commentText, annotationCoords, isDraft });
  }
  try {
    const response = await api.post(`/drawing-versions/${versionId}/comments`, {
      commentText,
      annotationCoords,
      isDraft
    });
    return response.data;
  } catch (error) {
    return mockPostCommentOrNote(versionId, { commentText, annotationCoords, isDraft });
  }
};

export const getVersionComments = async (versionId) => {
  if (!isMongoObjectId(versionId) || isMockSession()) {
    return mockGetVersionComments(versionId);
  }
  try {
    const response = await api.get(`/drawing-versions/${versionId}/comments`);
    return response.data;
  } catch (error) {
    return mockGetVersionComments(versionId);
  }
};

// 26.3 POST /api/drawing-versions/:versionId/markings & GET /api/drawing-versions/:versionId/markings
export const postMarking = async (versionId, { markingType, geometry, color, linkedCommentId }) => {
  if (!markingType || !geometry) {
    throw new Error('markingType and geometry are required.');
  }
  if (!isMongoObjectId(versionId) || isMockSession()) {
    return mockPostMarking(versionId, { markingType, geometry, color, linkedCommentId });
  }
  try {
    const response = await api.post(`/drawing-versions/${versionId}/markings`, {
      markingType,
      geometry,
      color,
      linkedCommentId
    });
    return response.data;
  } catch (error) {
    return mockPostMarking(versionId, { markingType, geometry, color, linkedCommentId });
  }
};

export const getVersionMarkings = async (versionId) => {
  if (!isMongoObjectId(versionId) || isMockSession()) {
    return mockGetVersionMarkings(versionId);
  }
  try {
    const response = await api.get(`/drawing-versions/${versionId}/markings`);
    return response.data;
  } catch (error) {
    return mockGetVersionMarkings(versionId);
  }
};

// 26.4 DELETE /api/drawing-versions/:versionId/markings/:markingId
export const deleteMarking = async (versionId, markingId) => {
  if (!isMongoObjectId(versionId) || isMockSession()) {
    return mockDeleteMarking(versionId, markingId);
  }
  try {
    const response = await api.delete(`/drawing-versions/${versionId}/markings/${markingId}`);
    return response.data;
  } catch (error) {
    return mockDeleteMarking(versionId, markingId);
  }
};
