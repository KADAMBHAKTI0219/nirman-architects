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
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  return mockGetAggregatedReviewData(vId);
};
export const getReviewData = getAggregatedReviewData;

// 26.2 POST /api/drawing-versions/:versionId/comments & GET /api/drawing-versions/:versionId/comments
export const postCommentOrNote = async (versionId, { commentText, annotationCoords, isDraft }) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!commentText || !commentText.trim()) {
    throw new Error('commentText is required.');
  }
  return mockPostCommentOrNote(vId, { commentText, annotationCoords, isDraft });
};

export const getVersionComments = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  return mockGetVersionComments(vId);
};

// 26.3 POST /api/drawing-versions/:versionId/markings & GET /api/drawing-versions/:versionId/markings
export const postMarking = async (versionId, { markingType, geometry, color, linkedCommentId }) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  if (!markingType || !geometry) {
    throw new Error('markingType and geometry are required.');
  }
  return mockPostMarking(vId, { markingType, geometry, color, linkedCommentId });
};

export const getVersionMarkings = async (versionId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  return mockGetVersionMarkings(vId);
};

// 26.4 DELETE /api/drawing-versions/:versionId/markings/:markingId
export const deleteMarking = async (versionId, markingId) => {
  const vId = typeof versionId === 'object' && versionId !== null ? (versionId._id || versionId.id) : versionId;
  return mockDeleteMarking(vId, markingId);
};
