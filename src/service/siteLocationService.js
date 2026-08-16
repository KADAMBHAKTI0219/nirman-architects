import api from './auth';

/**
 * Calculate Haversine distance in meters between two GPS coordinates
 */
export function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Configure or update a Project Site Location (PM / HR / Admin)
 * POST /site-locations
 */
export const createSiteLocation = async (siteData) => {
  try {
    const payload = {
      projectId: siteData.projectId || undefined,
      projectName: siteData.projectName,
      lat: Number(siteData.lat),
      lng: Number(siteData.lng),
      radiusMeters: Number(siteData.radiusMeters || 100)
    };
    const response = await api.post('/site-locations', payload);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to save site location';
    throw new Error(msg);
  }
};

/**
 * Get all project site locations
 * GET /site-locations
 */
export const getSiteLocations = async () => {
  try {
    const response = await api.get('/site-locations');
    const resData = response.data;
    let locations = [];
    if (resData) {
      if (Array.isArray(resData.locations)) {
        locations = resData.locations;
      } else if (resData.data && Array.isArray(resData.data.locations)) {
        locations = resData.data.locations;
      } else if (Array.isArray(resData.data)) {
        locations = resData.data;
      } else if (Array.isArray(resData)) {
        locations = resData;
      }
    }
    return { success: true, locations };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Unable to load site locations.';
    return { success: false, message: msg, locations: [] };
  }
};

/**
 * Check if engineer's GPS location is within site geo-fence radius
 */
export function checkGeoFence(userLat, userLng, siteLat, siteLng, radiusMeters = 100) {
  const distance = calculateDistanceInMeters(userLat, userLng, siteLat, siteLng);
  const isWithin = distance <= radiusMeters;
  return {
    isWithin,
    distanceMeters: distance,
    radiusMeters,
    allowed: isWithin
  };
}
