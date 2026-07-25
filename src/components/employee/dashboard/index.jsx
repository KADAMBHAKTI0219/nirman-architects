import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Clock, AlertCircle, Fingerprint, Calendar, ArrowRight, 
  MapPin, CheckSquare, Plus, Send, Play, Coffee, FileText, Download, Eye, 
  Layers, MessageSquare, FolderOpen, Bell, CheckCheck 
} from 'lucide-react';
import Card from '../../common/Card';
import { getAttendanceStatus, getMyAttendance } from '../../../mockApi';

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // Check-In and Timer States
  const [isCheckedIn, setIsCheckedIn] = useState(() => localStorage.getItem('isCheckedIn') === 'true');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [checkInTime, setCheckInTime] = useState("Not Checked In");
  
  // Tasks list state
  const [tasks, setTasks] = useState([
    { id: "TSK-401", title: "Detail the staircase treads & balustrades blueprints", project: "Central Office Tower", priority: "High", deadline: "July 28", status: "In Progress", completed: false },
    { id: "TSK-402", title: "HVAC Duct Sizing & Layout Drafts", project: "Smart City Mall", priority: "Critical", deadline: "July 25", status: "Review", completed: false },
    { id: "TSK-403", title: "Submit daily timesheet logs", project: "Central Office Tower", priority: "Medium", deadline: "Today (05:30 PM)", status: "Completed", completed: true }
  ]);

  // Selected task drawer state
  const [selectedTask, setSelectedTask] = useState(null);

  // Drawings list state
  const [drawings] = useState([
    { id: "DWG-001", name: "Ground Floor Wall Layout Blueprint", project: "Central Office Tower", category: "Working Drawings", version: "V2.1", status: "Pending Review" },
    { id: "DWG-003", name: "First Floor Plan Draft Schema", project: "Oceanic Luxury Villas", category: "Concept Drawings", version: "V1.1", status: "GFC Locked" }
  ]);

  // Chat/Updates state
  const [chats, setChats] = useState([
    { id: 1, author: "Sarah Connor (PM)", message: "Please check the staircase headroom clearances on section 2.1.", time: "10:15 AM" },
    { id: 2, author: "System Notification", message: "Geotechnical survey report for Central Office Tower is locked.", time: "11:20 AM" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Documents list state
  const [documents] = useState([
    { name: "Safety Standards Manual.pdf", category: "Policies", size: "8.5 MB", expiry: "2027-03-10" },
    { name: "Contract_Agreement.pdf", category: "Contracts", size: "1.2 MB", expiry: "2026-12-31" }
  ]);

  // Fetch current check-in status and actual hours worked on mount
  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const userId = savedUser ? JSON.parse(savedUser).id : null;
        if (!userId) return;

        // 1. Get online status
        const statusRes = await getAttendanceStatus(userId);
        if (statusRes.success && statusRes.data) {
          const online = statusRes.data.isOnline || false;
          setIsCheckedIn(online);
          localStorage.setItem('isCheckedIn', online ? 'true' : 'false');
          
          // 2. Fetch logs to calculate time worked today
          const myLogsRes = await getMyAttendance();
          if (myLogsRes.success && myLogsRes.logs) {
            const logs = myLogsRes.logs;
            const todayStr = new Date().toDateString();
            const todayInLogs = logs.filter(l => l.type === 'CLOCK_IN' && new Date(l.time).toDateString() === todayStr);
            
            if (todayInLogs.length > 0) {
              const firstCheckIn = todayInLogs[todayInLogs.length - 1];
              setCheckInTime(new Date(firstCheckIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              
              if (online) {
                const latestCheckIn = todayInLogs[0];
                const elapsed = Math.floor((Date.now() - new Date(latestCheckIn.time).getTime()) / 1000);
                setSecondsWorked(elapsed > 0 ? elapsed : 0);
              }
            }
          }
        }
      } catch (err) {
        console.error("Dashboard failed to load attendance logs:", err);
      }
    };

    fetchAttendanceStatus();
  }, []);

  // Active check-in timer effect
  useEffect(() => {
    let interval = null;
    if (isCheckedIn && !isOnBreak) {
      interval = setInterval(() => {
        setSecondsWorked(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, isOnBreak]);

  const formatHours = (secs) => {
    const hrs = secs / 3600;
    return hrs.toFixed(2);
  };

  const handleCheckInToggle = () => {
    navigate('/employee/attendance');
  };

  const handleTaskCheckbox = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          status: nextCompleted ? "Completed" : "In Progress"
        };
      }
      return t;
    }));
  };

  const handleSendChannelUpdate = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChats(prev => [
      ...prev,
      { id: chats.length + 1, author: "Alice Smith (You)", message: chatInput, time: "Just now" }
    ]);
    setChatInput('');
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING + TODAY STATUS HEADER */}
      <div className="bg-gradient-to-r from-blue-50/50 to-[#E5F0FA]/30 p-5 rounded-3xl border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-none">Hello, Alice Smith</h2>
          <span className="text-[10px] text-slate-405 font-bold block mt-1 uppercase tracking-wider">
            Junior Architect &bull; General Shift A (9:00 AM - 5:30 PM)
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-150 rounded-xl text-[10px] font-bold text-slate-550 shadow-3xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Noida Sector 62 Site</span>
          </div>

          <button
            onClick={handleCheckInToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-xs ${
              isCheckedIn 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-brand-primary hover:bg-brand-secondary text-slate-905'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </button>

          {isCheckedIn && (
            <button
              onClick={() => setIsOnBreak(prev => !prev)}
              className={`p-2 rounded-xl border transition-all ${
                isOnBreak 
                  ? 'bg-amber-150 border-amber-200 text-amber-700 font-bold' 
                  : 'bg-white border-slate-205 text-slate-505 hover:bg-slate-50'
              }`}
              title={isOnBreak ? "Resume Shift" : "Take Break"}
            >
              <Coffee className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SUMMARY STRIP CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Shift Attendance Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Shift Time</span>
            <strong className="text-xs font-black text-slate-750 block mt-0.5">
              {isCheckedIn ? `${formatHours(secondsWorked)} hrs` : 'Not Started'}
            </strong>
          </div>
        </div>

        {/* My Tasks progress card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">My Tasks</span>
            <strong className="text-xs font-black text-slate-750 block mt-0.5">
              {completedTasksCount} / {tasks.length} Completed
            </strong>
          </div>
        </div>

        {/* Assigned drawings count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Drawings</span>
            <strong className="text-xs font-black text-slate-750 block mt-0.5">
              {drawings.length} Blueprints
            </strong>
          </div>
        </div>

        {/* Notifications count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Alerts</span>
            <strong className="text-xs font-black text-slate-755 block mt-0.5">
              2 Unread
            </strong>
          </div>
        </div>

      </div>

      {/* 3. TWO COLUMN ACTION CENTER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TASKS & BLUEPRINTS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tasks checklist */}
          <Card title="Today's Assigned Tasks" subtitle="Tick completed checklists items to sync progress with manager review">
            <div className="space-y-3 pt-2">
              {tasks.map(t => (
                <div 
                  key={t.id}
                  onClick={() => handleTaskCheckbox(t.id)}
                  className={`p-3.5 border rounded-2xl flex items-center justify-between gap-3 hover:border-brand-primary/40 transition-all cursor-pointer ${
                    t.completed ? 'border-slate-100 bg-slate-50/40 opacity-75' : 'border-slate-150'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input 
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => {}} // handled by parent div click
                      className="w-4 h-4 accent-brand-primary rounded border-slate-300 cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className={`text-xs font-bold block leading-snug ${t.completed ? 'line-through text-slate-400' : 'text-slate-755'}`}>
                        {t.title}
                      </span>
                      <span className="text-[9px] text-[#2484C6] bg-[#E5F0FA] px-1.5 py-0.5 rounded-md font-bold uppercase block mt-1 w-max">
                        {t.project}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                    t.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    'bg-slate-50 text-slate-505 border border-slate-100'
                  }`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Drawings blueprints */}
          <Card title="blueprints Workspace" subtitle="Verify version tags and status marks">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {drawings.map(d => (
                <div key={d.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-white border border-slate-150 rounded-xl text-slate-400">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <strong className="text-slate-805 block text-xs leading-none">{d.name}</strong>
                      <span className="text-[9px] text-slate-400 block mt-1.5 font-bold uppercase">{d.category} &bull; {d.version}</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    d.status === 'GFC Locked' ? 'bg-indigo-50 text-indigo-650 border-indigo-100' : 'bg-amber-50 text-amber-655 border-amber-100'
                  }`}>{d.status}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: CHAT, STREAKS, AND DOCS PREVIEW (1/3 width) */}
        <div className="space-y-6">
          
          {/* Roster streak chart */}
          <Card title="Attendance Streak" subtitle="Consistent weekly check-in logs history">
            <div className="flex gap-2.5 justify-between pt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, idx) => (
                <div key={d} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">{d}</span>
                  <div className="w-full bg-emerald-500 h-8 rounded-lg flex items-center justify-center text-white text-[9px] font-black">
                    P
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Project chat preview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between h-[280px]">
            <div className="border-b border-slate-50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Team Chat Stream</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Coordination updates</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1 scrollbar-none">
              {chats.map(c => (
                <div 
                  key={c.id} 
                  className={`p-2.5 rounded-2xl text-xs space-y-1 ${
                    c.author.includes('You') 
                      ? 'bg-blue-50/50 border border-blue-150 text-slate-700 ml-6 rounded-tr-none' 
                      : 'bg-slate-50 text-slate-700 border border-slate-100 mr-6 rounded-tl-none'
                  }`}
                >
                  <strong className="font-black text-[9px] block uppercase opacity-85">{c.author}</strong>
                  <p className="font-semibold leading-normal">{c.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChannelUpdate} className="flex gap-2 border-t border-slate-50 pt-2.5">
              <input 
                type="text" 
                placeholder="Reply to channel..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-brand-primary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
              >
                Send
              </button>
            </form>
          </div>

          {/* Expiring Documents preview */}
          <Card title="Compliance Documents" subtitle="Track document verification status">
            <div className="space-y-3 pt-2">
              {documents.map(doc => (
                <div key={doc.name} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <strong className="text-slate-805 block truncate">{doc.name}</strong>
                      <span className="text-[9px] text-slate-400 block font-semibold">Expires: {doc.expiry}</span>
                    </div>
                  </div>
                  <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase">
                    Valid
                  </span>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
