import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Clock, AlertCircle, Fingerprint, Calendar, ArrowRight, 
  MapPin, CheckSquare, Plus, Send, Play, Coffee, FileText, Download, Eye, 
  Layers, MessageSquare, FolderOpen, Bell, CheckCheck, RefreshCw, AlertTriangle, Check, X, Upload
} from 'lucide-react';
import Card from '../../common/Card';
import DrawingViewer from '../../common/DrawingViewer';
import { getTodayAttendance, getMyAttendance } from '../../../service/hrm/attendance';
import { getTasks, updateTaskStatus } from '../../../service/task';
import { getMyNotifications } from '../../../service/notification';
import { getProjectDocuments, uploadDocument } from '../../../service/document';
import { getInternalProjectChat, sendInternalChatMessage } from '../../../service/chat';
import { getDrawings } from '../../../service/drawing';
import { getProjects } from '../../../service/project';
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
  const [userProjects, setUserProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');

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

  // Dynamic Compliance Documents & File Upload Ref
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocuments = async (pId = activeProjectId) => {
    try {
      const docRes = await getProjectDocuments(pId || '');
      if (docRes) {
        const list = docRes.allDocuments || docRes.documents || (Array.isArray(docRes) ? docRes : []);
        setDocuments(list);
      }
    } catch (e) {
      console.warn("Documents fetch notice:", e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const ext = file.name.split('.').pop().toUpperCase();
      await uploadDocument({
        projectId: activeProjectId || '',
        documentName: file.name,
        fileName: file.name,
        fileType: ext,
        category: 'Compliance & Verification',
        filePath: URL.createObjectURL(file)
      });
      showToast(`Document "${file.name}" uploaded successfully!`, 'success');
      await fetchDocuments(activeProjectId);
    } catch (err) {
      console.error("Document upload error:", err);
      showToast(err.message || "Failed to upload document", "error");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        const list = res.data || (Array.isArray(res) ? res : []);
        setMyAttendanceLogs(list);
      }
    } catch (err) {
      console.error("Attendance roster history load error:", err);
    }
  };

  const { showToast } = useToast();

  // Fetch Auxiliary Data
  const fetchAuxiliaryData = async () => {
    try {
      setLoadingDrawings(true);

      // 0. Fetch User Assigned Projects
      let pId = '';
      try {
        const projRes = await getProjects();
        if (projRes?.projects && Array.isArray(projRes.projects) && projRes.projects.length > 0) {
          setUserProjects(projRes.projects);
          pId = projRes.projects[0]._id || projRes.projects[0].id || '';
          setActiveProjectId(pId);
        }
      } catch (e) {
        console.warn("Project fetch notice:", e);
      }

      // 1. Fetch Drawings
      try {
        const dwgRes = await getDrawings({ projectId: pId });
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
        const docRes = await getProjectDocuments(pId);
        if (docRes) {
          const list = docRes.allDocuments || docRes.documents || (Array.isArray(docRes) ? docRes : []);
          setDocuments(list);
        }
      } catch (e) {
        console.warn("Documents fetch notice:", e);
      }

      // 3. Fetch Team Chat Stream
      try {
        const chatRes = await getInternalProjectChat(pId);
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
  const weeklyStreak = useMemo(() => {
    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];
    const currentDay = todayObj.getDay();
    const distanceToMon = (currentDay === 0 ? -6 : 1) - currentDay;

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return days.map((dayLabel, idx) => {
      const dayDateObj = new Date(todayObj);
      dayDateObj.setDate(todayObj.getDate() + distanceToMon + idx);
      const dayDateStr = dayDateObj.toISOString().split('T')[0];

      const matchedLog = myAttendanceLogs.find(l => {
        const lDate = l.date || (l.clockInTime ? l.clockInTime.split('T')[0] : (l.createdAt ? l.createdAt.split('T')[0] : null));
        return lDate === dayDateStr;
      });

      const isToday = (dayDateStr === todayStr);
      const isPast = (dayDateStr < todayStr);

      let statusType = 'FUTURE';

      if (isToday) {
        if (isCheckedIn || todaySession?.clockInTime || todaySession?.clockIn || (matchedLog && (matchedLog.clockInTime || matchedLog.status === 'PRESENT'))) {
          statusType = 'PRESENT';
        } else {
          statusType = 'TODAY_PENDING';
        }
      } else if (matchedLog) {
        const st = (matchedLog.status || matchedLog.attendanceStatus || '').toUpperCase();
        if (st === 'ABSENT') {
          statusType = 'ABSENT';
        } else if (st === 'LEAVE' || st === 'ON_LEAVE') {
          statusType = 'LEAVE';
        } else {
          statusType = 'PRESENT';
        }
      } else if (isPast) {
        statusType = 'ABSENT';
      } else {
        statusType = 'FUTURE';
      }

      return {
        label: dayLabel,
        dateStr: dayDateStr,
        statusType,
        isToday
      };
    });
  }, [myAttendanceLogs, todaySession, isCheckedIn]);

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
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Live weekly check-in & attendance history</p>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3">
            {weeklyStreak.map((item) => {
              let icon = null;
              let badgeStyle = 'bg-slate-50 border border-slate-200 text-slate-300';
              let title = item.label;

              if (item.statusType === 'PRESENT') {
                icon = <Check className="w-3.5 h-3.5 stroke-[3]" />;
                badgeStyle = 'bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-2xs';
                title = `${item.label}: Present`;
              } else if (item.statusType === 'ABSENT') {
                icon = <X className="w-3.5 h-3.5 stroke-[3]" />;
                badgeStyle = 'bg-rose-100 text-rose-700 border border-rose-300 shadow-2xs';
                title = `${item.label}: Absent`;
              } else if (item.statusType === 'LEAVE') {
                icon = <span className="font-extrabold text-[10px]">L</span>;
                badgeStyle = 'bg-amber-100 text-amber-700 border border-amber-300 shadow-2xs';
                title = `${item.label}: On Leave`;
              } else if (item.statusType === 'TODAY_PENDING') {
                icon = <Clock className="w-3 h-3 text-sky-500 animate-pulse" />;
                badgeStyle = 'bg-sky-50 text-sky-600 border border-sky-300 border-dashed';
                title = `${item.label}: Pending Check-In`;
              } else {
                icon = null;
                badgeStyle = 'bg-slate-50 border border-slate-200 text-slate-300';
                title = `${item.label}: Upcoming`;
              }

              return (
                <div key={item.label} className="flex flex-col items-center gap-1.5 flex-1" title={title}>
                  <span className={`text-[9px] font-black uppercase ${item.isToday ? 'text-brand-dark underline font-extrabold' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${badgeStyle}`}>
                    {icon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. MAIN WORKSPACE LAYOUT (TASKS & BLUEPRINTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Tasks checklist */}
        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-dark" />
                  <span>Today's Tasks</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Assigned checklist & real-time task status update</p>
              </div>
              <button 
                onClick={() => navigate('/admin/tasks')}
                className="text-xs font-extrabold text-brand-dark hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task completion progress bar */}
            <div className="pt-3 pb-1">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 mb-1.5">
                <span>Task Progress</span>
                <span className="text-brand-dark font-black">{completedTasksCount} / {tasks.length} Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {loadingTasks ? (
              <div className="flex items-center justify-center py-8 text-xs font-bold text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-brand-dark mr-2" />
                <span>Loading assigned tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="space-y-2.5 pt-2">
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
              <div className="space-y-2.5 pt-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-none">
                {tasks.map(t => {
                  const isCompleted = t.completed || t.status === 'COMPLETED' || t.status === 'Completed';
                  return (
                    <div 
                      key={t.id || t._id}
                      onClick={() => handleToggleTaskStatus(t)}
                      className={`p-3.5 border rounded-2xl flex items-center justify-between gap-3 hover:border-brand-primary transition-all cursor-pointer ${
                        isCompleted ? 'border-slate-100 bg-slate-50/40 opacity-75' : 'border-slate-200 bg-white shadow-3xs'
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
                          {t.dueDate && (
                            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                              Due: {new Date(t.dueDate).toLocaleDateString()}
                            </span>
                          )}
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
        </div>

        {/* Blueprints Workspace */}
        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
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
              <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
                {drawings.map(d => (
                  <div key={d.id || d._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 shrink-0">
                        <FileText className="w-4 h-4 text-brand-dark" />
                      </div>
                      <div className="min-w-0">
                        <strong className="text-slate-850 block text-xs truncate leading-none">{d.name || d.title}</strong>
                        <span className="text-[9px] text-slate-400 block mt-1.5 font-bold uppercase">{d.category || 'Working Drawings'} &bull; {d.version || 'V1.0'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDrawing(d)}
                      className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-[11px] rounded-xl border border-brand-secondary/40 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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

    </div>
  );
}
