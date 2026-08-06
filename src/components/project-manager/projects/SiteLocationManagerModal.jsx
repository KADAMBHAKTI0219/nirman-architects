import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, RefreshCw, Plus, Shield, Check, X, Compass, Globe, AlertTriangle, Loader2 } from 'lucide-react';
import { createSiteLocation, getSiteLocations } from '../../../service/siteLocationService';
import useGeoLocation from '../../../hooks/useGeoLocation';

export default function SiteLocationManagerModal({ isOpen, onClose }) {
  const [siteLocations, setSiteLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState('proj_1');
  const [projectName, setProjectName] = useState('Nirman Commercial Tower');
  const [lat, setLat] = useState('23.0225');
  const [lng, setLng] = useState('72.5714');
  const [radiusMeters, setRadiusMeters] = useState('100');
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { getLocation, loading: gpsDetecting } = useGeoLocation({
    enableHighAccuracy: true,
    timeout: 12000,
    reverseGeocode: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchLocations();
      setFeedbackMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const res = await getSiteLocations();
      if (res && res.data && res.data.locations) {
        setSiteLocations(res.data.locations);
      }
    } catch (e) {
      console.warn('Failed to load site locations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchCurrentLocation = async () => {
    setFeedbackMessage(null);
    setErrorMessage(null);

    const res = await getLocation();
    if (res.success && res.location) {
      const detectedLat = res.location.latitude.toFixed(6);
      const detectedLng = res.location.longitude.toFixed(6);
      setLat(detectedLat);
      setLng(detectedLng);
      setFeedbackMessage(`✓ Location fetched! Coords set to: ${detectedLat}, ${detectedLng}${res.location.address ? ` (${res.location.address})` : ''}`);
    } else if (res.error) {
      setErrorMessage(res.error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName || !lat || !lng) {
      alert('Please fill in Project Name, Latitude, and Longitude.');
      return;
    }

    setIsSaving(true);
    setFeedbackMessage(null);
    try {
      const payload = {
        projectId,
        projectName,
        lat: Number(lat),
        lng: Number(lng),
        radiusMeters: Number(radiusMeters || 100)
      };
      const res = await createSiteLocation(payload);
      setFeedbackMessage(res.message || 'Project site location configured successfully!');
      fetchLocations();
    } catch (err) {
      alert('Error saving site location: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Configure Site Geo-Fence Location</h3>
              <p className="text-[11px] text-slate-400">PM & HR Control Room: GPS Radius Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {feedbackMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-800 font-bold text-xs flex items-center justify-between animate-in fade-in">
              <span>{feedbackMessage}</span>
              <button onClick={() => setFeedbackMessage(null)} className="text-emerald-600 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-rose-800 font-bold text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Configure Project Site Location</span>
              </span>
              <button
                type="button"
                onClick={handleFetchCurrentLocation}
                disabled={gpsDetecting}
                className="px-3 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-700 font-extrabold hover:bg-sky-50 transition-all text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {gpsDetecting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" /> : <Navigation className="w-3.5 h-3.5 text-sky-600" />}
                <span>{gpsDetecting ? 'Fetching Location...' : 'Use My Current Location'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Nirman Commercial Tower"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Project ID (Optional)</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. proj_1"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Latitude (lat)</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="23.0225"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Longitude (lng)</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="72.5714"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Allowed Geo-Fence Radius in Meters ({radiusMeters}m)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="30"
                    max="1000"
                    step="10"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(e.target.value)}
                    className="flex-1 accent-sky-600 cursor-pointer"
                  />
                  <span className="font-extrabold text-sky-700 bg-sky-100 px-3 py-1 rounded-xl text-xs">
                    {radiusMeters} meters
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-slate-900 text-white font-extrabold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md shadow-slate-900/20 cursor-pointer"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Geo-Fence Location</span>
              </button>
            </div>
          </form>

          {/* Configured Locations List */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">
              Active Configured Site Locations
            </h4>

            {isLoading ? (
              <div className="p-6 text-center text-slate-400 font-semibold">Loading site locations...</div>
            ) : siteLocations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 font-semibold">No site locations configured yet.</div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {siteLocations.map((site) => (
                  <div key={site.id || site._id || site.projectName} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-xs">{site.projectName}</h5>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          GPS: {site.lat}, {site.lng}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px]">
                        Radius: {site.radiusMeters || 100}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
