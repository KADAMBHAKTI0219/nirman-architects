import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, Square, Plus, Trash2, CheckCircle, 
  BarChart, AlertTriangle, Layers, Calendar 
} from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card from '../../common/Card';

export default function TimeTracking() {
  const [timerActive, setTimerActive] = useState(false);
  const [timeSecs, setTimeSecs] = useState(0);
  const [selectedTask, setSelectedTask] = useState('Draft First Floor Plan Column Layouts');
  
  // Hours Summary
  const [timeLoggedToday, setTimeLoggedToday] = useState(6.5);
  const [timeLoggedWeek, setTimeLoggedWeek] = useState(38.2);

  // Manual entry fields
  const [manualHours, setManualHours] = useState('');
  const [manualTask, setManualTask] = useState('Draft First Floor Plan Column Layouts');

  const [logs, setLogs] = useState([
    { id: 1, task: "Draft First Floor Plan Column Layouts", project: "Central Office Tower", hours: 4.5, type: "Billable", date: "2026-07-23" },
    { id: 2, task: "MEP Shaft Coordination Review", project: "Central Office Tower", hours: 2.0, type: "Billable", date: "2026-07-23" },
    { id: 3, task: "Lobby Materials Mockup Discussion", project: "Oceanic Luxury Villas", hours: 3.5, type: "Non-Billable", date: "2026-07-22" }
  ]);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeSecs(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTimer = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleStopTimer = () => {
    if (timeSecs === 0) return;
    const addedHours = parseFloat((timeSecs / 3600).toFixed(2));
    
    const newLog = {
      id: Date.now(),
      task: selectedTask,
      project: "Central Office Tower",
      hours: addedHours,
      type: "Billable",
      date: new Date().toISOString().split('T')[0]
    };

    setLogs([newLog, ...logs]);
    setTimeLoggedToday(prev => prev + addedHours);
    setTimeLoggedWeek(prev => prev + addedHours);
    setTimeSecs(0);
    setTimerActive(false);
    alert(`Logged ${addedHours} hours to '${selectedTask}'!`);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const hoursNum = parseFloat(manualHours);
    if (isNaN(hoursNum) || hoursNum <= 0) return;

    const newLog = {
      id: Date.now(),
      task: manualTask,
      project: "Smart City Mall",
      hours: hoursNum,
      type: "Billable",
      date: new Date().toISOString().split('T')[0]
    };

    setLogs([newLog, ...logs]);
    setTimeLoggedToday(prev => prev + hoursNum);
    setTimeLoggedWeek(prev => prev + hoursNum);
    setManualHours('');
    alert(`Manually logged ${hoursNum} hours successfully!`);
  };

  // Chart data formatting
  const taskSummaryData = Array.from(
    logs.reduce((acc, log) => {
      acc.set(log.task, (acc.get(log.task) || 0) + log.hours);
      return acc;
    }, new Map())
  ).map(([name, hours]) => ({ name: name.substring(0, 15) + '...', hours }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: ACTIVE TIMER (1/3 width) */}
      <div className="space-y-6">
        
        <Card title="Workspace Timer" subtitle="Live tracking on active designs layouts">
          <div className="flex flex-col items-center justify-center space-y-5 pt-3">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#2484C6] animate-pulse shrink-0" />
              <span className="text-3xl font-black text-slate-800 font-mono tracking-widest">{formatTimer(timeSecs)}</span>
            </div>

            <div className="w-full space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Assigned Task</span>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white font-semibold text-slate-700"
              >
                <option value="Draft First Floor Plan Column Layouts">Draft First Floor Plan Column Layouts</option>
                <option value="HVAC Duct Sizing & Layout Drafts">HVAC Duct Sizing & Layout Drafts</option>
                <option value="Lobby Interior Rendering Schema">Lobby Interior Rendering Schema</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              {!timerActive ? (
                <button 
                  onClick={() => setTimerActive(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-3xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Start
                </button>
              ) : (
                <button 
                  onClick={() => setTimerActive(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase transition-all shadow-3xs"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  Pause
                </button>
              )}

              <button 
                onClick={handleStopTimer}
                disabled={timeSecs === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase transition-all disabled:opacity-40 disabled:hover:bg-rose-650 shadow-3xs"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                Stop & Log
              </button>
            </div>

            <div className="w-full flex items-center justify-between pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-500">
              <span>Today: {timeLoggedToday.toFixed(1)} hrs</span>
              <span>This Week: {timeLoggedWeek.toFixed(1)} hrs</span>
            </div>
          </div>
        </Card>

        {/* Manual entry card */}
        <Card title="Manual Time Entry" subtitle="Submit retrofitted project logs">
          <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-semibold text-slate-550">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block uppercase">Task Description</label>
              <select
                value={manualTask}
                onChange={(e) => setManualTask(e.target.value)}
                className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white"
              >
                <option value="Draft First Floor Plan Column Layouts">Draft First Floor Plan Column Layouts</option>
                <option value="HVAC Duct Sizing & Layout Drafts">HVAC Duct Sizing & Layout Drafts</option>
                <option value="Lobby Interior Rendering Schema">Lobby Interior Rendering Schema</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block uppercase">Hours to Log *</label>
              <input 
                type="number" 
                step="0.25"
                required
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-700 font-semibold"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-brand-primary text-slate-905 rounded-xl font-black uppercase text-center shadow-3xs"
            >
              Post Time Sheet
            </button>
          </form>
        </Card>

      </div>

      {/* CENTER & RIGHT COLUMNS: TIMELINE & SPLIT CHARTS (2/3 width) */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Productivity Split Recharts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card title="Task-wise Logged Hours" subtitle="Hours split by design tasks">
            <div className="h-[200px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={taskSummaryData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Bar dataKey="hours" fill="#2484C6" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Log Category Split" subtitle="Billable vs administrative workloads">
            <div className="h-[200px] flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Billable Hours (85%)</span>
                  <span className="text-slate-400">32.5 hrs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2484C6] h-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Non-Billable (15%)</span>
                  <span className="text-slate-400">5.7 hrs</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Logs List Table */}
        <Card title="Logged Time Ledger" subtitle="Historical records of timesheet logs">
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Target Task</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hours</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 align-middle">
                      <strong className="text-slate-805 block">{log.task}</strong>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{log.project}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-black align-middle">{log.hours} hrs</td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        log.type === 'Billable' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>{log.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-450 align-middle">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

    </div>
  );
}
