import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, MapPin, Camera, Coffee, Clock, ShieldCheck, CheckCircle2, 
  AlertCircle, Smartphone, User, ShieldAlert, CheckSquare
} from 'lucide-react';

export default function AttendanceCheckIn({
  isCheckedIn,
  isOnBreak,
  secondsWorked,
  onCheckInToggle,
  onBreakToggle,
  selfieCaptured,
  onCaptureSelfie,
  logs
}) {
  const [timerText, setTimerText] = useState("00:00:00");

  useEffect(() => {
    const hrs = Math.floor(secondsWorked / 3600);
    const mins = Math.floor((secondsWorked % 3600) / 60);
    const secs = secondsWorked % 60;
    setTimerText(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
  }, [secondsWorked]);

  // Calendar days grid generator
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    let status = 'present'; // default present
    if (dayNum === 5 || dayNum === 12 || dayNum === 19 || dayNum === 26) status = 'weekend';
    else if (dayNum === 8) status = 'late';
    else if (dayNum === 15) status = 'absent';
    else if (dayNum > 23) status = 'pending';
    return { dayNum, status };
  });

  return (
    <div className="space-y-6">
      
      {/* Upper Grid Layout: Action panel (2/3 width) + Verification panel (1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Biometric button and KPIs */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100/90 shadow-2xs flex flex-col space-y-4">
          
          <div className="flex justify-between items-start border-b border-slate-50 pb-2">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Work Shift</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">Biometric Gate Portal</h3>
            </div>
            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border leading-none ${
              isCheckedIn 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-slate-50 text-slate-450 border-slate-200'
            }`}>
              {isCheckedIn ? (isOnBreak ? 'On Break' : 'Shift Active') : 'Clocked Out'}
            </span>
          </div>

          {/* Central Pulsing Fingerprint Action */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <button
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-lg border-4 border-white pointer-events-none ${
                isCheckedIn 
                  ? 'bg-emerald-500 text-white animate-pulse' 
                  : 'bg-slate-300 text-slate-500'
              }`}
            >
              <Fingerprint className="w-10 h-10" />
              <span className="text-[9px] font-black uppercase tracking-wider mt-1">
                {isCheckedIn ? 'Active' : 'Offline'}
              </span>
            </button>
            
            <div className="text-center space-y-1">
              <strong className="text-2xl font-black text-slate-805 block tracking-tight">
                {isCheckedIn ? timerText : "00:00:00"}
              </strong>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Shift Working Hours
              </span>
            </div>
          </div>

          {/* Today KPIs summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-50 pt-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Shift Time</span>
              <span className="font-extrabold text-slate-700 text-xs">09:00 - 17:30</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Break Time</span>
              <span className="font-bold text-slate-700 text-xs">{isOnBreak ? "Active Break" : "0.5 hrs"}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Late Arrival</span>
              <span className="font-semibold text-emerald-600 text-xs">No (0 mins)</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Early Exit</span>
              <span className="font-semibold text-slate-500 text-xs">None</span>
            </div>
          </div>

        </div>

        {/* Right Side: GPS status and Selfie camera mock */}
        <div className="space-y-6">
          
          {/* GPS Verification Widget */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">GPS Verification</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <div>
                  <strong className="text-slate-805 text-xs block">Noida Sector 62 Site</strong>
                  <span className="text-[9px] text-slate-400 block font-bold">Approved Coordinates Zone</span>
                </div>
              </div>
              
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[10px]">
                <span className="text-slate-450 font-bold uppercase">Geo-Fence Radius</span>
                <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Inside Site (100m)</span>
              </div>
            </div>
          </div>

          {/* Selfie Capture verification bypassed */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Face Recognition</h4>
            
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 h-28 bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center p-4 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mb-1" />
              <strong className="text-emerald-800 text-[10px] block font-black uppercase">Selfie Bypassed</strong>
              <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Device recognized dynamically</span>
            </div>
            
            {isCheckedIn && (
              <button
                onClick={onBreakToggle}
                className={`w-full py-2 rounded-xl border text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-3xs ${
                  isOnBreak 
                    ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold' 
                    : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Coffee className="w-4 h-4" />
                {isOnBreak ? 'Resume Working' : 'Take Lunch Break'}
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Bottom: Monthly attendance Calendar grid status view */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
        <div className="border-b border-slate-50 pb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Month View Registry Calendar</span>
          <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Quick legend: Present (Green) &bull; Late (Orange) &bull; Absent (Red) &bull; Weekend (Slate)</span>
        </div>

        <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-bold text-slate-500">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>

          {daysInMonth.map((day, idx) => (
            <div 
              key={idx}
              className={`aspect-square flex items-center justify-center rounded-xl border font-bold text-xs ${
                day.status === 'present' ? 'bg-emerald-50 border-emerald-150 text-emerald-700' :
                day.status === 'late' ? 'bg-amber-50 border-amber-150 text-amber-700' :
                day.status === 'absent' ? 'bg-rose-50 border-rose-150 text-rose-700' :
                day.status === 'weekend' ? 'bg-slate-50 border-slate-150 text-slate-400 font-normal' :
                'bg-white border-slate-100 text-slate-350'
              }`}
            >
              {day.dayNum}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
