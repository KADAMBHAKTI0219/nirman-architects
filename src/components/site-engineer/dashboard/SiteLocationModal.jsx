import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, XCircle, ShieldAlert, Navigation, RefreshCw, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { checkGeoFence, calculateDistanceInMeters } from '../../../service/siteLocationService';
import useGeoLocation from '../../../hooks/useGeoLocation';

export default function SiteLocationModal({
  isOpen,
  onClose,
  activeSite = { projectName: 'Smart City Mall Foundations', lat: 21.1702, lng: 72.8311, radiusMeters: 150 },
  onConfirmPunchIn
}) {
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [userLocation, setUserLocation] = useState(null);
  const [geoResult, setGeoResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { getLocation, loading: isLoading } = useGeoLocation({
    enableHighAccuracy: true,
    timeout: 12000,
    reverseGeocode: true
  });

  const requestBrowserLocation = async () => {
    setErrorMessage(null);
    const res = await getLocation();

    if (res.success && res.location) {
      const uLat = res.location.latitude;
      const uLng = res.location.longitude;
      setUserLocation({ lat: uLat, lng: uLng, accuracy: res.location.accuracy, address: res.location.address });
      setPermissionState('granted');

      // Verify geofence against active site
      const result = checkGeoFence(uLat, uLng, activeSite.lat, activeSite.lng, activeSite.radiusMeters);
      setGeoResult(result);
    } else if (res.error) {
      setPermissionState('denied');
      setErrorMessage(res.error.message);
    }
  };

  const handleDenyPermission = () => {
    setPermissionState('denied');
    setErrorMessage('Location access denied by user. Geo-fenced site punch-in cannot proceed without GPS verification.');
  };

  // Quick Demo Helper to simulate being on-site (inside geofence)
  const handleSimulateOnSite = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Offset by ~20 meters
      const simLat = activeSite.lat + 0.00015;
      const simLng = activeSite.lng + 0.00015;
      setUserLocation({ lat: simLat, lng: simLng, accuracy: 5 });
      setPermissionState('granted');
      setIsLoading(false);

      const result = checkGeoFence(simLat, simLng, activeSite.lat, activeSite.lng, activeSite.radiusMeters);
      setGeoResult(result);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Site Geo-Fence Verification</h3>
              <p className="text-[11px] text-slate-400">{activeSite.projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          
          {/* STEP 1: INITIAL PROMPT (ALLOW / DENY) */}
          {permissionState === 'prompt' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-sky-50 border-4 border-sky-100 flex items-center justify-center mx-auto text-sky-600">
                <Navigation className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Allow Location Access?</h4>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
                  Nirman NextAlliance requires your real-time GPS location to verify if you are within the allowed 
                  <strong className="text-slate-900 font-bold"> {activeSite.radiusMeters}m site radius</strong> for punch-in.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDenyPermission}
                  className="py-3 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Deny Access
                </button>
                <button
                  onClick={requestBrowserLocation}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-2xl bg-sky-600 text-white font-black hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking GPS...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Allow Location</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSimulateOnSite}
                  className="text-[11px] font-bold text-sky-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <span>⚡ Demo: Simulate On-Site GPS Coordinates</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERMISSION GRANTED & GEOFENCE RESULT */}
          {permissionState === 'granted' && geoResult && (
            <div className="space-y-4">
              
              {/* Geofence Status Card */}
              {geoResult.isWithin ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-emerald-900 text-sm">Inside Geo-Fence Boundary ✅</h5>
                    <p className="text-emerald-700 text-xs mt-1">
                      You are <strong className="font-bold">{geoResult.distanceMeters} meters</strong> from site center. 
                      (Allowed radius: {geoResult.radiusMeters}m). Site Punch-In verified!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-rose-900 text-sm">Outside Site Boundary ❌</h5>
                    <p className="text-rose-700 text-xs mt-1">
                      You are <strong className="font-bold">{geoResult.distanceMeters} meters</strong> away from site center. 
                      You must be within {geoResult.radiusMeters} meters of <strong className="font-bold">{activeSite.projectName}</strong> to punch in.
                    </p>
                  </div>
                </div>
              )}

              {/* Coordinates Breakdown Grid */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center text-[11px] pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">Target Project Site:</span>
                  <span className="font-mono text-slate-800 font-semibold">{activeSite.lat}, {activeSite.lng}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">Your Current GPS:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {userLocation?.lat?.toFixed(4)}, {userLocation?.lng?.toFixed(4)} (±{Math.round(userLocation?.accuracy || 0)}m)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-500">Haversine Distance:</span>
                  <span className={`font-extrabold text-xs ${geoResult.isWithin ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {geoResult.distanceMeters} meters
                  </span>
                </div>
              </div>

              {/* Confirm Punch-In Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={requestBrowserLocation}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-check GPS</span>
                </button>
                <button
                  onClick={() => {
                    if (geoResult.isWithin) {
                      onConfirmPunchIn && onConfirmPunchIn(userLocation, geoResult);
                      onClose();
                    } else {
                      alert("Punch-In Denied: You are outside the allowed site geo-fence radius.");
                    }
                  }}
                  disabled={!geoResult.isWithin}
                  className={`py-2.5 px-5 rounded-xl font-extrabold text-white transition-all shadow-md ${
                    geoResult.isWithin
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed opacity-70'
                  }`}
                >
                  Confirm Punch In
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PERMISSION DENIED OR ERROR */}
          {permissionState === 'denied' && (
            <div className="space-y-4 py-2">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold text-amber-900 text-sm">Location Access Denied</h5>
                  <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                    {errorMessage || 'Browser geolocation permission was denied. Site Engineers must allow location access to punch in at project sites.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSimulateOnSite}
                  className="py-2.5 px-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition-colors"
                >
                  Simulate On-Site GPS
                </button>
                <button
                  onClick={requestBrowserLocation}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Grant / Retry Permission</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
