import React from 'react';
import Card from '../../common/Card';

export default function HolidayCalendar() {
  return (
    <Card title="Holidays & Shifts" subtitle="Next upcoming calendar events">
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl">
          <div className="p-2.5 bg-brand-primary text-slate-900 rounded-xl font-bold flex flex-col items-center justify-center min-w-[50px]">
            <span className="text-[10px] uppercase leading-none">Aug</span>
            <span className="text-lg leading-tight mt-0.5">15</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Independence Day</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">National Holiday</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl">
          <div className="p-2.5 bg-slate-200 text-slate-705 rounded-xl font-bold flex flex-col items-center justify-center min-w-[50px]">
            <span className="text-[10px] uppercase leading-none">Sep</span>
            <span className="text-lg leading-tight mt-0.5">05</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Teachers Day Holiday</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Office Optional leave</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Shift: General Morning</span>
          <span>09:00 AM - 05:30 PM</span>
        </div>
      </div>
    </Card>
  );
}
