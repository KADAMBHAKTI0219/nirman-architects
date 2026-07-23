import React from 'react';
import Card from '../../common/Card';

export default function LeaveCalendar() {
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    let status = 'none';
    if (dayNum === 15) status = 'holiday';
    else if (dayNum >= 25 && dayNum <= 27) status = 'leave-annual';
    return { day: dayNum, status };
  });

  return (
    <Card 
      title="Leave Calendar Planner" 
      subtitle="Active department leave schedules and holidays planner"
      className="h-[400px] flex flex-col"
    >
      <div className="grid grid-cols-7 gap-2 pt-2 flex-1 items-center">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
          <span key={h} className="text-center text-[9px] font-black text-slate-405 uppercase block pb-1">{h}</span>
        ))}
        {calendarDays.map((d, idx) => (
          <div 
            key={idx} 
            className={`p-2.5 rounded-xl text-center border font-bold text-xs select-none ${
              d.status === 'leave-annual' ? 'bg-blue-50 border-blue-150 text-blue-600' :
              d.status === 'holiday' ? 'bg-slate-100 border-slate-200 text-slate-500' :
              'bg-white border-slate-100 text-slate-700'
            }`}
          >
            {d.day}
          </div>
        ))}
      </div>
    </Card>
  );
}
