import React from 'react';
import { Users, Heart, HardHat, BrainCircuit, Star } from 'lucide-react';

export default function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      
      {/* CARD 1: Total Employees */}
      <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Employees</span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">148</h3>
          </div>
          <div className="p-2.5 bg-brand-tint rounded-xl text-slate-700">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {/* Overlapping employee initials avatar pile */}
          <div className="flex -space-x-2">
            <div className="w-5.5 h-5.5 rounded-full bg-[#8FC9FF] text-slate-900 border border-white flex items-center justify-center text-[8px] font-black font-sans">SC</div>
            <div className="w-5.5 h-5.5 rounded-full bg-[#A2D2FF] text-slate-900 border border-white flex items-center justify-center text-[8px] font-black font-sans">AS</div>
            <div className="w-5.5 h-5.5 rounded-full bg-[#B0E0FE] text-slate-900 border border-white flex items-center justify-center text-[8px] font-black font-sans">BJ</div>
            <div className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-500 border border-white flex items-center justify-center text-[7px] font-bold">+145</div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full tracking-wider uppercase">+8.3%</span>
            <span className="text-[9px] text-slate-400 font-bold">MoM</span>
          </div>
        </div>
      </div>

      {/* CARD 2: Total Happy Clients */}
      <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Happy Clients</span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">42</h3>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500">
            <Heart className="w-4.5 h-4.5 fill-rose-500/20" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {/* Mini 5-Star Rating block */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[9px] font-black text-slate-700 ml-1">4.9/5</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full tracking-wider uppercase">100% Retention</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Active Sites */}
      <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Sites</span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">12</h3>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <HardHat className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="space-y-1 pt-1">
          {/* Milestone progress bar with pulsing radar dot */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-[74%]"></div>
          </div>
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-450">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-500">74% Target Reached</span>
            </div>
            <span className="text-[9px] font-black text-emerald-600 uppercase">On Schedule</span>
          </div>
        </div>
      </div>

      {/* CARD 4: Average Productivity */}
      <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Productivity Rate</span>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">87.4%</h3>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
            <BrainCircuit className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {/* Custom vector sparkline graphic with fill area gradient */}
          <div className="h-7 w-20 flex-shrink-0">
            <svg className="w-full h-full text-brand-primary" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8FC9FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8FC9FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,20 C15,25 30,5 45,15 C60,25 75,5 90,10 C95,12 100,5 100,5" 
                stroke="#2484C6" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M0,20 C15,25 30,5 45,15 C60,25 75,5 90,10 C95,12 100,5 100,5 L100,30 L0,30 Z" 
                fill="url(#sparklineGrad)" 
              />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black px-2 py-0.5 bg-[#E5F0FA] text-[#2484C6] rounded-full tracking-wider uppercase">+4.2%</span>
          </div>
        </div>
      </div>

    </div>
  );
}
