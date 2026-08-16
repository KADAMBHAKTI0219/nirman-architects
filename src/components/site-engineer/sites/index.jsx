import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Users, AlertTriangle, CheckSquare, 
  Layers, Filter, Eye, RefreshCw, Navigation, CheckCircle2
} from 'lucide-react';
import { getSiteLocations, checkGeoFence } from '../../../service/siteLocationService';
import { clockInAttendance } from '../../../service/hrm/attendance';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // GPS Check-in Modal state
  const [selectedSiteForGps, setSelectedSiteForGps] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [geoResult, setGeoResult] = useState(null);
  const [gpsError, setGpsError] = useState('');

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await getSiteLocations();
      if (res.success && Array.isArray(res.locations)) {
        setSites(res.locations.map((loc, idx) => ({
          id: loc._id || loc.id || `site-${idx}`,
          name: loc.projectName || loc.name || `Site ${idx + 1}`,
          project: loc.projectName || loc.name,
          location: `${loc.lat}, ${loc.lng}`,
          lat: loc.lat,
          lng: loc.lng,
          radiusMeters: loc.radiusMeters || 100,
          status: 'Active',
          progress: 45 + (idx * 15) % 50
        })));
      }
    } catch (e) {
      console.error("Failed to load site locations for engineer:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const filteredSites = sites.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // GPS Attendance Check In
  const handleInitiateGpsCheckIn = (site) => {
    setSelectedSiteForGps(site);
    setUserLocation(null);
    setGeoResult(null);
    setGpsError('');

    if (!navigator.geolocation) {
      setGpsError('Location services are not supported by this browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserLocation({ lat: uLat, lng: uLng });

        if (site.lat !== undefined && site.lng !== undefined) {
          const res = checkGeoFence(uLat, uLng, site.lat, site.lng, site.radiusMeters);
          setGeoResult(res);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        let errMsg = 'Unable to determine your current location. Please check your device location/GPS settings.';
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = 'Location permission denied. Please allow location access in your browser settings to use GPS-based functionality.';
        } else if (err.code === err.TIMEOUT) {
          errMsg = 'Location request timed out. Please try again.';
        }
        setGpsError(errMsg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmSiteAttendance = async () => {
    if (!userLocation || !selectedSiteForGps) return;
    try {
      setGpsLoading(true);
      await clockInAttendance({
        mode: 'SITE_MOBILE',
        lat: userLocation.lat,
        lng: userLocation.lng,
        projectId: selectedSiteForGps.id,
        projectName: selectedSiteForGps.name,
        clientTime: new Date().toISOString()
      });
      alert(`Successfully checked in at site "${selectedSiteForGps.name}" via GPS!`);
      setSelectedSiteForGps(null);
    } catch (err) {
      alert(err.message || 'Site attendance check in failed.');
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Navigation className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">My Assigned Sites</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Perform GPS site check-in, view site geo-fences, and log physical progress.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search active site files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] text-xs font-semibold bg-white text-slate-800"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#3B82F6] bg-white font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
          </select>
        </div>
      </div>

      {/* SITES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#3B82F6] mb-2" />
            <p className="text-xs font-bold text-slate-600">Loading assigned sites...</p>
          </div>
        ) : filteredSites.length > 0 ? (
          filteredSites.map(site => (
            <div 
              key={site.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden hover:border-[#3B82F6]/40 transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">{site.project}</span>
                    <strong className="text-slate-900 block text-sm mt-0.5 leading-snug">{site.name}</strong>
                  </div>

                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {site.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{site.location}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-b border-slate-100 py-2">
                    <span className="flex items-center gap-1 text-indigo-600">
                      <Navigation className="w-3.5 h-3.5" />
                      Geo-Fence: {site.radiusMeters} m
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="bg-slate-50/60 p-4 border-t border-slate-100 space-y-3">
                <button
                  onClick={() => handleInitiateGpsCheckIn(site)}
                  className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Site Attendance Check In</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center text-slate-400">
            <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">No assigned sites found</p>
          </div>
        )}
      </div>

      {/* GPS ATTENDANCE CHECK-IN MODAL */}
      {selectedSiteForGps && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">GPS Site Check-In</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{selectedSiteForGps.name}</p>
              </div>
              <button onClick={() => setSelectedSiteForGps(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {gpsLoading ? (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#3B82F6]" />
                <p className="text-xs font-bold text-slate-700">Detecting current GPS location...</p>
              </div>
            ) : gpsError ? (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold space-y-2">
                <p>{gpsError}</p>
                <button
                  onClick={() => handleInitiateGpsCheckIn(selectedSiteForGps)}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Retry GPS Location
                </button>
              </div>
            ) : userLocation ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Current Coordinates</span>
                  <p className="font-bold text-slate-900">Lat: {userLocation.lat.toFixed(6)}</p>
                  <p className="font-bold text-slate-900">Lng: {userLocation.lng.toFixed(6)}</p>
                </div>

                {geoResult && (
                  <div className={`p-3.5 rounded-2xl border font-bold space-y-1 ${
                    geoResult.isWithin ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className="uppercase text-[11px] font-black tracking-wider">
                        {geoResult.isWithin ? 'Inside Site Boundary' : 'Outside Site Area'}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-600">
                      Distance from site: <strong className="text-slate-900">{geoResult.distanceMeters} m</strong> (Max allowed: {geoResult.radiusMeters} m)
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSiteForGps(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSiteAttendance}
                disabled={gpsLoading || !userLocation || (geoResult && !geoResult.isWithin)}
                className="px-5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-extrabold text-xs rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
              >
                Confirm Site Check In
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
