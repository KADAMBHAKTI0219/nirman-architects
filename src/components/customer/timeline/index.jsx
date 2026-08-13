import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, CheckCircle2, ChevronRight, ChevronDown, Clock, 
  Filter, Search, Table, Users, ArrowUpRight, Check, Layers, LayoutGrid, Kanban, RefreshCw, X, Eye, FileText
} from 'lucide-react';
import Card from '../../common/Card';
import { getClientProjectTimeline, getClientProjectDetail, getClientDashboard } from '../../../service/crm/clientPortal';
import { getProjects } from '../../../service/project';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch (e) {
    return dateStr;
  }
}

export default function CustomerTimeline() {
  const [activeTab, setActiveTab] = useState('Timeline'); // 'Table', 'Timeline', 'Calendar', 'Board'
  const [expandedPhases, setExpandedPhases] = useState({ p1: true, p2: true, p3: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedItemModal, setSelectedItemModal] = useState(null);

  // Dynamic projects and active project state
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProjectDoc, setSelectedProjectDoc] = useState(null);
  const [milestonesList, setMilestonesList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const monthsHeader = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  // Load client's projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const dashRes = await getClientDashboard();
        let list = [];
        if (dashRes && dashRes.success && Array.isArray(dashRes.activeProjects) && dashRes.activeProjects.length > 0) {
          list = dashRes.activeProjects.map(p => ({
            id: p.projectId || p._id || p.id,
            _id: p.projectId || p._id || p.id,
            name: p.projectName || p.name || 'Project',
            code: p.code || 'PRJ'
          }));
        } else if (localStorage.getItem('token')) {
          const res = await getProjects();
          if (res && res.success && Array.isArray(res.projects) && res.projects.length > 0) {
            list = res.projects.map(p => ({
              id: p._id || p.id,
              _id: p._id || p.id,
              name: p.projectName || p.name || 'Project',
              code: p.code || 'PRJ'
            }));
          }
        }

        setProjectsList(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0]._id);
        }
      } catch (err) {
        console.warn("Failed to load projects for timeline:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch project details & milestones when selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchProjectTimeline = async () => {
      setLoadingTimeline(true);
      try {
        const [detailRes, timelineRes] = await Promise.all([
          getClientProjectDetail(selectedProjectId),
          getClientProjectTimeline(selectedProjectId)
        ]);

        let miles = [];
        if (detailRes && detailRes.success && detailRes.project) {
          setSelectedProjectDoc(detailRes.project);
          miles = detailRes.project.milestones || [];
        }

        if (miles.length === 0 && timelineRes && timelineRes.success && Array.isArray(timelineRes.timeline)) {
          miles = timelineRes.timeline;
        }

        setMilestonesList(miles);
      } catch (err) {
        console.warn("Error fetching timeline data for project:", err);
        setMilestonesList([]);
      } finally {
        setLoadingTimeline(false);
      }
    };
    fetchProjectTimeline();
  }, [selectedProjectId]);

  const togglePhase = (pId) => {
    setExpandedPhases(prev => ({ ...prev, [pId]: !prev[pId] }));
  };

  // Group milestones into dynamic phases
  const getDynamicPhases = () => {
    if (!milestonesList || milestonesList.length === 0) return [];

    const completed = milestonesList.filter(m => m.isCompleted || m.status === 'COMPLETED' || m.status === 'Completed');
    const pending = milestonesList.filter(m => !m.isCompleted && m.status !== 'COMPLETED' && m.status !== 'Completed');

    const phases = [];

    if (completed.length > 0) {
      phases.push({
        phaseId: 'p1',
        phaseName: 'Phase 1: Completed Architectural & Site Handovers',
        dateRange: 'Active Execution',
        team: [{ name: 'Project Team', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }],
        items: completed.map((m, idx) => ({
          id: m._id || m.id || `M-${idx + 1}`,
          name: m.name || m.title || `Milestone Target ${idx + 1}`,
          isSub: false,
          isChecked: true,
          isCompleteCheck: true,
          statusColor: 'bg-emerald-500 text-white',
          startCol: 1 + (idx % 3),
          spanCol: 2,
          date: formatDate(m.targetDate || m.dueDate),
          status: 'Completed'
        }))
      });
    }

    if (pending.length > 0) {
      phases.push({
        phaseId: 'p2',
        phaseName: 'Phase 2: Upcoming Milestone Targets & Construction Deliverables',
        dateRange: 'Scheduled Targets',
        team: [{ name: 'Engineering Team', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }],
        items: pending.map((m, idx) => ({
          id: m._id || m.id || `M-${completed.length + idx + 1}`,
          name: m.name || m.title || `Scheduled Target ${idx + 1}`,
          isSub: false,
          isChecked: false,
          isCompleteCheck: false,
          statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900',
          startCol: 2 + (idx % 4),
          spanCol: 2,
          date: formatDate(m.targetDate || m.dueDate),
          status: 'In Progress'
        }))
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return phases.map(p => ({
        ...p,
        items: p.items.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      })).filter(p => p.items.length > 0);
    }

    return phases;
  };

  const dynamicPhases = getDynamicPhases();
  const allItems = dynamicPhases.flatMap(p => p.items);

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-16 w-full max-w-[1400px] mx-auto">
      
      {/* 0. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Client Project Milestone Timeline
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-normal">
            Track real-time construction progress, completed phases & upcoming site handovers
          </p>
        </div>
      </div>

      {/* 1. TOP BREADCRUMB & CONTROL BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Project Title Dropdown */}
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium flex-wrap">
            <span>Projects</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            {loadingProjects ? (
              <span className="text-xs text-slate-400 font-normal">Loading projects...</span>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="font-semibold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer text-sm pr-2"
              >
                {projectsList.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.code ? `${p.code} / ${p.name}` : p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right Action Controls & View Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Toggle Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setExpandedPhases({ p1: true, p2: true, p3: true });
                  setSearchQuery('');
                }}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Expand All Phases"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* View Tabs Switcher */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 text-xs font-medium border border-slate-200/80">
              {['Table', 'Timeline', 'Calendar', 'Board'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'Table' && <Table className="w-3.5 h-3.5" />}
                  {tab === 'Timeline' && <Clock className="w-3.5 h-3.5 text-indigo-600" />}
                  {tab === 'Calendar' && <CalendarIcon className="w-3.5 h-3.5" />}
                  {tab === 'Board' && <Kanban className="w-3.5 h-3.5" />}
                  <span>{tab}</span>
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Expandable Search Filter input */}
        {showSearchInput && (
          <div className="pt-2 animate-in fade-in">
            <input
              type="text"
              placeholder="Search tasks, milestones, or IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-slate-50"
            />
          </div>
        )}

      </div>

      {/* Loading state */}
      {loadingTimeline ? (
        <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/90">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-normal">Loading project timeline and milestones...</p>
        </div>
      ) : dynamicPhases.length > 0 ? (
        
        activeTab === 'Timeline' ? (
          /* GANTT TIMELINE MAIN CONTAINER */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="grid grid-cols-12 border-b border-slate-200/90 bg-slate-50/70 text-xs font-medium text-slate-500 py-2.5 px-4 items-center">
              <div className="col-span-4 text-xs font-semibold text-slate-700 uppercase tracking-wider pl-2">
                ITEMS
              </div>
              <div className="col-span-8 grid grid-cols-7 text-center font-mono text-xs text-slate-400">
                {monthsHeader.map(m => (
                  <span key={m} className="border-l border-slate-200/40 py-1 font-normal">{m}</span>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {dynamicPhases.map((phase) => {
                const isExpanded = expandedPhases[phase.phaseId];

                return (
                  <div key={phase.phaseId} className="space-y-0">
                    <div 
                      onClick={() => togglePhase(phase.phaseId)}
                      className="bg-slate-50/90 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap cursor-pointer hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="font-semibold text-slate-900 text-xs">
                          {phase.phaseName}
                        </span>
                        
                        <div className="px-3 py-1 bg-white border border-slate-200/90 rounded-full text-[10px] text-slate-600 flex items-center gap-1.5 shadow-2xs font-normal">
                          <span>Timeline: {phase.dateRange}</span>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="divide-y divide-slate-100">
                        {phase.items.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => setSelectedItemModal(item)}
                            className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-slate-50/80 transition-colors group text-xs cursor-pointer"
                          >
                            <div className="col-span-4 flex items-center gap-2 pr-2">
                              {item.isCompleteCheck ? (
                                <span className="p-0.5 bg-emerald-500 rounded-full text-white">
                                  <Check className="w-3 h-3" />
                                </span>
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"></span>
                              )}
                              
                              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{item.id.substring(0, 6)}</span>
                              <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                            </div>

                            <div className="col-span-8 relative h-7 flex items-center">
                              <div className="w-full grid grid-cols-7 h-full absolute inset-0 pointer-events-none">
                                {monthsHeader.map((_, i) => (
                                  <div key={i} className="border-l border-slate-100 h-full"></div>
                                ))}
                              </div>

                              <div 
                                className={`h-6 rounded-xl text-[10px] font-medium flex items-center justify-between px-3 z-10 transition-all shadow-2xs ${item.statusColor}`}
                                style={{ 
                                  gridColumnStart: item.startCol, 
                                  gridColumnEnd: `span ${item.spanCol}` 
                                }}
                              >
                                <span className="truncate">{item.date}</span>
                                {item.isCompleteCheck && <Check className="w-3 h-3 shrink-0" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'Table' ? (
          /* TABLE VIEW */
          <Card title="Project Milestones Table" subtitle="Detailed breakdown of construction milestone targets">
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Milestone Target</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {allItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                          item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => setSelectedItemModal(item)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-xs cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : activeTab === 'Calendar' ? (
          /* CALENDAR VIEW */
          <Card title="Construction Calendar View" subtitle="Monthly milestone schedule">
            <div className="grid grid-cols-7 gap-2 pt-2 text-center text-xs font-normal text-slate-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 bg-slate-50 rounded-xl uppercase text-[10px] font-semibold">{day}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-50/60 rounded-2xl p-2 border border-slate-200/50 flex flex-col justify-between text-left">
                  <span className="text-[10px] font-medium text-slate-400">{i + 1}</span>
                  {allItems[i % allItems.length] && (
                    <span className="bg-brand-primary text-slate-900 text-[9px] font-medium p-1 rounded-lg truncate">
                      {allItems[i % allItems.length].name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          /* KANBAN BOARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-normal">
            {['Completed', 'In Progress'].map(statusName => (
              <Card key={statusName} title={`${statusName} Milestones`}>
                <div className="space-y-3 pt-2">
                  {allItems.filter(i => i.status === statusName).map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItemModal(item)}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 cursor-pointer hover:border-brand-secondary"
                    >
                      <strong className="text-slate-900 block text-xs font-semibold">{item.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">Target Date: {item.date}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/90 p-8 font-normal">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No milestones registered for this project yet.</p>
          <p className="text-[11px] text-slate-400">Construction progress will appear here as phase targets are assigned to this project.</p>
        </div>
      )}

      {/* ITEM INSPECTION MODAL */}
      {selectedItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans text-left">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">{selectedItemModal.name}</h3>
              </div>
              <button onClick={() => setSelectedItemModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <div className="space-y-3 text-xs font-normal text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-medium block">Status & Target Date</span>
                <span className="text-slate-900 font-semibold block">{selectedItemModal.status} &bull; {selectedItemModal.date}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Architectural milestone deliverable verified according to structural safety codes and GFC drawing releases.
              </p>
            </div>

            <button 
              onClick={() => setSelectedItemModal(null)}
              className="w-full py-2.5 bg-brand-primary text-slate-900 font-semibold text-xs rounded-xl shadow-2xs cursor-pointer border border-brand-secondary/40"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
