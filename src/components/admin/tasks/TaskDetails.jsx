import React, { useState } from 'react';
import { 
  X, User, Clock, FileText, CheckCircle2, ChevronRight, Send, 
  Paperclip, Activity, FileCheck, Layers, ClipboardList, Plus 
} from 'lucide-react';
import Card from '../../common/Card';

const STEPS = ['Pending', 'Accepted', 'In Progress', 'Review', 'Approved', 'Completed'];

export default function TaskDetails({
  task,
  onClose,
  onUpdateTask
}) {
  const [commentInput, setCommentInput] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logActivity, setLogActivity] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');

  // Toggle checklist checkbox
  const handleToggleChecklist = (itemId) => {
    const updatedChecklist = task.checklist.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    // Recalculate progress based on checked checklist items
    const checkedCount = updatedChecklist.filter(i => i.checked).length;
    const progress = updatedChecklist.length > 0 ? Math.round((checkedCount / updatedChecklist.length) * 100) : 0;
    
    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
      progress
    });
  };

  // Add checklist item
  const handleAddCheckItem = (e) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const newId = task.checklist.length > 0 ? Math.max(...task.checklist.map(i => i.id)) + 1 : 1;
    const updatedChecklist = [
      ...task.checklist,
      { id: newId, text: newCheckItem, checked: false }
    ];
    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
      progress: Math.round((task.checklist.filter(i => i.checked).length / updatedChecklist.length) * 100)
    });
    setNewCheckItem('');
  };

  // Add comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const updatedComments = [
      ...task.comments,
      { author: "Super Admin", message: commentInput, date: "Just now" }
    ];
    onUpdateTask({
      ...task,
      comments: updatedComments
    });
    setCommentInput('');
  };

  // Log Time
  const handleLogTimeSubmit = (e) => {
    e.preventDefault();
    const hours = parseFloat(logHours);
    if (isNaN(hours) || hours <= 0) return;

    const newActualTime = task.actualTime + hours;
    const updatedLogs = [
      ...task.timeLogs,
      { date: new Date().toISOString().split('T')[0], hours, activity: logActivity || "General refinement" }
    ];
    onUpdateTask({
      ...task,
      actualTime: newActualTime,
      timeLogs: updatedLogs
    });
    setLogHours('');
    setLogActivity('');
    alert(`Logged ${hours} working hours!`);
  };

  // Status Progression
  const handleMoveStatus = (newStatus) => {
    onUpdateTask({
      ...task,
      status: newStatus
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.id}</span>
              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                task.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                task.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-550'
              }`}>{task.priority}</span>
            </div>
            <h3 className="text-sm font-black text-slate-805 mt-0.5">{task.title}</h3>
            <span className="text-[10px] text-slate-400 font-bold block">{task.project}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width): Stepper, Description, Checklist, Dependencies */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Stepper Timeline */}
            <div className="bg-slate-50/40 p-4 border border-slate-100 rounded-2xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-3">Workflow Status Stepper</span>
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {STEPS.map((step, idx) => {
                  const isActive = task.status === step;
                  const isCompleted = STEPS.indexOf(task.status) >= idx;
                  return (
                    <div key={step} className="flex items-center gap-1.5 flex-1 last:flex-initial">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all border ${
                        isActive ? 'bg-brand-primary border-brand-primary text-slate-805 shadow-xs' :
                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                        'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step}
                      </span>
                      {idx < STEPS.length - 1 && <div className="h-0.5 bg-slate-200 flex-1 mx-1.5"></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task description */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Description</span>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                {task.description || "No specific detailed description logged for this staircase task. Refinement in progress."}
              </p>
            </div>

            {/* Checklist Widget */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Quality Checklist</span>
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-2">
                {task.checklist.map(item => (
                  <label key={item.id} className="flex items-center gap-2.5 text-xs text-slate-650 cursor-pointer font-semibold">
                    <input 
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-4 h-4 accent-brand-primary rounded border-slate-300"
                    />
                    <span className={item.checked ? 'line-through text-slate-400' : 'text-slate-700'}>
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
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Task Dependencies</span>
              <div className="flex flex-wrap gap-2">
                {task.dependencies.map((dep, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-705 border border-amber-100 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-500" /> {dep}
                  </span>
                ))}
              </div>
            </div>

            {/* Time logging list */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Timesheet Activity Log</span>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Logged Hours</th>
                      <th className="px-4 py-2">Activity Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {task.timeLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 text-slate-500 font-semibold">{log.date}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-700">{log.hours} hrs</td>
                        <td className="px-4 py-2.5 text-slate-650 font-semibold">{log.activity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column (1/3 width): Assignee info, time tracking graphs, comments, attachments */}
          <div className="space-y-6">
            
            {/* Assignee Card */}
            <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Assignee Particulars</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary text-slate-905 font-black flex items-center justify-center text-xs shadow-xs">
                  {task.assignee.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <strong className="text-xs font-black text-slate-805 block">{task.assignee}</strong>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">{task.dept} Department</span>
                </div>
              </div>
            </div>

            {/* Time Tracking Progress */}
            <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Time Analysis</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Est Time limit</span>
                  <span className="text-slate-700">{task.estTime} hrs</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Actual logged</span>
                  <span className="text-slate-700">{task.actualTime} hrs</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-primary h-full rounded-full" 
                    style={{ width: `${Math.min(100, (task.actualTime / task.estTime) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between font-bold text-[9px] text-slate-400">
                  <span>Usage ratio</span>
                  <span className="font-extrabold text-slate-700">{((task.actualTime / task.estTime) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Log Time Form */}
            <form onSubmit={handleLogTimeSubmit} className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Log Working Time</span>
              <div className="grid grid-cols-3 gap-2">
                <input 
                  type="number" 
                  step="0.5"
                  required
                  placeholder="Hours" 
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
                />
                <input 
                  type="text" 
                  required
                  placeholder="Activity e.g. Drafting" 
                  value={logActivity}
                  onChange={(e) => setLogActivity(e.target.value)}
                  className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
              >
                Submit Timesheet Log
              </button>
            </form>

            {/* Comments Thread */}
            <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Comments & updates</span>
              <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1">
                {task.comments.map((c, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-slate-100 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                      <span>{c.author}</span>
                      <span>{c.date}</span>
                    </div>
                    <p className="font-semibold text-slate-700 leading-normal">{c.message}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
                />
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
                >
                  Post
                </button>
              </form>
            </div>

            {/* Attachments */}
            <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Attachments vault</span>
              <div className="space-y-2">
                {task.attachments.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white border border-slate-100 rounded-xl">
                    <span className="font-bold text-slate-700 block truncate max-w-[140px]">{file.name}</span>
                    <button 
                      onClick={() => alert(`Downloading attachment: ${file.name}`)}
                      className="text-[9px] text-[#2484C6] font-bold hover:underline"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
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
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase transition-all shadow-sm"
                >
                  Accept Task
                </button>
                <button 
                  onClick={() => alert("Task rejection comments logged. Project manager notified.")}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase transition-all"
                >
                  Reject Assignment
                </button>
              </>
            )}
            {task.status === 'Accepted' && (
              <button 
                onClick={() => handleMoveStatus('In Progress')}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm"
              >
                Start In Progress
              </button>
            )}
            {task.status === 'In Progress' && (
              <button 
                onClick={() => handleMoveStatus('Review')}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-black uppercase transition-all shadow-sm"
              >
                Submit for PM Review
              </button>
            )}
            {task.status === 'Review' && (
              <>
                <button 
                  onClick={() => handleMoveStatus('Approved')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black uppercase transition-all shadow-sm"
                >
                  Approve Sign-off
                </button>
                <button 
                  onClick={() => handleMoveStatus('In Progress')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase transition-all"
                >
                  Request Rework
                </button>
              </>
            )}
            {task.status === 'Approved' && (
              <button 
                onClick={() => handleMoveStatus('Completed')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase transition-all shadow-sm"
              >
                Mark Completed
              </button>
            )}
            {task.status === 'Completed' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-black uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Task Completed successfully
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
}
