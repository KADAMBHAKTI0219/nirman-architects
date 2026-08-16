import React, { useState, useEffect } from 'react';
import { 
  MapPin, Search, Plus, Eye, Users, HardHat, Navigation, 
  X, Filter, Building2, AlertCircle, RefreshCw, Compass, CheckCircle2
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { getSiteLocations, createSiteLocation } from '../../../service/siteLocationService';
import { getProjects } from '../../../service/project';

export default function WorkLocationsPage() {
  const { showToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Geolocation detection state
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Add Location Form Data
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    lat: '',
    lng: '',
    radiusMeters: 100
  });

  // Load Real Backend Site Locations
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSiteLocations();
      if (res.success && Array.isArray(res.locations)) {
        setLocations(res.locations);
      } else {
        setError(res.message || 'Unable to load site locations.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load site locations.');
    } finally {
      setLoading(false);
    }
  };

  // Load Real Projects for Dropdown
  const fetchProjectsList = async () => {
    setProjectsLoading(true);
    try {
      const res = await getProjects();
      if (res.success && Array.isArray(res.projects)) {
        setProjects(res.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchProjectsList();
  }, []);

  // Filter site locations
  const filteredLocs = locations.filter(item => {
    const pName = (item.projectName || item.name || '').toLowerCase();
    const pAddress = `${item.lat || ''}, ${item.lng || ''}`.toLowerCase();
    const query = searchTerm.toLowerCase();
    return pName.includes(query) || pAddress.includes(query);
  });

  const handleOpenAddModal = () => {
    setFormData({
      projectId: '',
      projectName: '',
      lat: '',
      lng: '',
      radiusMeters: 100
    });
    setGpsError('');
    setShowAddModal(true);
  };

  // Browser Geolocation Detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      const msg = 'Location services are not supported by this browser.';
      setGpsError(msg);
      showToast(msg, 'error');
      return;
    }

    setDetectingGps(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        }));
        setDetectingGps(false);
        showToast(`GPS location detected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'success');
      },
      (geoErr) => {
        setDetectingGps(false);
        let errMsg = 'Unable to determine your current location. Please check your device location/GPS settings.';
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          errMsg = 'Location permission denied. Please allow location access in your browser settings to use GPS-based functionality.';
        } else if (geoErr.code === geoErr.TIMEOUT) {
          errMsg = 'Location request timed out. Please try again.';
        }
        setGpsError(errMsg);
        showToast(errMsg, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Project Selection in Dropdown
  const handleProjectSelect = (e) => {
    const selectedId = e.target.value;
    const projObj = projects.find(p => String(p._id || p.id) === String(selectedId));
    setFormData(prev => ({
      ...prev,
      projectId: selectedId,
      projectName: projObj ? (projObj.projectName || projObj.name || '') : prev.projectName
    }));
  };

  // Submit Site Location Create
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      showToast('Project name is required', 'error');
      return;
    }
    if (!formData.lat || !formData.lng) {
      showToast('Latitude and Longitude coordinates are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await createSiteLocation({
        projectId: formData.projectId || undefined,
        projectName: formData.projectName.trim(),
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        radiusMeters: Number(formData.radiusMeters || 100)
      });
      showToast('Site location configured successfully.', 'success');
      setShowAddModal(false);
      fetchLocations();
    } catch (err) {
      showToast(err.message || 'Failed to configure site location.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-brand-soft text-brand-dark rounded-xl border border-brand-primary/30">
              <MapPin className="w-5 h-5 text-brand-dark" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Work Locations</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure project GPS coordinates, geo-fence radiuses, and site check-in boundaries.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 hover:text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 uppercase tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>Add Site Location</span>
        </button>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Work Sites</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{locations.length}</span>
          </div>
          <div className="p-3 bg-brand-soft text-brand-dark rounded-2xl border border-brand-primary/20">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Geo-Fences</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{locations.length}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <HardHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">GPS Status</span>
            <span className="text-2xl font-black text-brand-dark mt-1 block">Live</span>
          </div>
          <div className="p-3 bg-brand-soft text-brand-dark rounded-2xl border border-brand-primary/20">
            <Navigation className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Refresh */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search project name or coordinates..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-brand-secondary bg-slate-50/50"
          />
        </div>

        <button
          onClick={fetchLocations}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-soft hover:bg-brand-primary/30 text-slate-900 border border-brand-primary/30 font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-4xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-dark ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchLocations}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Real Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">PROJECT NAME</th>
                <th className="py-3.5 px-4">COORDINATES (LAT, LNG)</th>
                <th className="py-3.5 px-4">GEO-FENCE RADIUS</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-dark mb-2" />
                    <p className="text-xs font-bold text-slate-600">Loading site locations...</p>
                  </td>
                </tr>
              ) : filteredLocs.length > 0 ? (
                filteredLocs.map((loc, idx) => (
                  <tr key={loc._id || loc.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary/40 to-brand-secondary/50 border border-brand-secondary/30 text-slate-900 flex items-center justify-center font-bold shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{loc.projectName || loc.name || 'Site Location'}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{loc.projectId || `LOC-${idx + 1}`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {loc.lat !== undefined && loc.lng !== undefined ? `${loc.lat}, ${loc.lng}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-brand-soft text-brand-dark border border-brand-primary/30 rounded-lg font-bold">
                        <Navigation className="w-3 h-3 text-brand-dark" />
                        {loc.radiusMeters || loc.radius || 100} m Radius
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Active Site
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedLoc(loc); setShowViewModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-brand-dark hover:bg-brand-soft rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No work locations found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add Site Location" to configure project coordinates.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD SITE LOCATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Add Site Location</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Configure project GPS coordinates & geo-fence boundary</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              {/* Project Dropdown */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider">
                  Select Project <span className="text-slate-400 font-medium">(Optional)</span>
                </label>
                <select
                  value={formData.projectId}
                  onChange={handleProjectSelect}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-secondary bg-white font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="">Select Project ▼</option>
                  {projects.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.projectName || p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Name Text Input */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. Villa Project / Commercial Tower"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-secondary bg-slate-50/50 text-slate-900 font-semibold"
                />
              </div>

              {/* GPS Coordinates Section with "Use My Current Location" button */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-brand-dark" />
                    GPS Location Coordinates
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={detectingGps}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 hover:text-white text-[11px] font-black uppercase rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {detectingGps ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting location...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Use My Current Location</span>
                      </>
                    )}
                  </button>
                </div>

                {gpsError && (
                  <p className="text-rose-500 text-[10px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{gpsError}</span>
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="e.g. 23.022500"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-secondary bg-white font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      placeholder="e.g. 72.571400"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-secondary bg-white font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Geo-Fence Radius */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px] tracking-wider">
                  Geo-Fence Radius (Meters) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  max={5000}
                  value={formData.radiusMeters}
                  onChange={(e) => setFormData({ ...formData, radiusMeters: e.target.value })}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-secondary bg-slate-50/50 font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 hover:text-white font-black uppercase text-xs rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving site location...</span>
                    </>
                  ) : (
                    <span>Create Site Location</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. VIEW DETAILS MODAL */}
      {showViewModal && selectedLoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-soft text-brand-dark rounded-xl font-bold border border-brand-primary/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedLoc.projectName || selectedLoc.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{selectedLoc.projectId || selectedLoc._id}</span>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Latitude</span>
                <p className="font-mono font-bold text-slate-800 text-sm">{selectedLoc.lat}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Longitude</span>
                <p className="font-mono font-bold text-slate-800 text-sm">{selectedLoc.lng}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Geo-Fence Radius</span>
                <p className="font-extrabold text-brand-dark text-sm">{selectedLoc.radiusMeters || selectedLoc.radius || 100} meters</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
