import React from 'react';
import Card from '../../common/Card';

export default function AttendanceCalendar() {
  // Calendar Heatmap mocks (22 working days in July)
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    let status = 'holiday'; // weekend default
    if (dayNum % 7 !== 4 && dayNum % 7 !== 5) {
      status = dayNum % 9 === 0 ? 'late' : (dayNum % 11 === 0 ? 'absent' : 'present');
    }
    return { day: dayNum, status };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Calendar Day-wise Heatmap */}
      <Card title="Attendance Calendar Heatmap" subtitle="Daily presence registry status indicators matching Noida parameters" className="lg:col-span-2">
        <div className="grid grid-cols-7 gap-2 pt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
            <span key={h} className="text-center text-[9px] font-black text-slate-405 uppercase">{h}</span>
          ))}
          {calendarDays.map((d, idx) => (
            <div 
              key={idx} 
              className={`p-2 rounded-xl text-center border font-bold text-xs select-none ${
                d.status === 'present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                d.status === 'absent' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                d.status === 'late' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                'bg-slate-50 border-slate-150 text-slate-400'
              }`}
            >
              {d.day}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick indicators status list */}
      <Card title="Attendance Code Guide" subtitle="Roster colors guides">
        <div className="space-y-3 pt-2 text-xs font-bold text-slate-605">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-emerald-500 block"></span>
            <span>Present Today (Checked-In on time)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-amber-500 block"></span>
            <span>Late check-ins (Exceeded shift buffers)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-rose-500 block"></span>
            <span>Absent (Unexcused or missing boot logs)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-slate-400 block"></span>
            <span>Off Duty / Approved Leaves</span>
          </div>
        </div>
      </Card>
      
    </div>
  );
}
