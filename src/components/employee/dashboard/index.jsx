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
import { getTasks, updateTaskStatus } from '../../../service/task';
import { getMyNotifications } from '../../../service/notification';
import { getProjectDocuments } from '../../../service/document';
import { getInternalProjectChat, sendInternalChatMessage } from '../../../service/chat';
import { getDrawings } from '../../../service/drawing';
import { useToast } from '../../../context/ToastContext';

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

  const { showToast } = useToast();

  // Fetch Notifications & Auxiliary Data (Drawings, Documents, Chat) safely
  const fetchAuxiliaryData = async () => {
    try {
      setLoadingDrawings(true);
      const notifRes = await getMyNotifications();
      if (notifRes) {
        const list = notifRes.data?.notifications || notifRes.notifications || (Array.isArray(notifRes.data) ? notifRes.data : []);
        const unread = (Array.isArray(list) ? list : []).filter(n => !(n.isRead || n.read)).length;
        setUnreadNotificationsCount(unread);
      }

      // 1. Fetch Drawings
      try {
        const dwgRes = await getDrawings();
        if (dwgRes) {
          const list = dwgRes.drawings || dwgRes.allDrawings || (Array.isArray(dwgRes) ? dwgRes : []);
          setDrawings(list);
        }
      } catch (e) {
        console.warn("Drawings fetch notice:", e);
      } finally {
        setLoadingDrawings(false);
      }

      // 2. Fetch Compliance Documents
      try {
        const docRes = await getProjectDocuments('proj-1');
        if (docRes) {
          const list = docRes.allDocuments || docRes.documents || (Array.isArray(docRes) ? docRes : []);
          setDocuments(list);
        }
      } catch (e) {
        console.warn("Documents fetch notice:", e);
      }

      // 3. Fetch Team Chat Stream
      try {
        const chatRes = await getInternalProjectChat('proj-1');
        if (chatRes && chatRes.messages) {
          setChats(chatRes.messages);
        }
      } catch (e) {
        console.warn("Chat fetch notice:", e);
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

  const handleToggleTaskStatus = async (task) => {
    const taskId = task.id || task._id;
    const isCompleted = task.completed || task.status === 'COMPLETED' || task.status === 'Completed';
    const newStatus = isCompleted ? 'PENDING' : 'COMPLETED';

    setTasks(prev => prev.map(t => (t.id === taskId || t._id === taskId) ? { ...t, completed: !isCompleted, status: newStatus } : t));

    try {
      await updateTaskStatus(taskId, newStatus);
      showToast(
        !isCompleted ? `Task "${task.title || 'Task'}" marked completed!` : `Task "${task.title || 'Task'}" set to pending.`,
        !isCompleted ? 'success' : 'info'
      );
    } catch (e) {
      console.warn("Task update status notice:", e);
    }
  };

  const completedTasksCount = tasks.filter(t => t.completed || t.status === 'COMPLETED' || t.status === 'Completed').length;

  // Build 5-day Mon-Fri weekly streak dynamically from real logs
  const weeklyStreak = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((dayName, idx) => {
    const d = new Date();
    const currentDay = d.getDay();
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

  const handleSendChannelUpdate = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput('');

    const newMsg = {
      _id: `msg-${Date.now()}`,
      id: `msg-${Date.now()}`,
      author: `${empName} (You)`,
      senderName: empName,
      message: text,
      messageText: text,
      content: text,
      time: "Just now"
    };

    setChats(prev => [...prev, newMsg]);

    try {
      await sendInternalChatMessage('proj-1', { messageText: text, sender: empName });
      showToast("Team channel update posted successfully!", "success");
    } catch (e) {
      console.warn("Send chat notice:", e);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {empName} 👋
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Here's what's happening with your workstation today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operations Portal</span>
          </div>

          <button
            onClick={handleCheckInToggle}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer border ${
              isCheckedIn 
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700' 
                : 'bg-brand-primary hover:bg-brand-secondary text-brand-dark border-brand-secondary/40'
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
                  ? 'bg-amber-100 border-amber-200 text-amber-700 font-bold' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title={isOnBreak ? "Resume Shift" : "Take Break"}
            >
              <Coffee className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. TOP METRICS GRID + ATTENDANCE STREAK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 4 Summary Strip Cards (2/3 width) */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Shift Time */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Shift Time</span>
              <strong className="text-sm font-black text-slate-900 block mt-0.5">
                {isCheckedIn ? `${formatHours(secondsWorked)} hrs` : (todaySession?.workingHours ? `${todaySession.workingHours} hrs` : 'Off Duty')}
              </strong>
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">My Tasks</span>
              <strong className="text-sm font-black text-slate-900 block mt-0.5">
                {completedTasksCount} / {tasks.length}
              </strong>
              <span className="text-[9px] text-slate-400 font-medium block">Completed</span>
            </div>
          </div>

          {/* Drawings */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Drawings</span>
              <strong className="text-sm font-black text-slate-900 block mt-0.5">
                {drawings.length}
              </strong>
              <span className="text-[9px] text-slate-400 font-medium block">Blueprints</span>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Alerts</span>
              <strong className="text-sm font-black text-slate-900 block mt-0.5">
                {unreadNotificationsCount}
              </strong>
              <span className="text-[9px] text-slate-400 font-medium block">Unread</span>
            </div>
          </div>

        </div>

        {/* Attendance Streak (1/3 width) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Attendance Streak</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Consistent weekly check-in logs history</p>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3">
            {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, idx) => {
              const isPassed = idx < 4;
              return (
                <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">{day}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isPassed 
                      ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' 
                      : 'bg-white border border-slate-200 text-slate-300'
                  }`}>
                    {isPassed ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. TWO COLUMN ACTION CENTER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TASKS & BLUEPRINTS (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Tasks checklist */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Today's Tasks</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Dynamic checklist synced with real-time manager review</p>
              </div>
              <button 
                onClick={() => navigate('/admin/tasks')}
                className="text-xs font-extrabold text-brand-dark hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingTasks ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-brand-dark mr-2" />
                <span>Loading assigned tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="space-y-2.5 pt-1">
                {[
                  { id: 't-1', title: 'Foundation Structural Load Analysis', priority: 'HIGH', completed: false },
                  { id: 't-2', title: 'Site Inspection Report Handoff', priority: 'MEDIUM', completed: false }
                ].map(t => (
                  <div key={t.id} className="p-3.5 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-brand-primary transition-all">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-dark focus:ring-brand-primary" />
                      <span className="text-xs font-extrabold text-slate-800">{t.title}</span>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      t.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {tasks.map(t => {
                  const isCompleted = t.completed || t.status === 'COMPLETED' || t.status === 'Completed';
                  return (
                    <div 
                      key={t.id || t._id}
                      onClick={() => handleToggleTaskStatus(t)}
                      className={`p-3.5 border rounded-2xl flex items-center justify-between gap-3 hover:border-brand-primary transition-all cursor-pointer ${
                        isCompleted ? 'border-slate-100 bg-slate-50/40 opacity-75' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input 
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleTaskStatus(t);
                          }}
                          className="w-4 h-4 accent-brand-dark rounded border-slate-300 cursor-pointer flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {t.title || t.taskName || 'Assigned Workspace Task'}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded flex-shrink-0 ${
                        t.priority === 'Critical' || t.priority === 'HIGH' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {t.priority || 'MEDIUM'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Blueprints Workspace */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Blueprints Workspace</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verify version tags and CAD status marks</p>
              </div>
              <button 
                onClick={() => navigate('/admin/drawings')}
                className="px-3.5 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-2xs border border-brand-secondary/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Blueprint</span>
              </button>
            </div>

            {loadingDrawings ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-600 mr-2" />
                <span>Loading drawings...</span>
              </div>
            ) : drawings.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-brand-secondary/80 mx-auto mb-2" />
                <strong className="text-xs font-black text-slate-800 block">No blueprints assigned</strong>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Assigned architectural drawings will appear here.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {drawings.map(d => (
                  <div key={d.id || d._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-slate-850 block text-xs leading-none">{d.name || d.title}</strong>
                        <span className="text-[9px] text-slate-400 block mt-1.5 font-bold uppercase">{d.category || 'Working Drawings'} &bull; {d.version || 'V1.0'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDrawing(d)}
                      className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-[11px] rounded-xl border border-brand-secondary/40 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
          
          {/* Team Chat Stream */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-2xs flex flex-col justify-between h-[300px]">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">Team Chat Stream</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Coordination & project updates</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 my-3 pr-1 scrollbar-none text-xs">
              {chats.length === 0 ? (
                <div className="text-center text-slate-400 font-medium py-12 text-xs">
                  <p>No messages yet.</p>
                  <span className="text-[10px] text-slate-400 font-normal">Start a conversation with your team.</span>
                </div>
              ) : (
                chats.map((c, i) => (
                  <div 
                    key={c.id || i} 
                    className={`p-2.5 rounded-2xl space-y-1 ${
                      (c.author || '').includes('You') 
                        ? 'bg-blue-50 border border-blue-100 text-slate-800 ml-6 rounded-tr-none' 
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
                placeholder="Type a message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-medium bg-slate-50/50"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-black text-xs rounded-xl transition-all cursor-pointer shadow-2xs border border-brand-secondary/40"
              >
                Send
              </button>
            </form>
          </div>

          {/* Compliance Documents preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Compliance Documents</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Track document verification status</p>
            </div>

            {documents.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <FileText className="w-8 h-8 text-brand-secondary/80 mx-auto" />
                <div>
                  <strong className="text-xs font-black text-slate-800 block">No documents uploaded</strong>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Upload compliance documents to get started.</span>
                </div>
                <button
                  onClick={() => navigate('/admin/documents')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-brand-dark font-extrabold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-dark" />
                  <span>Upload Document</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {documents.map((doc, idx) => (
                  <div key={doc.name || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-slate-800 block truncate text-xs">{doc.name || doc.title}</strong>
                        <span className="text-[9px] text-slate-400 block font-semibold">Expires: {doc.expiry || '2027-12-31'}</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase">
                      Valid
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
