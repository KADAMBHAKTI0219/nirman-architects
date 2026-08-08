import React, { useState } from 'react';
import { 
  X, User, Clock, FileText, CheckCircle2, ChevronRight, Send, 
  Paperclip, Activity, FileCheck, Layers, ClipboardList, Plus 
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
            
            {/* Status Stepper Timeline */}
            <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Workflow Status Stepper (Click to update status)</span>
              <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
                {STEPS.map((step, idx) => {
                  const isActive = task.status === step;
                  const isCompleted = STEPS.indexOf(task.status) >= idx;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleMoveStatus(step)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                        isActive ? 'bg-brand-soft border border-brand-secondary/40 ring-2 ring-brand-primary/20' : 'hover:bg-slate-200/60'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all border ${
                        isActive ? 'bg-brand-primary border-brand-secondary text-slate-900 shadow-2xs' :
                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                        'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {step}
                      </span>
                    </button>
                  );
                })}
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

        {/* Modal Footer (Workflow Progression Actions) */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-3">
          
          <div className="flex gap-2">
            {task.status === 'Pending' && (
              <>
                <button 
                  onClick={() => handleMoveStatus('Accepted')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  Accept Task
                </button>
                <button 
                  onClick={() => handleMoveStatus('Rejected')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-all border border-rose-200 cursor-pointer"
                >
                  Reject Assignment
                </button>
              </>
            )}
            {task.status === 'Accepted' && (
              <button 
                onClick={() => handleMoveStatus('In Progress')}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-semibold transition-all shadow-2xs border border-brand-secondary/40 cursor-pointer"
              >
                Start In Progress
              </button>
            )}
            {task.status === 'In Progress' && (
              <button 
                onClick={() => handleMoveStatus('Review')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                Submit for PM Review
              </button>
            )}
            {task.status === 'Review' && (
              <>
                <button 
                  onClick={() => handleMoveStatus('Approved')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  Approve Sign-off
                </button>
                <button 
                  onClick={() => handleMoveStatus('In Progress')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-all border border-rose-200 cursor-pointer"
                >
                  Request Rework
                </button>
              </>
            )}
            {task.status === 'Approved' && (
              <button 
                onClick={() => handleMoveStatus('Completed')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                Mark Completed
              </button>
            )}
            {task.status === 'Completed' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Task Completed successfully
              </div>
            )}
          </div>

          <button 
            onClick={handleCloseModal}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
}
