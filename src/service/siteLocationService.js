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
 * Configure or update a Project Site Location (PM / HR)
 * POST /site-locations
 */
export const createSiteLocation = async (siteData) => {
  try {
    const response = await api.post('/site-locations', siteData);
    return response.data;
  } catch (error) {
    const existing = JSON.parse(localStorage.getItem('nirman_site_locations') || '[]');
    const newSite = {
      id: siteData.projectId || `site_${Date.now()}`,
      projectId: siteData.projectId || null,
      projectName: siteData.projectName,
      lat: Number(siteData.lat),
      lng: Number(siteData.lng),
      radiusMeters: Number(siteData.radiusMeters || 100),
      updatedAt: new Date().toISOString()
    };
    const index = existing.findIndex(
      (s) => s.projectName === siteData.projectName || (siteData.projectId && s.projectId === siteData.projectId)
    );
    if (index >= 0) {
      existing[index] = newSite;
    } else {
      existing.push(newSite);
    }
    localStorage.setItem('nirman_site_locations', JSON.stringify(existing));
    return { success: true, message: 'Project site location configured successfully.', data: { siteLocation: newSite } };
  }
};

/**
 * Get all project site locations
 * GET /site-locations
 */
export const getSiteLocations = async () => {
  try {
    const response = await api.get('/site-locations');
    return response.data;
  } catch (error) {
    const existing = JSON.parse(localStorage.getItem('nirman_site_locations') || '[]');
    if (existing.length === 0) {
      const defaultSites = [
        { id: 'site1', projectId: 'proj_1', projectName: 'Nirman Commercial Tower', lat: 23.0225, lng: 72.5714, radiusMeters: 200 },
        { id: 'site2', projectId: 'proj_2', projectName: 'Smart City Mall Foundations', lat: 21.1702, lng: 72.8311, radiusMeters: 150 },
        { id: 'site3', projectId: 'proj_3', projectName: 'Metro Station Tunnel Excavation', lat: 23.0300, lng: 72.5800, radiusMeters: 300 }
      ];
      localStorage.setItem('nirman_site_locations', JSON.stringify(defaultSites));
      return { success: true, data: { locations: defaultSites } };
    }
    return { success: true, data: { locations: existing } };
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
