import { useState, useCallback } from 'react';

/**
 * Custom React Hook for Browser Geolocation Handling
 * Supports native permission prompts, reverse geocoding, error handling,
 * permission state detection, and loading state management.
 */
export function useGeoLocation(options = {}) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState(null);

  const {
    enableHighAccuracy = true,
    timeout = 12000,
    maximumAge = 0,
    reverseGeocode = true
  } = options;

  // Check initial browser permission state via Permissions API if available
  const checkPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setPermissionState('unsupported');
      return 'unsupported';
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(result.state);
        
        result.onchange = () => {
          setPermissionState(result.state);
        };
        return result.state;
      } catch (err) {
        console.warn("Permissions API geolocation query failed:", err);
      }
    }
    return 'prompt';
  }, []);

  // Reverse geocode latitude and longitude into address details via Nominatim
  const fetchAddressDetails = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (!response.ok) throw new Error('Reverse geocoding network response failed');
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';
        const fullAddr = data.display_name || [street, city, state, pincode].filter(Boolean).join(', ');

        return {
          address: fullAddr,
          city,
          state,
          pincode,
          rawDetails: data
        };
      }
    } catch (err) {
      console.warn("Reverse geocoding error or rate limited:", err);
    }
    return {
      address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
      city: '',
      state: '',
      pincode: '',
      rawDetails: null
    };
  };

  const getLocation = useCallback(async (onSuccessCallback) => {
    setLoading(true);
    setError(null);

    // 1. Check Browser Geolocation API support
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const errObj = {
        code: 0,
        type: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your browser.'
      };
      setError(errObj);
      setLoading(false);
      return { success: false, error: errObj };
    }

    // 2. Pre-check permission state if available
    const currentPerm = await checkPermission();
    if (currentPerm === 'denied') {
      const errObj = {
        code: 1,
        type: 'PERMISSION_DENIED',
        message: 'Location permission denied. Please enable location access from your browser settings.'
      };
      setError(errObj);
      setLoading(false);
      return { success: false, error: errObj };
    }

    // 3. Immediately trigger browser native geolocation prompt / fetch
    return new Promise((resolve) => {
      const geoOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          let addressData = {
            address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
            city: '',
            state: '',
            pincode: ''
          };

          if (reverseGeocode) {
            const fetched = await fetchAddressDetails(lat, lng);
            if (fetched) addressData = fetched;
          }

          const locationResult = {
            latitude: lat,
            longitude: lng,
            accuracy,
            timestamp: position.timestamp,
            ...addressData
          };

          setLocation(locationResult);
          setPermissionState('granted');
          setError(null);
          setLoading(false);

          if (onSuccessCallback && typeof onSuccessCallback === 'function') {
            onSuccessCallback(locationResult);
          }

          resolve({ success: true, location: locationResult });
        },
        (err) => {
          let errorMessage = 'An unknown error occurred while retrieving location.';
          let errorType = 'UNKNOWN_ERROR';

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access from your browser settings.';
              errorType = 'PERMISSION_DENIED';
              setPermissionState('denied');
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Your device location is turned off. Please enable Location Services and try again.';
              errorType = 'POSITION_UNAVAILABLE';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              errorType = 'TIMEOUT';
              break;
            default:
              errorMessage = err.message || 'Unable to retrieve location.';
              break;
          }

          const errorObj = {
            code: err.code,
            type: errorType,
            message: errorMessage,
            rawError: err
          };

          setError(errorObj);
          setLoading(false);
          resolve({ success: false, error: errorObj });
        },
        geoOptions
      );
    });
  }, [checkPermission, enableHighAccuracy, timeout, maximumAge, reverseGeocode]);

  return {
    getLocation,
    loading,
    location,
    error,
    permissionState,
    checkPermission,
    clearError: () => setError(null)
  };
}

export default useGeoLocation;
