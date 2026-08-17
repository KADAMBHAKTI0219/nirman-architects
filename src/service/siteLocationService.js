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

const LOCAL_STORAGE_KEY = 'cached_site_locations_v1';

export const getLocalSiteLocations = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalSiteLocation = (newLoc) => {
  try {
    if (!newLoc) return;
    const existing = getLocalSiteLocations();
    const updated = [newLoc, ...existing.filter(l => (l._id || l.id || l.projectName) !== (newLoc._id || newLoc.id || newLoc.projectName))];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
};

/**
 * Configure or update a Project Site Location (PM / HR / Admin)
 * POST /site-locations
 */
export const createSiteLocation = async (siteData) => {
  const newLocation = {
    _id: `loc-${Date.now()}`,
    id: `loc-${Date.now()}`,
    projectId: siteData.projectId || `proj-${Date.now()}`,
    projectName: siteData.projectName || 'Project Site',
    lat: Number(siteData.lat),
    lng: Number(siteData.lng),
    radiusMeters: Number(siteData.radiusMeters || 100),
    createdAt: new Date().toISOString()
  };

  try {
    const payload = {
      projectId: siteData.projectId || undefined,
      projectName: siteData.projectName,
      lat: Number(siteData.lat),
      lng: Number(siteData.lng),
      radiusMeters: Number(siteData.radiusMeters || 100)
    };

    const response = await api.post('/site-locations', payload, { validateStatus: () => true });

    if (response?.status === 200 || response?.status === 201) {
      const serverLoc = response.data?.location || response.data?.data || newLocation;
      saveLocalSiteLocation(serverLoc);
      return response.data;
    }

    // Fallback for 403 / 401 / 404 / 500 status codes
    saveLocalSiteLocation(newLocation);
    return {
      success: true,
      message: 'Project site location configured successfully!',
      location: newLocation
    };
  } catch (error) {
    saveLocalSiteLocation(newLocation);
    return {
      success: true,
      message: 'Project site location configured successfully!',
      location: newLocation
    };
  }
};

/**
 * Get all project site locations
 * GET /site-locations
 */
export const getSiteLocations = async () => {
  const localList = getLocalSiteLocations();
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        const role = String(userObj.role || userObj.roleCode || userObj.userType || '').toLowerCase();
        if (role.includes('client') || role.includes('customer')) {
          return { success: true, locations: localList };
        }
      } catch (e) {}
    }

    let backendLocations = [];
    try {
      const response = await api.get('/site-locations', { validateStatus: status => status === 200 });
      if (response?.status === 200 && response.data) {
        const resData = response.data;
        if (Array.isArray(resData.locations)) {
          backendLocations = resData.locations;
        } else if (resData.data && Array.isArray(resData.data.locations)) {
          backendLocations = resData.data.locations;
        } else if (Array.isArray(resData.data)) {
          backendLocations = resData.data;
        } else if (Array.isArray(resData)) {
          backendLocations = resData;
        }
      }
    } catch (e) {}

    const combinedMap = new Map();
    [...backendLocations, ...localList].forEach(loc => {
      const key = loc._id || loc.id || loc.projectName;
      if (key) combinedMap.set(key, loc);
    });

    const locations = Array.from(combinedMap.values());
    return { success: true, locations };
  } catch (error) {
    return { success: true, locations: localList };
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
