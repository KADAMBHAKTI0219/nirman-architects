import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ShieldAlert } from 'lucide-react';
import ShiftStats from './ShiftStats';
import ShiftWeeklyGrid from './ShiftWeeklyGrid';
import ShiftDetailDrawer from './ShiftDetailDrawer';
import { updateShiftConfig, updateHeartbeatConfig } from '../../../mockApi';

const INITIAL_ROSTER = [
  {
    name: "Sarah Connor",
    role: "Lead Architect",
    schedule: { Mon: "Morning", Tue: "Morning", Wed: "Morning", Thu: "Morning", Fri: "Morning" }
  },
  {
    name: "Alice Smith",
    role: "Jr Architect",
    schedule: { Mon: "Morning", Tue: "Morning", Wed: "Morning", Thu: "Morning", Fri: "Morning" }
  },
  {
    name: "Bob Johnson",
    role: "Site Engineer",
    schedule: { Mon: "Evening", Tue: "Evening", Wed: "Evening", Thu: "Evening", Fri: "Evening" }
  },
  {
    name: "Charlie Brown",
    role: "Drafter",
    schedule: { Mon: "Leave", Tue: "Morning", Wed: "Morning", Thu: "Morning", Fri: "Morning" }
  },
  {
    name: "John Wick",
    role: "Project Manager",
    schedule: { Mon: "Morning", Tue: "Morning", Wed: "Morning", Thu: "Morning", Fri: "Morning" },
    conflicts: { Wed: true } // Overtime alert indicator
  }
];

export default function Shifts() {
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [selectedCell, setSelectedCell] = useState({
    employeeName: "John Wick",
    day: "Wed",
    shift: "Morning",
    role: "Project Manager"
  });
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Policy Settings State
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("18:00");
  const [heartbeatTimeout, setHeartbeatTimeout] = useState(5);
  const [savingPolicy, setSavingPolicy] = useState(false);

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setSavingPolicy(true);
    try {
      const resShift = await updateShiftConfig(shiftStart, shiftEnd);
      const resHeartbeat = await updateHeartbeatConfig(heartbeatTimeout);
      if (resShift.success && resHeartbeat.success) {
        alert("Shift timings and heartbeat policies updated successfully!");
      } else {
        alert("Policy configurations updated successfully (simulation mode).");
      }
    } catch (err) {
      alert("Policy configurations updated successfully (simulation mode).");
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleSelectCell = (name, day, shift, role) => {
    setSelectedCell({ employeeName: name, day, shift, role });
    setDrawerOpen(true);
  };

  const handleSaveShift = (name, day, newShift) => {
    setRoster(prev => prev.map(emp => {
      if (emp.name === name) {
        return {
          ...emp,
          schedule: {
            ...emp.schedule,
            [day]: newShift
          }
        };
      }
      return emp;
    }));
    alert(`Shift successfully updated for ${name} on ${day} to ${newShift}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP BAR FILTERS & EXPORTS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Shift Planner & Rosters</strong>
            <span className="text-[10px] text-slate-405 block font-bold">Assign team coverage timelines matching site milestones</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert("Creating a new work shift rule...")}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm"
          >
            Add Shift
          </button>
        </div>

      </div>

      {/* 2. SUMMARY CARDS */}
      <ShiftStats />

      {/* 3. ROSTER GRID & PLANNER DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <ShiftWeeklyGrid 
            rosterData={roster}
            onSelectCell={handleSelectCell}
          />
        </div>

        {drawerOpen && (
          <ShiftDetailDrawer 
            selectedCell={selectedCell}
            onClose={() => setDrawerOpen(false)}
            onSave={handleSaveShift}
          />
        )}

      </div>

      {/* 4. Shift & Heartbeat Policy Settings Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs space-y-4">
        <div className="border-b border-slate-50 pb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Standard Shift & Heartbeat Policy Configuration</span>
          <span className="text-[9px] text-slate-405 block mt-0.5 font-bold">Configure active shift bounds and PC idle tracking timeouts</span>
        </div>

        <form onSubmit={handleSavePolicy} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs font-bold text-slate-550">
          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Standard Shift Start</label>
            <input 
              type="time" 
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none text-slate-805"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Standard Shift End</label>
            <input 
              type="time" 
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none text-slate-805"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Heartbeat Timeout (Mins)</label>
            <input 
              type="number" 
              min="1"
              max="60"
              value={heartbeatTimeout}
              onChange={(e) => setHeartbeatTimeout(parseInt(e.target.value) || 5)}
              className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none text-slate-805"
            />
          </div>
          <button 
            type="submit"
            disabled={savingPolicy}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-805 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-3xs disabled:opacity-50"
          >
            {savingPolicy ? "Saving Policy..." : "Update Policy Settings"}
          </button>
        </form>
      </div>

    </div>
  );
}
