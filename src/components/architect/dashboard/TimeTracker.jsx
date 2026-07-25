import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import { Play, Pause, Square, Clock } from 'lucide-react';

export default function TimeTracker() {
  const [timerActive, setTimerActive] = useState(false);
  const [timeSecs, setTimeSecs] = useState(0);
  const [timeLoggedToday, setTimeLoggedToday] = useState("6.2 hrs");
  const [timeLoggedWeek, setTimeLoggedWeek] = useState("32.5 hrs");

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
    const addedHours = (timeSecs / 3600).toFixed(2);
    alert(`Logged ${addedHours} hours to task!`);
    
    const currentTodayVal = parseFloat(timeLoggedToday);
    const currentWeekVal = parseFloat(timeLoggedWeek);
    setTimeLoggedToday(`${(currentTodayVal + parseFloat(addedHours)).toFixed(1)} hrs`);
    setTimeLoggedWeek(`${(currentWeekVal + parseFloat(addedHours)).toFixed(1)} hrs`);
    
    setTimeSecs(0);
    setTimerActive(false);
  };

  return (
    <Card title="Time Tracking Widget" subtitle="Log hours directly to assigned construction design drafts">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-slate-550 animate-pulse" />
          <span className="text-3xl font-black text-slate-900 font-mono tracking-widest">{formatTimer(timeSecs)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!timerActive ? (
            <button 
              onClick={() => setTimerActive(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Start Timer
            </button>
          ) : (
            <button 
              onClick={() => setTimerActive(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              Pause
            </button>
          )}

          <button 
            onClick={handleStopTimer}
            disabled={timeSecs === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-40 disabled:hover:bg-rose-600 transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            Log Hours
          </button>
        </div>

        <div className="w-full flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <span>Today Logged: {timeLoggedToday}</span>
          <span>This Week: {timeLoggedWeek}</span>
        </div>
      </div>
    </Card>
  );
}
