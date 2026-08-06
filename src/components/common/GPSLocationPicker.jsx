import React, { useEffect } from 'react';
import { MapPin, Loader2, AlertTriangle, CheckCircle2, RefreshCw, Compass } from 'lucide-react';
import useGeoLocation from '../../hooks/useGeoLocation';

/**
 * Reusable GPS Location Picker Component
 * Provides a "Use My GPS Location" button with automatic browser native
 * location permission prompt, loading spinners, reverse geocoding & error alerts.
 */
export default function GPSLocationPicker({
  onLocationSelect,
  currentAddress = '',
  currentLat = '',
  currentLng = '',
  className = '',
  showCoordinates = true,
  autoPromptOnMount = false
}) {
  const {
    getLocation,
    loading,
    location,
    error,
    permissionState,
    checkPermission,
    clearError
  } = useGeoLocation({
    enableHighAccuracy: true,
    timeout: 12000,
    reverseGeocode: true
  });

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    if (autoPromptOnMount) {
      handleFetchLocation();
    }
  }, [autoPromptOnMount]);

  const handleFetchLocation = async () => {
    const result = await getLocation();
    if (result.success && result.location) {
      if (onLocationSelect && typeof onLocationSelect === 'function') {
        onLocationSelect(result.location);
      }
    }
  };

  const activeLat = location ? location.latitude : currentLat;
  const activeLng = location ? location.longitude : currentLng;
  const activeAddr = location ? location.address : currentAddress;

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      
      {/* 1. MAIN GPS FETCH BUTTON */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleFetchLocation}
          disabled={loading}
          className={`px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-brand-secondary/40 disabled:opacity-60 disabled:cursor-not-allowed ${
            loading ? 'animate-pulse' : ''
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              <span>Fetching Location...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-slate-900 stroke-[2.5]" />
              <span>Use My GPS Location</span>
            </>
          )}
        </button>

        {permissionState === 'denied' && (
          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
            📍 Permission Blocked
          </span>
        )}
      </div>

      {/* 2. ERROR GUIDANCE BANNER */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-xs font-semibold animate-in fade-in duration-150">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <strong className="block text-rose-900 font-black">Location Access Issue</strong>
            <p className="text-[11px] leading-relaxed text-rose-700">{error.message}</p>
            {error.type === 'PERMISSION_DENIED' && (
              <p className="text-[10px] text-rose-600 font-medium">
                💡 Tip: Click the padlock/location icon in your browser's address bar to set Location permissions to <strong>"Allow"</strong>.
              </p>
            )}
          </div>
          <button 
            type="button" 
            onClick={clearError}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold shrink-0 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. SUCCESS DISPLAY BANNER */}
      {activeAddr && !error && (
        <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-start justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5 border border-emerald-200/60">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-xs">Current Location Details</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded uppercase">
                  Verified GPS
                </span>
              </div>
              <p className="text-slate-600 font-medium text-xs leading-normal">{activeAddr}</p>
              
              {showCoordinates && activeLat && activeLng && (
                <span className="text-[10px] text-slate-400 font-mono font-bold block mt-1">
                  Coords: {activeLat.toFixed(6)}, {activeLng.toFixed(6)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleFetchLocation}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer shrink-0"
            title="Refresh GPS Coordinates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

    </div>
  );
}
