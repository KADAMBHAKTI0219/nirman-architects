import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, CheckCircle2, ChevronRight, ChevronDown, Clock, 
  Filter, Search, Table, SlidersHorizontal, Users, ArrowUpRight, 
  Sparkles, Check, CheckSquare, Layers, LayoutGrid, Kanban, RefreshCw, X, Eye, FileText
} from 'lucide-react';
import Card from '../../common/Card';
import { getClientProjectTimeline, getClientDashboard } from '../../../service/crm/clientPortal';

const TIMELINE_PHASES = [
  {
    phaseId: 'p1',
    phaseName: 'Phase: Discovery & Structure',
    dateRange: 'February 20, 2026 to January 31, 2027',
    team: [
      { name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
      { name: 'Bob Johnson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' },
      { name: 'Frank Castle', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }
    ],
    items: [
      { id: 'PD-V32', name: 'Product & Architectural Requirements', isSub: false, isChecked: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 1, spanCol: 2, avatarOnBar: false, date: '2026-02-15', status: 'Completed' },
      { id: 'PD-V33', name: 'User Journey & Spatial Flow Mapping', isSub: false, isChecked: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 2, spanCol: 3, avatarOnBar: false, date: '2026-02-28', status: 'Completed' },
      { id: 'PD-V34', name: 'Information Architecture & Floor Plans', isSub: false, isChecked: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 3, spanCol: 3, avatarOnBar: false, date: '2026-03-10', status: 'Completed' },
      { id: 'PD-V35', name: 'Core Structural Flows Definition', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 2, spanCol: 2, avatarOnBar: false, date: '2026-03-22', status: 'Completed' },
      { id: 'PD-V36', name: 'Navigation Column Grid Structure', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-emerald-500 text-white', startCol: 2, spanCol: 2, avatarOnBar: true, lightBarSpan: 3, date: '2026-04-05', status: 'Completed' },
      { id: 'PD-V37', name: 'Content Hierarchy & Room Specs', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-emerald-300/90 text-emerald-950', startCol: 2, spanCol: 2, avatarOnBar: false, date: '2026-04-18', status: 'Completed' },
      { id: 'PD-V38', name: 'Feature Scope & Foundation Alignment', isSub: true, isChecked: true, statusColor: 'bg-emerald-300/90 text-emerald-950', startCol: 3, spanCol: 1.5, avatarOnBar: false, date: '2026-04-25', status: 'Completed' },
      { id: 'PD-V39', name: 'UX Audit & Site Engineering Review', isSub: true, isChecked: true, statusColor: 'bg-emerald-300/90 text-emerald-950', startCol: 4, spanCol: 1.5, avatarOnBar: false, date: '2026-05-02', status: 'Completed' },
      { id: 'PD-V42', name: 'Stakeholder & Client Review Session', isSub: true, isChecked: true, statusColor: 'bg-emerald-300/90 text-emerald-950', startCol: 5, spanCol: 1.5, avatarOnBar: false, date: '2026-05-15', status: 'Completed' }
    ]
  },
  {
    phaseId: 'p2',
    phaseName: 'Phase: Core Features & Superstructure',
    dateRange: 'February 20, 2026 to January 31, 2027',
    team: [
      { name: 'Alice Smith', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80' },
      { name: 'Frank Castle', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }
    ],
    items: [
      { id: 'PD-V43', name: 'Authentication & Municipal Permits', isSub: false, isChecked: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 1, spanCol: 3, avatarOnBar: false, date: '2026-05-25', status: 'Completed' },
      { id: 'PD-V44', name: 'Dashboard Layout & Foundation Casting', isSub: false, isChecked: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 1.2, spanCol: 1.8, avatarOnBar: false, date: '2026-06-10', status: 'Completed' },
      { id: 'PD-V45', name: 'User Settings & Elevation Details', isSub: false, isChecked: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 1.5, spanCol: 3, avatarOnBar: false, date: '2026-06-22', status: 'In Progress' },
      { id: 'PD-V46', name: 'Profile Management & Rebar Inspection', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-indigo-300/80 border-indigo-400 text-indigo-900', startCol: 1.5, spanCol: 2, avatarOnBar: false, date: '2026-07-01', status: 'In Progress' },
      { id: 'PD-V47', name: 'Notifications & Emergency Safety Hub', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-amber-400 text-slate-950 font-bold', startCol: 1.5, spanCol: 4, avatarOnBar: true, date: '2026-07-15', status: 'In Progress' },
      { id: 'PD-V48', name: 'Search & Structural Filtering Engine', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-amber-200 text-amber-950', startCol: 2, spanCol: 1.5, avatarOnBar: false, date: '2026-08-01', status: 'Scheduled' },
      { id: 'PD-V49', name: 'Activity Feed & Concrete Batching Logs', isSub: true, isChecked: true, statusColor: 'bg-amber-200 text-amber-950', startCol: 3, spanCol: 4, avatarOnBar: false, date: '2026-08-20', status: 'Scheduled' },
      { id: 'PD-V50', name: 'Permissions & Access Role Control', isSub: true, isChecked: true, statusColor: 'bg-amber-200 text-amber-950', startCol: 6, spanCol: 1.8, avatarOnBar: false, date: '2026-09-05', status: 'Scheduled' },
      { id: 'PD-V51', name: 'Data Table Views & GFC Blueprints', isSub: true, isChecked: true, statusColor: 'bg-amber-200 text-amber-950', startCol: 6, spanCol: 1.8, avatarOnBar: false, date: '2026-09-25', status: 'Scheduled' }
    ]
  },
  {
    phaseId: 'p3',
    phaseName: 'Phase: Polish & Handover Delivery',
    dateRange: 'February 20, 2026 to January 31, 2027',
    team: [
      { name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
      { name: 'Bob Johnson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }
    ],
    items: [
      { id: 'PD-V52', name: 'Visual Design Pass & 3D Facade Renders', isSub: false, isChecked: true, statusColor: 'bg-sky-300 text-sky-950', startCol: 1, spanCol: 3, avatarOnBar: false, date: '2026-10-10', status: 'Scheduled' },
      { id: 'PD-V53', name: 'Design System Tokens & Material Specs', isSub: false, isChecked: true, statusColor: 'bg-sky-300 text-sky-950', startCol: 2, spanCol: 3, avatarOnBar: false, date: '2026-10-25', status: 'Scheduled' },
      { id: 'PD-V54', name: 'Component Refinement & Lighting Layout', isSub: false, isChecked: true, statusColor: 'bg-sky-300 text-sky-950', startCol: 3, spanCol: 3, avatarOnBar: false, date: '2026-11-05', status: 'Scheduled' },
      { id: 'PD-V55', name: 'Interaction States & MEP Inspection', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-sky-300 text-sky-950', startCol: 2, spanCol: 2, avatarOnBar: false, date: '2026-11-20', status: 'Scheduled' },
      { id: 'PD-V56', name: 'Microcopy & Final Sign-off Release', isSub: false, isChecked: true, isCompleteCheck: true, statusColor: 'bg-emerald-500 text-white', startCol: 2, spanCol: 2, avatarOnBar: true, date: '2026-12-15', status: 'Scheduled' }
    ]
  }
];

export default function CustomerTimeline() {
  const [activeTab, setActiveTab] = useState('Timeline'); // 'Table', 'Timeline', 'Calendar', 'Board'
  const [expandedPhases, setExpandedPhases] = useState({ p1: true, p2: true, p3: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [selectedProject, setSelectedProject] = useState('Oceanic Luxury Villa Architectural Design');

  const monthsHeader = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const togglePhase = (pId) => {
    setExpandedPhases(prev => ({ ...prev, [pId]: !prev[pId] }));
  };

  // Filter items by search query
  const getFilteredPhases = () => {
    if (!searchQuery.trim()) return TIMELINE_PHASES;
    const q = searchQuery.toLowerCase();
    return TIMELINE_PHASES.map(p => ({
      ...p,
      items: p.items.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
    })).filter(p => p.items.length > 0);
  };

  const filteredPhases = getFilteredPhases();

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-16 w-full max-w-[1400px] mx-auto select-none">
      
      {/* 0. TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Client Project Milestone Timeline
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Track real-time construction progress, completed phases & upcoming site handovers
          </p>
        </div>
      </div>

      {/* 1. TOP BREADCRUMB & CONTROL BAR (Identical to Screenshot) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Project Title Dropdown */}
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold flex-wrap">
            <span>Projects</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="font-extrabold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer text-sm pr-2"
            >
              <option value="Oceanic Luxury Villa Architectural Design">V3 / Oceanic Luxury Villa Architectural Design</option>
              <option value="Skyline Corporate Tower Blueprint">V2 / Skyline Corporate Tower Blueprint</option>
              <option value="Royal Palms Residency Phase 1">V1 / Royal Palms Residency Phase 1</option>
            </select>
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

            {/* View Tabs Switcher (Table | Timeline | Calendar | Board) */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 text-xs font-bold border border-slate-200/80">
              <button
                onClick={() => setActiveTab('Table')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'Table' ? 'bg-white text-slate-900 font-extrabold shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setActiveTab('Timeline')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'Timeline' ? 'bg-white text-indigo-700 font-black shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('Calendar')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'Calendar' ? 'bg-white text-slate-900 font-extrabold shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>

              <button
                onClick={() => setActiveTab('Board')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'Board' ? 'bg-white text-slate-900 font-extrabold shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
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
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>
        )}

      </div>

      {/* 2. DYNAMIC VIEW IMPLEMENTATION */}
      {activeTab === 'Timeline' ? (
        /* GANTT TIMELINE MAIN CONTAINER (Exact screenshot UI) */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          
          {/* Top Date Scale Header */}
          <div className="grid grid-cols-12 border-b border-slate-200/90 bg-slate-50/70 text-xs font-bold text-slate-500 py-2.5 px-4 items-center">
            <div className="col-span-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider pl-2">
              ITEMS
            </div>
            <div className="col-span-8 grid grid-cols-7 text-center font-mono text-xs text-slate-400">
              {monthsHeader.map(m => (
                <span key={m} className="border-l border-slate-200/40 py-1 font-semibold">{m}</span>
              ))}
            </div>
          </div>

          {/* Phase Groups Stream */}
          <div className="divide-y divide-slate-100">
            {filteredPhases.map((phase) => {
              const isExpanded = expandedPhases[phase.phaseId];

              return (
                <div key={phase.phaseId} className="space-y-0">
                  
                  {/* Phase Header Bar */}
                  <div 
                    onClick={() => togglePhase(phase.phaseId)}
                    className="bg-slate-50/90 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap cursor-pointer hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span className="font-extrabold text-slate-900 text-xs tracking-tight">
                        {phase.phaseName}
                      </span>
                      
                      {/* Date Range Badge */}
                      <div className="px-3 py-1 bg-white border border-slate-200/90 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1.5 shadow-3xs">
                        <span>Timeline: <strong>{phase.dateRange}</strong></span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>

                    {/* Team Avatar Stack */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {phase.team.map((user, idx) => (
                          <img 
                            key={idx}
                            src={user.avatar} 
                            alt={user.name} 
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" 
                            title={user.name}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        + {phase.team.length} People
                      </span>
                    </div>
                  </div>

                  {/* Items & Gantt Bars Grid */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100">
                      {phase.items.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedItemModal(item)}
                          className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-slate-50/80 transition-colors group text-xs cursor-pointer"
                        >
                          
                          {/* Left Column: Item details */}
                          <div className="col-span-4 flex items-center gap-2 pr-2">
                            <input 
                              type="checkbox" 
                              defaultChecked={item.isChecked}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer" 
                            />
                            
                            {item.isCompleteCheck ? (
                              <span className="p-0.5 bg-emerald-500 rounded-full text-white">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block"></span>
                            )}

                            <span className={`font-mono text-[10px] font-bold text-slate-400 ${item.isSub ? 'pl-4' : ''}`}>
                              {item.id}
                            </span>

                            <span className={`font-semibold text-slate-800 truncate text-xs ${item.isSub ? 'text-slate-600' : ''}`} title={item.name}>
                              {item.isSub && <span className="text-slate-400 mr-1 font-mono">↳</span>}
                              {item.name}
                            </span>
                          </div>

                          {/* Right Column: Gantt Timeline Bars */}
                          <div className="col-span-8 grid grid-cols-7 items-center relative h-8">
                            
                            {/* Column Divider Lines */}
                            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                              {monthsHeader.map((_, i) => (
                                <div key={i} className="border-l border-slate-100 h-full"></div>
                              ))}
                            </div>

                            {/* Gantt Bar */}
                            <div 
                              className="relative h-6 flex items-center z-10"
                              style={{
                                gridColumnStart: Math.floor(item.startCol),
                                gridColumnEnd: `span ${Math.ceil(item.spanCol)}`
                              }}
                            >
                              {item.lightBarSpan && (
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-emerald-100 border border-emerald-300 rounded-full z-0 flex items-center justify-end pr-2"
                                  style={{ width: '220%' }}
                                >
                                  <span className="p-0.5 bg-emerald-500 text-white rounded-full">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                </div>
                              )}

                              <div className={`w-full h-full rounded-xl px-2.5 flex items-center justify-between shadow-2xs border text-[10px] font-extrabold relative z-10 transition-all hover:brightness-95 ${item.statusColor}`}>
                                {item.avatarOnBar ? (
                                  <div className="flex items-center gap-1">
                                    <img 
                                      src={phase.team[0].avatar} 
                                      alt="User" 
                                      className="w-4 h-4 rounded-full ring-1 ring-white object-cover" 
                                    />
                                  </div>
                                ) : <span></span>}

                                <span className="p-0.5 bg-white/40 backdrop-blur-xs rounded-full">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              </div>

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
        <Card title="Project Milestones Table" subtitle="Detailed breakdown of all architectural deliverables">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Deliverable Title</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPhases.flatMap(p => p.items).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{item.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => setSelectedItemModal(item)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs"
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
          <div className="grid grid-cols-7 gap-2 pt-2 text-center text-xs font-bold text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 bg-slate-50 rounded-xl uppercase text-[10px] font-black">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-50/60 rounded-2xl p-2 border border-slate-200/50 flex flex-col justify-between text-left">
                <span className="text-[10px] font-extrabold text-slate-400">{i + 1}</span>
                {i === 14 && (
                  <span className="bg-indigo-600 text-white text-[9px] font-bold p-1 rounded-lg truncate">
                    ARCH Requirements
                  </span>
                )}
                {i === 22 && (
                  <span className="bg-emerald-600 text-white text-[9px] font-bold p-1 rounded-lg truncate">
                    Spatial Flow Signoff
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Completed', 'In Progress', 'Scheduled'].map(statusName => (
            <Card key={statusName} title={`${statusName} Tasks`}>
              <div className="space-y-3 pt-2">
                {filteredPhases.flatMap(p => p.items).filter(i => i.status === statusName).map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItemModal(item)}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 cursor-pointer hover:border-indigo-300"
                  >
                    <span className="text-[9px] font-black text-slate-400 font-mono">{item.id}</span>
                    <strong className="text-slate-900 block text-xs font-bold">{item.name}</strong>
                    <span className="text-[10px] text-slate-500 font-mono block">Target: {item.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ITEM INSPECTION MODAL */}
      {selectedItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-indigo-600 font-mono uppercase">{selectedItemModal.id}</span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedItemModal.name}</h3>
              </div>
              <button onClick={() => setSelectedItemModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <div className="space-y-3 text-xs font-medium text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Status & Target Date</span>
                <strong className="text-slate-900 font-bold block">{selectedItemModal.status} • {selectedItemModal.date}</strong>
              </div>
              <p className="text-slate-600 leading-relaxed">
                "Architectural milestone deliverable verified according to structural safety codes and GFC drawing releases."
              </p>
            </div>

            <button 
              onClick={() => setSelectedItemModal(null)}
              className="w-full py-2.5 bg-brand-primary text-slate-900 font-black text-xs uppercase rounded-xl shadow-3xs cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
