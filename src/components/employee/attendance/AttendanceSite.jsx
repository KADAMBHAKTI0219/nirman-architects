import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Camera, ShieldCheck, AlertCircle } from 'lucide-react';
import { siteCheckin, siteCheckout, getSiteLocations } from '../../../services/attendance.api';

export default function AttendanceSite() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [projectId, setProjectId] = useState('6a607dae7f99c70902371c1d'); // Default master project ID
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sites, setSites] = useState([]);

  // Fetch coordinates on mount to show preview
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("Geolocation permission not granted yet:", err.message);
        }
      );
    }
  }, []);

  // Load dynamic site locations from backend
  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await getSiteLocations();
        if (res.success && res.locations) {
          setSites(res.locations);
          if (res.locations.length > 0) {
            // Find active Noida or default project site
            setProjectId(res.locations[0].projectId || res.locations[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load project sites:", err);
      }
    };
    loadSites();
  }, []);

  const handleToggle = async () => {
    if (!selfieCaptured && !isCheckedIn) {
      alert("Please capture a verification selfie before checking in at the site.");
      return;
    }

    const savedUser = localStorage.getItem('user');
    const userId = savedUser ? JSON.parse(savedUser).id : null;
    if (!userId) {
      alert("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    setError('');

    // Fetch fresh coordinates from browser Geolocation API
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        try {
          if (!isCheckedIn) {
            // Trigger site check-in API
            const response = await siteCheckin(userId, projectId, lat, lng, "https://storage.nirman.com/selfies/checkin.jpg");
            setIsCheckedIn(true);
            alert(response.message || "Site GPS Check-In recorded successfully!");
          } else {
            // Trigger site check-out API
            const response = await siteCheckout(userId, projectId, lat, lng);
            setIsCheckedIn(false);
            setSelfieCaptured(false);
            alert(response.message || "Site Clock Out logged successfully!");
          }
        } catch (err) {
          console.error("GPS Check-In/Out failed:", err);
          setError(err.message || "Geo-fence check failed or site bounds rejection.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Failed to retrieve GPS position:", err);
        setError("Could not retrieve GPS coordinates. Please enable device location settings.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Upper Layout: Site Coordinates Map + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Real Geolocation coordinates and radial zone map representation */}
        <div className="lg:col-span-2 bg-[#0B1E33] border border-slate-800 rounded-3xl p-6 relative overflow-hidden h-[340px] flex flex-col justify-between shadow-inner">
          <div className="flex justify-between items-start z-10">
            <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-sky-405 font-bold flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span>GEO-FENCE RADIAL RANGE</span>
            </div>
            {coords.lat && (
              <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400">
                LAT: {coords.lat.toFixed(5)} &bull; LNG: {coords.lng.toFixed(5)}
              </div>
            )}
          </div>

          <div className="w-[85%] h-[70%] border-2 border-dashed border-sky-850/40 mx-auto relative flex items-center justify-center">
            {/* Geo-fence Circle */}
            <div className="w-44 h-44 rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center relative animate-pulse">
              <span className="absolute text-[8px] font-black uppercase text-emerald-400 tracking-wider top-6">Approved Boundary Zone</span>
            </div>
            
            {/* Noida Center Pin */}
            <div className="absolute flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 text-slate-100 rounded font-black tracking-wider">
                {coords.lat ? "GPS Lock: Active" : "Searching GPS Signal..."}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Site controls and selfie uploads */}
        <div className="space-y-4">
          
          {/* Selfie capture verification */}
          <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-455 uppercase tracking-widest block border-b border-slate-55 pb-2">Webcam Site Check</h4>
            
            {selfieCaptured ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 h-28 bg-slate-100 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center font-black text-slate-905">
                  AS
                </div>
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Selfie Captured
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-205 rounded-2xl h-28 flex flex-col items-center justify-center p-4 bg-slate-50">
                <Camera className="w-6 h-6 text-slate-450 mb-2" />
                <button
                  onClick={() => setSelfieCaptured(true)}
                  className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 text-[10px] font-black uppercase rounded-lg shadow-3xs transition-all"
                >
                  Verify Face
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-1.5 text-[10px] leading-normal font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleToggle}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                isCheckedIn 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                  : 'bg-brand-primary hover:bg-brand-secondary text-slate-905'
              } disabled:opacity-50`}
            >
              {loading ? 'Processing GPS check...' : (isCheckedIn ? 'Clock Out Site Location' : 'Clock In Site Location')}
            </button>
          </div>

          {/* Travel note panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs space-y-3">
            <span className="text-[10px] font-black text-slate-455 uppercase tracking-widest block border-b border-slate-55 pb-2">Travel & Site Location Settings</span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Select Construction Site</label>
                <select 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)} 
                  className="w-full p-2 border border-slate-205 rounded-xl font-black text-slate-700 bg-white"
                >
                  {sites.length > 0 ? (
                    sites.map(s => (
                      <option key={s.id || s._id} value={s.projectId || s.id || s._id}>
                        {s.name || `Site ID: ${s.projectId || s.id}`}
                      </option>
                    ))
                  ) : (
                    <option value="6a607dae7f99c70902371c1d">Default Noida Construction Site</option>
                  )}
                </select>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
