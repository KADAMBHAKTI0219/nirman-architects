import React from 'react';
import Card from '../../common/Card';
import { Clock } from 'lucide-react';

export default function ShiftBiometrics({ isCheckedIn, checkInTime, checkOutTime, onToggleCheckIn }) {
  return (
    <Card title="Shift Biometrics Simulator" subtitle="Biometric check-in/check-out simulation card">
      <div className="flex flex-col items-center justify-center space-y-4 p-2">
        <div className="w-16 h-16 bg-slate-50 border border-slate-205 rounded-full flex items-center justify-center shadow-xs">
          <Clock className={`w-8 h-8 ${isCheckedIn ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
        </div>
        
        <button
          onClick={onToggleCheckIn}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
            isCheckedIn
              ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100'
          }`}
        >
          {isCheckedIn ? "Biometric Check-Out" : "Biometric Check-In"}
        </button>

        <div className="w-full text-center text-[10px] text-slate-450 font-semibold space-y-0.5 mt-2">
          <span className="block">Status: {isCheckedIn ? "Present (Office Desk 4)" : "Absent / Inactive"}</span>
          {isCheckedIn && <span className="block text-emerald-600 font-bold">Logged active shift time: 0.1 hrs</span>}
        </div>
      </div>
    </Card>
  );
}
