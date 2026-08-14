import React, { useState } from 'react';
import { 
  X, User, Clock, FileText, CheckCircle2, ChevronRight, Send, 
  Paperclip, Activity, FileCheck, Layers, ClipboardList, Plus, Lock, AlertTriangle
} from 'lucide-react';
import Card from '../../common/Card';

const STEPS = ['Pending', 'Accepted', 'In Progress', 'Review', 'Approved', 'Completed'];

export default function TaskDetails({
  task,
  onBack,
  onClose,
  onUpdateStatus,
  onUpdateProgress,
  onAddComment,
  onToggleChecklist,
  onUpdateTask
}) {
  const handleCloseModal = onClose || onBack || (() => {});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roleCode = user.roleCode || (user.role && typeof user.role === 'object' ? user.role.roleCode : user.role) || '';
  const canManageTasks = ['ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(String(roleCode).toUpperCase());

  const [commentInput, setCommentInput] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logActivity, setLogActivity] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');

  // Toggle checklist checkbox
  const handleToggleCheck = (itemId) => {
    if (onToggleChecklist) {
      onToggleChecklist(itemId);
      return;
    }
    if (onUpdateTask) {
      const updatedChecklist = (task.checklist || []).map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      const checkedCount = updatedChecklist.filter(i => i.checked).length;
      const progress = updatedChecklist.length > 0 ? Math.round((checkedCount / updatedChecklist.length) * 100) : 0;
      
      onUpdateTask({
        ...task,
        checklist: updatedChecklist,
        progress
      });
    }
  };

  // Add checklist item
  const handleAddCheckItem = (e) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const checklistArr = task.checklist || [];
    const newId = checklistArr.length > 0 ? Math.max(...checklistArr.map(i => i.id || 0)) + 1 : 1;
    const updatedChecklist = [
      ...checklistArr,
      { id: newId, text: newCheckItem.trim(), checked: false }
    ];
    if (onUpdateTask) {
      onUpdateTask({
        ...task,
        checklist: updatedChecklist,
        progress: Math.round((checklistArr.filter(i => i.checked).length / updatedChecklist.length) * 100)
      });
    }
    setNewCheckItem('');
  };

  // Add comment
  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    if (onAddComment) {
      onAddComment(commentInput.trim());
    } else if (onUpdateTask) {
      const updatedComments = [
        ...(task.comments || []),
        { author: "Super Admin", message: commentInput.trim(), date: "Just now" }
      ];
      onUpdateTask({
        ...task,
        comments: updatedComments
      });
    }
    setCommentInput('');
  };

  // Log Time
  const handleLogTimeSubmit = (e) => {
    e.preventDefault();
    const hours = parseFloat(logHours);
    if (isNaN(hours) || hours <= 0) return;

    const newActualTime = (task.actualTime || 0) + hours;
    const updatedLogs = [
      ...(task.timeLogs || []),
      { date: new Date().toISOString().split('T')[0], hours, activity: logActivity || "Task refinement" }
    ];
    if (onUpdateTask) {
      onUpdateTask({
        ...task,
        actualTime: newActualTime,
        timeLogs: updatedLogs
      });
    }
    setLogHours('');
    setLogActivity('');
    alert(`Logged ${hours} working hours successfully!`);
  };

  // Status Progression
  const handleMoveStatus = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(newStatus);
    } else if (onUpdateTask) {
      onUpdateTask({
        ...task,
        status: newStatus
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[99999] p-4 sm:p-6 font-sans">
      <div className="bg-slate-50/70 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{task.id || task._id || 'TSK-001'}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  task.priority === 'Critical' || task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  task.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>{task.priority || 'Medium'} Priority</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">{task.title || task.taskName || 'Untitled Task'}</h3>
            </div>
          </div>
          
          <button 
            onClick={handleCloseModal}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* SECTION 1: TOP 3 CARDS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Current Workflow Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Workflow Status
              </span>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{task.status || 'Pending / Created'}</span>
              </div>
            </div>

            {/* Card 2: Assignee Particulars */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Assignee Particulars
              </span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-xs border border-indigo-100 shrink-0">
                  {(task.assignee || task.assignedEmployee || 'LS').split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <strong className="text-xs font-extrabold text-slate-900 block">{task.assignee || task.assignedEmployee?.name || 'Lax Savni'}</strong>
                  <span className="text-[10px] text-slate-400 font-semibold block">{task.dept || 'Architecture Department'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Time Analysis */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Time Analysis</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400 text-[11px]">Est Time limit</span>
                  <span className="text-slate-900 font-extrabold">{task.estTime || task.estimatedTime || 90} hrs</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400 text-[11px]">Actual logged</span>
                  <span className="text-slate-900 font-extrabold">{task.actualTime || 8} hrs</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (((task.actualTime || 8) / (task.estTime || 90)) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between font-bold text-[10px] text-slate-400 pt-0.5">
                  <span>Usage ratio</span>
                  <span className="text-slate-800">{(((task.actualTime || 8) / (task.estTime || 90)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 2: MIDDLE ROW (Task Description, Quality Checklist, Dependencies vs Comments) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2/3 COLUMN: Description, Checklist & Dependencies */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Task Description */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Task Description</span>
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed shadow-2xs">
                  {task.description || "No specific detailed description logged for this task."}
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quality Checklist</span>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (task.checklist || []).length > 0 ? Math.round(((task.checklist || []).filter(c => c.checked || c.isCompleted).length / (task.checklist || []).length) * 100) : 45)}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 shrink-0">
                      {(task.checklist || []).length > 0 ? Math.round(((task.checklist || []).filter(c => c.checked || c.isCompleted).length / (task.checklist || []).length) * 100) : 45}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(task.checklist || []).map((item, idx) => (
                      <label key={item.id || idx} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer font-medium">
                        <input 
                          type="checkbox"
                          checked={item.checked || item.isCompleted || false}
                          onChange={() => handleToggleCheck(item.id || idx)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer"
                        />
                        <span className={(item.checked || item.isCompleted) ? 'line-through text-slate-400 font-semibold' : 'text-slate-800 font-semibold'}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  <form onSubmit={handleAddCheckItem} className="flex gap-2 pt-1">
                    <input 
                      type="text" 
                      placeholder="Add new checklist requirement..."
                      value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium bg-white text-slate-900"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-emerald-600 border border-emerald-300 rounded-xl text-xs font-extrabold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </form>
                </div>
              </div>

              {/* Task Dependencies */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Task Dependencies</span>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-emerald-500 text-sm">🔗</span>
                  <span>No task dependencies required</span>
                </div>
              </div>

            </div>

            {/* RIGHT 1/3 COLUMN: Comments & Discussion */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Comments & Discussion</span>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between h-[280px]">
                
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs scrollbar-none">
                  {(task.comments || []).length === 0 ? (
                    <div className="text-center text-slate-400 font-medium py-12 text-xs">
                      No comments yet. Start a discussion.
                    </div>
                  ) : (
                    (task.comments || []).map((c, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                          <span>{c.author || 'User'}</span>
                          <span>{c.date || 'Today'}</span>
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">{c.message || c.commentText}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddCommentSubmit} className="flex gap-2 border-t border-slate-100 pt-3">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium bg-slate-50/50 text-slate-900"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* SECTION 3: BOTTOM ROW (Lifecycle Timeline vs Productivity & Delay Status) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Left Box: Lifecycle Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Lifecycle Timeline</h4>
              
              <div className="relative border-l-2 border-slate-100 ml-2.5 pl-6 space-y-4">
                {[
                  { label: 'Pending / Created', isCurrent: true, time: 'Current' },
                  { label: 'Accepted', isCurrent: false, time: 'Not available' },
                  { label: 'Started (In Progress)', isCurrent: false, time: 'Not available' },
                  { label: 'Submitted for Review', isCurrent: false, time: 'Not available' },
                  { label: 'Approved', isCurrent: false, time: 'Not available' },
                  { label: 'Completed', isCurrent: false, time: 'Not available' }
                ].map((step, idx) => (
                  <div key={idx} className="relative flex items-center justify-between text-xs">
                    <span className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ${
                      step.isCurrent 
                        ? 'bg-amber-500 border-amber-200 shadow-3xs' 
                        : 'bg-slate-200 border-white'
                    }`} />
                    
                    <span className={`font-bold ${step.isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                    
                    <span className={`text-[11px] font-semibold ${step.isCurrent ? 'text-amber-600 font-extrabold' : 'text-slate-400 italic'}`}>
                      {step.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Productivity & Delay Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <span>Productivity & Delay Status</span>
              </div>

              {/* 4 Inner Metric Grid Cards */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                
                {/* Total Working Time */}
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Working Time</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">8 hrs</strong>
                  </div>
                </div>

                {/* Total Idle Time */}
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Idle Time</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">1.5 hrs</strong>
                  </div>
                </div>

                {/* Productivity Score */}
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Productivity Score</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <strong className="text-sm font-black text-slate-900">76%</strong>
                      <span className="text-[10px] text-emerald-600 font-bold">Good</span>
                    </div>
                  </div>
                </div>

                {/* Delay Risk */}
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Delay Risk</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black rounded-md uppercase">
                      ON TIME
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
