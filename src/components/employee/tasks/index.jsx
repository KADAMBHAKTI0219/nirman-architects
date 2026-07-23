import React, { useState } from 'react';
import { 
  Search, Eye, Clock, CheckSquare, Plus, Paperclip, MessageSquare, 
  ChevronRight, Calendar, AlertCircle, X, ShieldAlert, BarChart2
} from 'lucide-react';
import Card from '../../common/Card';

export default function EmployeeTasks() {
  const [viewMode, setViewMode] = useState('list'); // list, kanban
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Mock Tasks State
  const [tasks, setTasks] = useState([
    { 
      id: "TSK-401", 
      title: "Detail the staircase treads & balustrades blueprints", 
      project: "Central Office Tower", 
      priority: "High", 
      deadline: "2026-07-28", 
      status: "In Progress", 
      estTime: 16, 
      actualTime: 10,
      commentsCount: 3,
      attachmentsCount: 2,
      description: "Ensure that riser dimensions correspond to standard building codes. Clear headroom height should be at least 2.1 meters. Balustrade support brackets require precise weld size specifications.",
      checklist: [
        { text: "Verify riser dimensions & clear headroom", checked: true },
        { text: "Refine balustrade anchor bracket welds", checked: true },
        { text: "Coordinate with MEP shafts layout plan", checked: false }
      ],
      comments: [
        { author: "Sarah Connor (PM)", text: "Please review staircase structural deadweight load offsets.", date: "1 day ago" },
        { author: "Alice Smith", text: "Working on balancing riser ratios now.", date: "4 hours ago" }
      ]
    },
    { 
      id: "TSK-402", 
      title: "HVAC Duct Sizing & Layout Drafts", 
      project: "Smart City Mall", 
      priority: "Critical", 
      deadline: "2026-07-25", 
      status: "Review", 
      estTime: 24, 
      actualTime: 20,
      commentsCount: 1,
      attachmentsCount: 1,
      description: "Compile and size supply/return air ducts for the first-floor commercial shops. Coordinate layout offsets with structural floor beams.",
      checklist: [
        { text: "CFM flow calculations signed off by PM", checked: true },
        { text: "Coordinate routing around service elevator shafts", checked: true }
      ],
      comments: [
        { author: "John Wick (PM)", text: "Excellent draft. Sent for final engineering review.", date: "2 days ago" }
      ]
    },
    { 
      id: "TSK-403", 
      title: "Submit daily timesheet logs", 
      project: "Central Office Tower", 
      priority: "Medium", 
      deadline: "2026-07-23", 
      status: "Completed", 
      estTime: 1, 
      actualTime: 1,
      commentsCount: 0,
      attachmentsCount: 0,
      description: "Submit active biometric hours logs and focus metrics for verification.",
      checklist: [],
      comments: []
    }
  ]);

  const [commentInput, setCommentInput] = useState('');

  // Kanban Lanes
  const lanes = ['Pending', 'Accepted', 'In Progress', 'Review', 'Completed'];

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTaskCheckboxToggle = (taskId, idx) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedChecklist = t.checklist.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c);
        return { ...t, checklist: updatedChecklist };
      }
      return t;
    }));
    // Sync active modal
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => {
        const updatedChecklist = prev.checklist.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c);
        return { ...prev, checklist: updatedChecklist };
      });
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }));
    }
    alert(`Task status updated to: ${newStatus}`);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      author: "Alice Smith (You)",
      text: commentInput,
      date: "Just now"
    };

    setTasks(prev => prev.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          commentsCount: t.commentsCount + 1,
          comments: [...t.comments, newComment]
        };
      }
      return t;
    }));

    setSelectedTask(prev => ({
      ...prev,
      commentsCount: prev.commentsCount + 1,
      comments: [...prev.comments, newComment]
    }));

    setCommentInput('');
  };

  const handleLogHours = () => {
    const hrs = parseFloat(prompt("Enter working hours to log on timesheet:"));
    if (!isNaN(hrs) && hrs > 0) {
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id ? { ...t, actualTime: t.actualTime + hrs } : t
      ));
      setSelectedTask(prev => ({ ...prev, actualTime: prev.actualTime + hrs }));
      alert(`Logged ${hrs} hours on timesheet successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs">
        
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search my tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border ${
              viewMode === 'list' 
                ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border ${
              viewMode === 'kanban' 
                ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Kanban Board
          </button>
        </div>

      </div>

      {/* 2. Main content view */}
      {viewMode === 'list' ? (
        
        // List Card Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(t => (
            <div 
              key={t.id} 
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:border-brand-primary/40 transition-all flex flex-col justify-between h-[180px]"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2 py-0.5 bg-[#E5F0FA] text-[#2484C6] rounded text-[8px] font-black uppercase tracking-wider">
                    {t.project}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    t.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                    t.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                  }`}>{t.priority}</span>
                </div>
                <h4 className="text-xs font-black text-slate-805 mt-2 line-clamp-2 leading-snug">{t.title}</h4>
              </div>

              <div>
                {/* Progress bar */}
                <div className="space-y-1 my-3">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                    <span>Progress: {t.actualTime}/{t.estTime}h</span>
                    <span>Deadline: {t.deadline}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-brand-primary h-full rounded-full" style={{ width: `${Math.min(100, (t.actualTime / t.estTime) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-0.5 text-[10px] font-bold">
                      <Paperclip className="w-3.5 h-3.5" /> {t.attachmentsCount}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] font-bold">
                      <MessageSquare className="w-3.5 h-3.5" /> {t.commentsCount}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedTask(t)}
                    className="flex items-center gap-0.5 px-3 py-1 bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-705 text-[10px] font-black uppercase rounded-lg shadow-3xs transition-all"
                  >
                    Open View
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      ) : (
        
        // Kanban view
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {lanes.map(lane => (
            <div key={lane} className="bg-slate-50/70 p-4 rounded-3xl border border-slate-100 flex flex-col gap-3 min-h-[380px]">
              
              {/* Lane Header */}
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    lane === 'Completed' ? 'bg-emerald-500' :
                    lane === 'Review' ? 'bg-indigo-500' :
                    lane === 'In Progress' ? 'bg-sky-500' : 'bg-slate-400'
                  }`}></span>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{lane}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-white border border-slate-150 rounded">
                  {filteredTasks.filter(t => t.status === lane).length}
                </span>
              </div>

              {/* Lane Cards */}
              <div className="flex-1 space-y-3">
                {filteredTasks.filter(t => t.status === lane).map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="bg-white p-3.5 border border-slate-150 hover:border-brand-primary/45 rounded-2xl cursor-pointer transition-all space-y-3 shadow-3xs"
                  >
                    <div>
                      <span className="text-[8px] font-black text-[#2484C6] bg-[#E5F0FA] px-1.5 py-0.5 rounded block uppercase tracking-wider self-start mb-1.5 w-max">
                        {t.project}
                      </span>
                      <h5 className="text-xs font-black text-slate-755 leading-snug line-clamp-2">{t.title}</h5>
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 border-t border-slate-50 pt-2">
                      <span>Due {t.deadline}</span>
                      <span className="px-1 bg-slate-50 rounded text-slate-500">{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      )}

      {/* 3. Sliding Task command Center Overlay Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedTask.id}</span>
                <h3 className="text-sm font-black text-slate-905">{selectedTask.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{selectedTask.project}</span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Drawer layout */}
            <div className="p-6 overflow-y-auto max-h-[420px] space-y-6 text-xs font-semibold text-slate-650">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Main panel - 2 cols */}
                <div className="md:col-span-2 space-y-5">
                  
                  {/* Description */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Task Scope & Description</span>
                    <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed text-slate-700">
                      {selectedTask.description}
                    </p>
                  </div>

                  {/* Checklist */}
                  {selectedTask.checklist.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase block">Checklist Sign-off</span>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                        {selectedTask.checklist.map((item, idx) => (
                          <label key={idx} className="flex items-center gap-2.5 text-slate-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={item.checked}
                              onChange={() => handleTaskCheckboxToggle(selectedTask.id, idx)}
                              className="w-4 h-4 accent-brand-primary rounded border-slate-300"
                            />
                            <span className={item.checked ? 'line-through text-slate-400 font-semibold' : 'font-bold'}>{item.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments log */}
                  <div className="space-y-3">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Task Comment Logs</span>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {selectedTask.comments.map((c, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex justify-between text-[8px] text-slate-450 font-bold uppercase mb-1">
                            <span>{c.author}</span>
                            <span>{c.date}</span>
                          </div>
                          <p className="text-slate-700 leading-normal">{c.text}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add daily task comment..." 
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
                      />
                      <button 
                        type="submit"
                        className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
                      >
                        Comment
                      </button>
                    </form>
                  </div>

                </div>

                {/* Right panel - 1 col (Actions & timers) */}
                <div className="space-y-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  
                  {/* Status selection */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Workflow Status</span>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 bg-white font-semibold"
                    >
                      {lanes.map(lane => (
                        <option key={lane} value={lane}>{lane}</option>
                      ))}
                    </select>
                  </div>

                  {/* Timesheet indicator */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase block">Timesheet Clock</span>
                    <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                      <span>Est: {selectedTask.estTime}h</span>
                      <span>Logged: {selectedTask.actualTime}h</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="bg-brand-primary h-full rounded-full" style={{ width: `${Math.min(100, (selectedTask.actualTime / selectedTask.estTime) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={handleLogHours}
                      className="w-full py-2 bg-white border border-slate-205 hover:bg-slate-50 text-slate-705 rounded-xl text-xs font-black uppercase shadow-3xs"
                    >
                      Log Time
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTask.id, 'Review')}
                      className="w-full py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase shadow-sm"
                    >
                      Submit for PM Review
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
