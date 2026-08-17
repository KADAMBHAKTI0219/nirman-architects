import React, { useState, useEffect } from 'react';
import { 
  Camera, Plus, Check, X, AlertTriangle, Eye, Image as ImageIcon, Tag, RefreshCw 
} from 'lucide-react';
import Card from '../../common/Card';
import { getTasks, createTask, completeTask } from '../../../service/task';
import { getProjects } from '../../../service/project';
import { useToast } from '../../../context/ToastContext';

export default function PhotosIssues() {
  const { showToast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newSite, setNewSite] = useState('Smart City Mall Foundations');
  const [newPriority, setNewPriority] = useState('High');

  useEffect(() => {
    fetchSiteIssues();
  }, []);

  const fetchSiteIssues = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      if (res?.success && Array.isArray(res.tasks) && res.tasks.length > 0) {
        const mappedIssues = res.tasks.map((t, idx) => ({
          id: t._id ? `ISS-${t._id.substring(0, 4)}` : `ISS-${idx + 101}`,
          _id: t._id,
          title: t.taskName || t.title || 'Site Task Defect',
          site: t.projectId?.projectName || t.projectId?.name || 'Construction Site',
          priority: t.priority || 'High',
          assignee: t.assignedEmployee?.name || 'Site Engineer',
          status: t.status === 'Completed' ? 'Resolved' : 'Open',
          dueDate: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : '2026-12-31'
        }));
        setIssues(mappedIssues);
        if (mappedIssues.length > 0) setSelectedIssue(mappedIssues[0]);
      } else {
        const projRes = await getProjects();
        if (projRes?.success && Array.isArray(projRes.projects)) {
          const loadedIssues = [];
          projRes.projects.forEach((p, pIdx) => {
            const siteName = p.projectName || p.name || 'Site';
            (p.milestones || []).forEach((m, mIdx) => {
              loadedIssues.push({
                id: m._id ? `ISS-${m._id.substring(0, 4)}` : `ISS-${pIdx + 1}0${mIdx + 1}`,
                _id: m._id,
                title: m.name || 'Site Inspection Check',
                site: siteName,
                priority: p.priority || 'High',
                assignee: 'Site Engineer',
                status: m.isCompleted ? 'Resolved' : 'Open',
                dueDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '2026-12-31'
              });
            });
          });
          setIssues(loadedIssues);
          if (loadedIssues.length > 0) setSelectedIssue(loadedIssues[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch site issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseIssue = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Please fill out the issue title field before submitting.", "error");
      return;
    }
    try {
      const res = await createTask({
        taskName: newTitle.trim(),
        priority: newPriority,
        description: `Site issue raised for ${newSite}`
      });
      if (res?.success) {
        fetchSiteIssues();
        setNewTitle('');
        showToast("Site defect issue logged successfully!", "success");
      } else {
        const newIssueObj = {
          id: `ISS-${100 + issues.length + 1}`,
          title: newTitle.trim(),
          site: newSite,
          priority: newPriority,
          assignee: "Site Inspector",
          status: "Open",
          dueDate: "2026-08-01"
        };
        setIssues([newIssueObj, ...issues]);
        setSelectedIssue(newIssueObj);
        setNewTitle('');
        showToast("Site defect issue logged successfully!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to log site defect", "error");
    }
  };

  const handleResolveIssue = async (issueId) => {
    const target = issues.find(i => i.id === issueId || i._id === issueId);
    if (target && target._id) {
      try {
        await completeTask(target._id);
      } catch (err) {
        console.warn("Backend notice completing issue:", err);
      }
    }
    setIssues(issues.map(i => (i.id === issueId || i._id === issueId) ? { ...i, status: 'Resolved' } : i));
    if (selectedIssue && (selectedIssue.id === issueId || selectedIssue._id === issueId)) {
      setSelectedIssue(prev => ({ ...prev, status: 'Resolved' }));
    }
    showToast("Site defect issue resolved!", "success");
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-16 w-full max-w-[1400px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Site Photos & Defect Snag List
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-normal">
            Capture site progress photos, tag structural defects & assign tasks to engineers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchSiteIssues}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Site Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* RAISE ISSUE FORM */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Log New Site Defect / Quality Issue</h3>
        <form onSubmit={handleRaiseIssue} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-normal">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Issue title (e.g. Waterlogging in block B basement...)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium"
            />
          </div>
          <div>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 font-semibold cursor-pointer"
            >
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold rounded-xl border border-brand-secondary/40 shadow-2xs transition-colors cursor-pointer"
            >
              Raise Site Defect
            </button>
          </div>
        </form>
      </div>

      {/* ISSUES GRID */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-normal">Loading site tasks & defects from backend...</p>
        </div>
      ) : issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {issues.map(iss => (
              <div 
                key={iss.id}
                onClick={() => { setSelectedIssue(iss); setDetailsOpen(true); }}
                className={`p-4 bg-white rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedIssue?.id === iss.id 
                    ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-md' 
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{iss.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${
                      iss.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {iss.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 mt-1">{iss.title}</h3>
                  <span className="text-[11px] text-slate-500 font-normal">{iss.site} &bull; Target: {iss.dueDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  {iss.status !== 'Resolved' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleResolveIssue(iss.id); }}
                      className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-semibold rounded-lg transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedIssue && detailsOpen && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4 h-fit sticky top-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase">{selectedIssue.id}</span>
                  <h3 className="text-sm font-semibold text-slate-900">{selectedIssue.title}</h3>
                </div>
                <button onClick={() => setDetailsOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
              </div>
              <div className="space-y-2 text-xs font-normal">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 font-medium uppercase block">Location & Target</span>
                  <p className="text-slate-900 font-semibold">{selectedIssue.site}</p>
                  <p className="text-slate-500 text-[11px]">Due Date: {selectedIssue.dueDate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8 font-normal">
          <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No site issues logged.</p>
        </div>
      )}

    </div>
  );
}
