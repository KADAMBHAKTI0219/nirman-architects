import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { getMyAttendance, getTodayAttendance } from '../../../service/hrm/attendance';
import { parseIndexedObjectToArray } from '../../../service/hrm/leave';

export default function AttendanceSite() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });

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

    const fetchSessionStatus = async () => {
      try {
        const res = await getTodayAttendance();
        if (res && res.clockedIn) {
          setIsCheckedIn(true);
        }
      } catch (err) {
        console.error("Failed to fetch initial check-in status:", err);
      }
    };
    fetchSessionStatus();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Upper Layout: Site Coordinates Map */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Real Geolocation coordinates and radial zone map representation */}
        <div className="bg-[#0B1E33] border border-slate-800 rounded-3xl p-6 relative overflow-hidden h-[340px] flex flex-col justify-between shadow-inner">
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

          <div className="flex justify-between items-center z-10 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300">Geo-Fence Status:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCheckedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/55 text-slate-400'}`}>
              {isCheckedIn ? 'Clocked-In within geofence boundaries' : 'Outside boundary limits / Checked-Out'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
