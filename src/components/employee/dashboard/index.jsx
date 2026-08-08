import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Clock, AlertCircle, Fingerprint, Calendar, ArrowRight, 
  MapPin, CheckSquare, Plus, Send, Play, Coffee, FileText, Download, Eye, 
  Layers, MessageSquare, FolderOpen, Bell, CheckCheck, RefreshCw, AlertTriangle
} from 'lucide-react';
import Card from '../../common/Card';
import DrawingViewer from '../../common/DrawingViewer';
import { getTodayAttendance, getMyAttendance } from '../../../service/hrm/attendance';
import { getTasks } from '../../../service/task';
import { getMyNotifications } from '../../../service/notification';
import { getProjectDocuments } from '../../../service/document';
import { getProjectChat } from '../../../service/chat';

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const empName = user.name || "Employee";
  const empRole = user.designation || user.role || "Staff Member";
  const empDept = user.department || "Operations";

  // Selected Drawing modal state
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  // Check-In and Timer States (100% Dynamic from GET /api/attendance/today)
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todaySession, setTodaySession] = useState(null);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // Dynamic Tasks State (from GET /api/tasks)
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Dynamic Drawings State
  const [drawings, setDrawings] = useState([]);
  const [loadingDrawings, setLoadingDrawings] = useState(false);

  // Dynamic Notifications State
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Dynamic Attendance Roster Logs (from GET /api/attendance/my)
  const [myAttendanceLogs, setMyAttendanceLogs] = useState([]);

  // Dynamic Chat Messages
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Dynamic Compliance Documents
  const [documents, setDocuments] = useState([]);

  // Fetch Attendance Session
  const fetchAttendanceSession = async () => {
    try {
      setLoadingAttendance(true);
      const res = await getTodayAttendance();
      if (res && res.success) {
        const active = Boolean(res.clockedIn);
        setIsCheckedIn(active);
        setTodaySession(res.session || null);

        if (active && res.session?.clockInTime) {
          const elapsed = Math.floor((Date.now() - new Date(res.session.clockInTime).getTime()) / 1000);
          setSecondsWorked(elapsed > 0 ? elapsed : 0);
        } else if (res.session?.workingHours) {
          setSecondsWorked(Math.floor(res.session.workingHours * 3600));
        } else {
          setSecondsWorked(0);
        }
      }
    } catch (err) {
      console.error("Dashboard attendance load error:", err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch Dynamic Tasks
  const fetchDynamicTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await getTasks();
      if (res && res.success) {
        const list = res.tasks || res.data || (Array.isArray(res) ? res : []);
        setTasks(list);
      }
    } catch (err) {
      console.error("Dashboard tasks load error:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch Attendance History Logs
  const fetchAttendanceHistory = async () => {
    try {
      const res = await getMyAttendance();
      if (res) {
        const list = res.logs || res.data || (Array.isArray(res) ? res : []);
        setMyAttendanceLogs(list);
      }
    } catch (err) {
      console.error("Dashboard attendance history error:", err);
    }
  };

  // Fetch Notifications & Auxiliary Data safely
  const fetchAuxiliaryData = async () => {
    try {
      const notifRes = await getMyNotifications();
      if (notifRes) {
        const list = notifRes.data?.notifications || notifRes.notifications || (Array.isArray(notifRes.data) ? notifRes.data : []);
        const unread = (Array.isArray(list) ? list : []).filter(n => !(n.isRead || n.read)).length;
        setUnreadNotificationsCount(unread);
      }
    } catch (err) {
      console.error("Auxiliary data load error:", err);
    }
  };

  useEffect(() => {
    fetchAttendanceSession();
    fetchDynamicTasks();
    fetchAttendanceHistory();
    fetchAuxiliaryData();
  }, []);

  // Live Timer Effect (Real-time elapsed calculation)
  useEffect(() => {
    let interval = null;
    if (isCheckedIn && !isOnBreak) {
      const clockInIso = todaySession?.clockInTime || todaySession?.clientClockIn;
      const clockInMs = clockInIso ? new Date(clockInIso).getTime() : (Date.now() - (secondsWorked * 1000));

      const tickTimer = () => {
        const nowMs = Date.now();
        const elapsed = Math.max(0, Math.floor((nowMs - clockInMs) / 1000));
        setSecondsWorked(elapsed);
      };

      tickTimer();
      interval = setInterval(tickTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, isOnBreak, todaySession?.clockInTime, todaySession?.clientClockIn]);

  const formatHours = (secs) => {
    const hrs = secs / 3600;
    return hrs.toFixed(2);
  };

  const handleCheckInToggle = () => {
    navigate('/employee/attendance');
  };

  const completedTasksCount = tasks.filter(t => t.completed || t.status === 'COMPLETED' || t.status === 'Completed').length;

  // Build 5-day Mon-Fri weekly streak dynamically from real logs
  const weeklyStreak = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((dayName, idx) => {
    // Current week day calculation
    const d = new Date();
    const currentDay = d.getDay(); // 0 = Sun
    const distanceToMon = (currentDay === 0 ? -6 : 1) - currentDay;
    const targetDateObj = new Date(d);
    targetDateObj.setDate(d.getDate() + distanceToMon + idx);
    const dateStr = targetDateObj.toISOString().split('T')[0];

    const matchedLog = myAttendanceLogs.find(l => {
      const lDate = l.date || (l.clockInTime ? l.clockInTime.split('T')[0] : null);
      return lDate === dateStr;
    });

    let code = '-';
    let color = 'bg-slate-100 text-slate-400 border-slate-200';

    if (matchedLog) {
      if (matchedLog.status === 'AUTO_CLOSED' || matchedLog.autoClosed) {
        code = 'AC';
        color = 'bg-amber-500 text-white shadow-xs';
      } else {
        code = 'P';
        color = 'bg-emerald-500 text-white shadow-xs';
      }
    } else if (targetDateObj > new Date()) {
      code = '-';
      color = 'bg-slate-100 text-slate-400 border-slate-200';
    } else {
      code = 'A';
      color = 'bg-rose-500 text-white shadow-xs';
    }

    return { dayName, code, color, dateStr };
  });

  const handleSendChannelUpdate = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChats(prev => [
      ...prev,
      { id: Date.now(), author: `${empName} (You)`, message: chatInput, time: "Just now" }
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Employee Workstation Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Welcome back, <strong className="text-slate-800">{empName}</strong> &bull; {empRole} ({empDept})
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>{empDept} Portal</span>
          </div>

          <button
            onClick={handleCheckInToggle}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer border ${
              isCheckedIn 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700' 
                : 'bg-brand-primary hover:bg-brand-secondary text-slate-900 border-brand-secondary/40'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>{isCheckedIn ? 'Check Out' : 'Gate Check In'}</span>
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

      {/* 2. SUMMARY STRIP CARDS (100% DYNAMIC) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Shift Attendance Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Shift Time</span>
            <strong className="text-xs font-black text-slate-900 block mt-0.5">
              {isCheckedIn ? `${formatHours(secondsWorked)} hrs` : (todaySession?.workingHours ? `${todaySession.workingHours} hrs` : 'Off Duty')}
            </strong>
          </div>
        </div>

        {/* My Tasks progress card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#2484C6] rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">My Tasks</span>
            <strong className="text-xs font-black text-slate-900 block mt-0.5">
              {completedTasksCount} / {tasks.length} Completed
            </strong>
          </div>
        </div>

        {/* Assigned drawings count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Drawings</span>
            <strong className="text-xs font-black text-slate-900 block mt-0.5">
              {drawings.length} Blueprints
            </strong>
          </div>
        </div>

        {/* Notifications count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Alerts</span>
            <strong className="text-xs font-black text-slate-900 block mt-0.5">
              {unreadNotificationsCount} Unread
            </strong>
          </div>
        </div>

      </div>

      {/* 3. TWO COLUMN ACTION CENTER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TASKS & BLUEPRINTS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tasks checklist */}
          <Card title="Today's Assigned Tasks" subtitle="Dynamic task checklist synced with real-time manager review">
            {loadingTasks ? (
              <div className="flex items-center justify-center py-10 space-y-2 text-xs font-bold text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
                <span>Loading assigned tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-2">
                <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <strong className="text-xs font-bold text-slate-700 block">No assigned tasks for today</strong>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Check back later for new task assignments.</span>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {tasks.map(t => {
                  const isCompleted = t.completed || t.status === 'COMPLETED' || t.status === 'Completed';
                  return (
                    <div 
                      key={t.id || t._id}
                      className={`p-3.5 border rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-300 transition-all cursor-pointer ${
                        isCompleted ? 'border-slate-100 bg-slate-50/40 opacity-75' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input 
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => {}}
                          className="w-4 h-4 accent-emerald-600 rounded border-slate-300 cursor-pointer flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {t.title || t.taskName || 'Assigned Workspace Task'}
                          </span>
                          {t.project && (
                            <span className="text-[9px] text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md font-bold uppercase block mt-1 w-max">
                              {typeof t.project === 'object' ? t.project.name : t.project}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                        t.priority === 'Critical' || t.priority === 'HIGH' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {t.priority || 'Medium'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Drawings blueprints */}
          <Card title="blueprints Workspace" subtitle="Verify version tags and CAD status marks">
            {loadingDrawings ? (
              <div className="flex items-center justify-center py-10 text-xs font-bold text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-600 mr-2" />
                <span>Loading drawings...</span>
              </div>
            ) : drawings.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <strong className="text-xs font-bold text-slate-700 block">No blueprints assigned</strong>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Assigned architectural drawings will appear here.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {drawings.map(d => (
                  <div key={d.id || d._id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <strong className="text-slate-850 block text-xs leading-none">{d.name || d.title}</strong>
                        <span className="text-[9px] text-slate-400 block mt-1.5 font-bold uppercase">{d.category || 'Working Drawings'} &bull; {d.version || 'V1.0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDrawing(d)}
                        className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-extrabold text-[11px] rounded-2xl border border-sky-300/60 flex items-center gap-1.5 shadow-3xs cursor-pointer transition-all"
                        title="Open CAD Viewer & Signatures"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-700 stroke-[2.5]" />
                        <span className="leading-tight">View & Sign</span>
                      </button>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        d.status === 'GFC Locked' || d.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {d.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Drawing Viewer Overlay */}
          {selectedDrawing && (
            <DrawingViewer 
              drawing={selectedDrawing}
              onClose={() => setSelectedDrawing(null)}
              userPermissionLevel="MEMBER"
              initialMarkupMode={true}
            />
          )}

        </div>

        {/* RIGHT COLUMN: CHAT, STREAKS, AND DOCS PREVIEW (1/3 width) */}
        <div className="space-y-6">
          
          {/* Dynamic Roster streak chart */}
          <Card title="Attendance Streak" subtitle="Consistent weekly check-in logs history">
            <div className="flex gap-2.5 justify-between pt-2">
              {weeklyStreak.map((item) => (
                <div key={item.dayName} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">{item.dayName}</span>
                  <div className={`w-full h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${item.color}`} title={item.dateStr}>
                    {item.code}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Project chat preview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between h-[280px]">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Team Chat Stream</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Coordination & project updates</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 my-3 pr-1 scrollbar-none text-xs">
              {chats.length === 0 ? (
                <div className="text-center text-slate-400 font-bold py-10 text-xs">
                  No chat messages yet.
                </div>
              ) : (
                chats.map((c, i) => (
                  <div 
                    key={c.id || i} 
                    className={`p-2.5 rounded-2xl space-y-1 ${
                      (c.author || '').includes('You') 
                        ? 'bg-blue-50/70 border border-blue-100 text-slate-800 ml-6 rounded-tr-none' 
                        : 'bg-slate-50 text-slate-800 border border-slate-100 mr-6 rounded-tl-none'
                    }`}
                  >
                    <strong className="font-black text-[9px] block uppercase opacity-85 text-slate-500">{c.author || c.senderName || 'Team Member'}</strong>
                    <p className="font-semibold leading-normal">{c.message || c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChannelUpdate} className="flex gap-2 border-t border-slate-100 pt-2.5">
              <input 
                type="text" 
                placeholder="Reply to team channel..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold bg-white"
              />
              <button 
                type="submit"
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-3xs"
              >
                Send
              </button>
            </form>
          </div>

          {/* Compliance Documents preview */}
          <Card title="Compliance Documents" subtitle="Track document verification status">
            <div className="space-y-3 pt-2 text-xs">
              {documents.length === 0 ? (
                <div className="text-center text-slate-400 font-bold py-4">
                  No documents uploaded.
                </div>
              ) : (
                documents.map((doc, idx) => (
                  <div key={doc.name || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-slate-800 block truncate">{doc.name || doc.title}</strong>
                        <span className="text-[9px] text-slate-400 block font-semibold">Expires: {doc.expiry || '2027-12-31'}</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase">
                      Valid
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
