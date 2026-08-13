import React, { useState } from 'react';
import { 
  X, User, Clock, FileText, CheckCircle2, ChevronRight, Send, 
  Paperclip, Activity, FileCheck, Layers, ClipboardList, Plus, Lock
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[99999] p-4 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{task.id}</span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                task.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                task.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>{task.priority} Priority</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{task.title}</h3>
            <span className="text-[11px] text-slate-500 font-medium block">{task.project}</span>
          </div>
          <button 
            onClick={handleCloseModal}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width): Stepper, Description, Checklist, Dependencies */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Workflow Status Card */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Current Workflow Status
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    task.status === 'Completed' ? 'bg-emerald-500' :
                    task.status === 'Approved' ? 'bg-sky-500' :
                    task.status === 'Review' ? 'bg-amber-500' :
                    task.status === 'In Progress' ? 'bg-indigo-500' :
                    task.status === 'Accepted' ? 'bg-blue-500' :
                    task.status === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'
                  }`}></span>
                  <span className="text-sm font-extrabold text-slate-900">{task.status || 'Pending'}</span>
                </div>
              </div>
            </div>

            {/* Task description */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Description</span>
              <p className="text-xs text-slate-800 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                {task.description || "No specific detailed description logged for this task. Refinement in progress."}
              </p>
            </div>

            {/* Checklist Widget */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quality Checklist</span>
              <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50 space-y-2">
                {(task.checklist || []).map((item, idx) => (
                  <label key={item.id || idx} className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer font-medium">
                    <input 
                      type="checkbox"
                      checked={item.checked || item.isCompleted || false}
                      onChange={() => handleToggleCheck(item.id || idx)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer"
                    />
                    <span className={(item.checked || item.isCompleted) ? 'line-through text-slate-400' : 'text-slate-800'}>
                      {item.text}
                    </span>
                  </label>
                ))}
                
                {/* Add checklist item */}
                <form onSubmit={handleAddCheckItem} className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Add new checklist requirement..."
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-xs font-medium bg-white text-slate-900"
                  />
                  <button 
                    type="submit"
                    className="px-3.5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-semibold shadow-2xs border border-brand-secondary/40 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Dependencies</span>
              <div className="flex flex-wrap gap-2">
                {(task.dependencies || []).length > 0 ? task.dependencies.map((dep, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-600" /> {typeof dep === 'object' ? dep.taskName : dep}
                  </span>
                )) : (
                  <span className="text-xs text-slate-400 italic">No task dependencies required</span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column (1/3 width): Assignee info, time tracking, comments */}
          <div className="space-y-6">
            
            {/* Assignee Card */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assignee Particulars</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-soft text-slate-900 font-bold flex items-center justify-center text-xs border border-brand-secondary/40">
                  {(task.assignee || 'ST').split(' ').map(n=>n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">{task.assignee || 'Assigned Staff'}</strong>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">{task.dept || 'Architecture'} Department</span>
                </div>
              </div>
            </div>

            {/* Time Tracking Progress */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Analysis</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Est Time limit</span>
                  <span className="text-slate-900">{task.estTime || 16} hrs</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Actual logged</span>
                  <span className="text-slate-900">{task.actualTime || 8} hrs</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-secondary h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, ((task.actualTime || 8) / (task.estTime || 16)) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between font-semibold text-[10px] text-slate-500">
                  <span>Usage ratio</span>
                  <span className="font-bold text-slate-900">{(((task.actualTime || 8) / (task.estTime || 16)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comments & Discussion</span>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {(task.comments || []).map((c, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-slate-200/60 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase">
                      <span>{c.author || 'User'}</span>
                      <span>{c.date || 'Today'}</span>
                    </div>
                    <p className="font-medium text-slate-800 leading-snug">{c.message || c.commentText}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-xs font-medium bg-white text-slate-900"
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-semibold shadow-2xs border border-brand-secondary/40 cursor-pointer"
                >
                  Post
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button 
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
}
