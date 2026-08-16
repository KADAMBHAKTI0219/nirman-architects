import React, { useState, useEffect } from 'react';
import { 
  Search, LayoutGrid, List, Play, Square, Pause, Plus, Clock, 
  AlertTriangle, X, Paperclip, MessageSquare, CheckCircle2, RefreshCw, Send, CheckCircle
} from 'lucide-react';
import Card from '../../common/Card';
import { getProjects } from '../../../service/project';
import { 
  getTasks, acceptTask, startTask, submitTaskForReview, completeTask, normalizeTask 
} from '../../../service/task';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchArchitectTasks();
  }, []);

  const fetchArchitectTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      let rawTasks = [];
      if (res?.success && Array.isArray(res.tasks)) {
        rawTasks = res.tasks;
      } else if (Array.isArray(res)) {
        rawTasks = res;
      }

      const normalized = rawTasks.map(t => normalizeTask(t)).filter(Boolean);
      
      // Deduplicate
      const unique = [];
      const seen = new Set();
      normalized.forEach(item => {
        const key = item._id || item.id;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });

      setTasks(unique);
    } catch (err) {
      console.warn("Failed to fetch architect tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (taskId, actionType) => {
    setActionError('');
    try {
      if (actionType === 'accept') await acceptTask(taskId);
      else if (actionType === 'start') await startTask(taskId);
      else if (actionType === 'submit') await submitTaskForReview(taskId);
      else if (actionType === 'complete') await completeTask(taskId);
      fetchArchitectTasks();
      if (selectedTask) setDrawerOpen(false);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || '';
      if (msg.toLowerCase().includes('depend') || msg.toLowerCase().includes('block')) {
        setActionError('Task cannot be started because dependent tasks are incomplete.');
      } else {
        setActionError(msg || 'Failed to update task workflow.');
      }
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.project || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (selectedStatusTab === 'Pending') matchesTab = t.status === 'Pending';
    else if (selectedStatusTab === 'Accepted') matchesTab = t.status === 'Accepted';
    else if (selectedStatusTab === 'In Progress') matchesTab = t.status === 'In Progress';
    else if (selectedStatusTab === 'Review') matchesTab = t.status === 'Review';
    else if (selectedStatusTab === 'Completed') matchesTab = t.status === 'Completed' || t.status === 'Approved';
    else if (selectedStatusTab === 'Overdue') matchesTab = t.isDelayed || (t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-16 w-full max-w-[1400px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Design Tasks
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Assigned project deliverables, design reviews & workflow progress
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchArchitectTasks}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 font-extrabold text-xs">
          {['All', 'Pending', 'Accepted', 'In Progress', 'Review', 'Completed', 'Overdue'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedStatusTab(tab)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedStatusTab === tab
                  ? 'bg-slate-900 text-white shadow-3xs'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task title or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* ERROR ALERT */}
      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TASKS GRID */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-semibold">Loading assigned tasks from backend...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div 
              key={task._id || task.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{task.id}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    task.status === 'Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{task.title}</h3>
                <span className="text-xs text-slate-500 font-semibold block">{task.project}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 font-bold">
                  Due: <span className="text-slate-800 font-mono">{task.deadline}</span>
                </div>

                {/* CONTEXTUAL ACTION CTA */}
                <div>
                  {task.status === 'Pending' && (
                    <button 
                      onClick={() => handleAction(task._id || task.id, 'accept')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase shadow-3xs cursor-pointer"
                    >
                      Accept
                    </button>
                  )}

                  {task.status === 'Accepted' && (
                    <button 
                      onClick={() => handleAction(task._id || task.id, 'start')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-3xs cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" /> Start
                    </button>
                  )}

                  {task.status === 'In Progress' && (
                    <button 
                      onClick={() => handleAction(task._id || task.id, 'submit')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase shadow-3xs cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Submit
                    </button>
                  )}

                  {task.status === 'Review' && (
                    <span className="text-[10px] font-bold text-amber-600 italic">Waiting for PM Review</span>
                  )}

                  {task.status === 'Completed' && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No matching design tasks found.</p>
        </div>
      )}

    </div>
  );
}
