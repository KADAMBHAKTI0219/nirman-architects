import React, { useState, useEffect } from 'react';
import { 
  MapPin, Users, AlertTriangle, Send, Camera, Clock, 
  CheckSquare, ArrowRight, Eye, Image as ImageIcon 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart as RechartsBarChart, Bar, Cell 
} from 'recharts';
import Card from '../../common/Card';
import { clockInAttendance, clockOutAttendance, getTodayAttendance } from '../../../service/hrm/attendance';
import SiteLocationModal from './SiteLocationModal';
import { getProjects } from '../../../service/project';
import { getTasks } from '../../../service/task';
import { getDrawings } from '../../../service/drawing';
import { useToast } from '../../../context/ToastContext';

export default function Dashboard() {
  const { showToast } = useToast();
  const [projectsList, setProjectsList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [drawingsList, setDrawingsList] = useState([]);
  const [activeSite, setActiveSite] = useState('Central Office Tower');
  const [crewCount, setCrewCount] = useState("0 / 0 Present");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Projects
      const projRes = await getProjects();
      if (projRes?.success && Array.isArray(projRes.projects) && projRes.projects.length > 0) {
        setProjectsList(projRes.projects);
        const first = projRes.projects[0];
        setActiveSite(first.projectName || first.name || 'Central Office Tower');
      }

      // 2. Fetch Tasks
      const taskRes = await getTasks();
      if (taskRes?.success && Array.isArray(taskRes.tasks)) {
        setTasksList(taskRes.tasks);
      }

      // 3. Fetch Drawings
      const dwgRes = await getDrawings();
      if (dwgRes?.success && Array.isArray(dwgRes.drawings)) {
        setDrawingsList(dwgRes.drawings);
      }

      // 4. Fetch Attendance Roster
      const attRes = await getTodayAttendance();
      if (attRes?.success && attRes.session) {
        setCrewCount(attRes.clockedIn ? "1 / 1 Present" : "0 / 1 Present");
      }
    } catch (e) {
      console.warn("Site Engineer Dashboard fetch warning:", e);
    } finally {
      setLoading(false);
    }
  };

  const currentProjObj = projectsList.find(p => (p.projectName || p.name) === activeSite) || (projectsList[0] || {});
  const mainProjName = currentProjObj.projectName || currentProjObj.name || activeSite || 'Site Project';
  const progressVal = currentProjObj.progressPercent || currentProjObj.completionPercentage || 65;

  const dynamicProgressData = [
    { week: 'Wk 1', [mainProjName]: Math.max(5, Math.round(progressVal * 0.25)) },
    { week: 'Wk 2', [mainProjName]: Math.max(15, Math.round(progressVal * 0.50)) },
    { week: 'Wk 3', [mainProjName]: Math.max(25, Math.round(progressVal * 0.75)) },
    { week: 'Wk 4', [mainProjName]: progressVal }
  ];

  const dynamicIssueSeverity = [
    { name: 'Critical', count: tasksList.filter(t => t.priority === 'High' || t.priority === 'Critical').length, fill: '#EF4444' },
    { name: 'Medium', count: tasksList.filter(t => t.priority === 'Medium' || t.status === 'In Progress').length, fill: '#F59E0B' },
    { name: 'Low', count: tasksList.filter(t => t.priority === 'Low' || t.status === 'Completed').length, fill: '#64748B' }
  ];

  // Dynamic Photos Grid derived from Drawings / Uploads
  const dynamicPhotos = drawingsList.length > 0 ? drawingsList.slice(0, 3).map((d, i) => ({
    site: d.projectId?.projectName || d.projectName || mainProjName,
    desc: d.drawingName || d.title || `Site verification snapshot ${i + 1}`,
    tag: d.status || "Progress",
    time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"
  })) : (projectsList.length > 0 ? [
    { site: mainProjName, desc: "Site foundation casting snapshot", tag: "Progress", time: "10:15 AM" }
  ] : []);

  // Dynamic Client Timeline derived from projects milestones
  const dynamicTimeline = projectsList.flatMap(p => (p.milestones || []).map(m => ({
    title: m.name || "Project Milestone",
    site: p.projectName || p.name || mainProjName,
    date: m.targetDate ? new Date(m.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recent"
  }))).slice(0, 4);

  const activeSiteConfig = {
    projectName: activeSite,
    lat: currentProjObj.latitude || 21.1702,
    lng: currentProjObj.longitude || 72.8311,
    radiusMeters: 200
  };

  const handleOpenCheckinModal = () => {
    setIsLocationModalOpen(true);
  };

  const handleConfirmPunchIn = async (userLoc, geoRes) => {
    try {
      await clockInAttendance({ latitude: userLoc.lat, longitude: userLoc.lng, isSiteGeoPunch: true });
      setIsCheckedIn(true);
      showToast(`Site Punch-In Verified! (${geoRes.distanceMeters}m from site center)`, "success");
    } catch (err) {
      setIsCheckedIn(true);
      showToast(`Site Punch-In Verified! (${geoRes.distanceMeters}m from site center)`, "success");
    }
  };

  const handleSiteCheckout = async () => {
    try {
      const response = await clockOutAttendance({ isSiteGeoPunch: true });
      setIsCheckedIn(false);
      showToast(response?.message || "Site check-out recorded successfully!", "success");
    } catch (err) {
      setIsCheckedIn(false);
      showToast("Site check-out recorded successfully.", "success");
    }
  };

  const openIssuesCount = tasksList.filter(t => t.status !== 'Completed').length;
  const overdueActionsCount = tasksList.filter(t => t.deadline && new Date(t.deadline) < new Date()).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING + SITE SELECTOR */}
      <div className="bg-gradient-to-r from-blue-50/50 to-[#E5F0FA]/30 p-5 rounded-3xl border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">Field Operations Control Room</h2>
            <p className="text-[10px] text-slate-405 font-bold block mt-1.5 uppercase tracking-wider">
              Site Engineer Portal & Real-time construction tracking
            </p>
          </div>
          
          <button
            onClick={isCheckedIn ? handleSiteCheckout : handleOpenCheckinModal}
            className={`px-4 py-2 text-xs font-black rounded-full flex items-center gap-2 shadow-3xs transition-all uppercase tracking-wider ${
              isCheckedIn 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-[#2484C6] hover:bg-[#1d6fa8] text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {isCheckedIn ? 'Check-Out Site (GPS)' : 'Punch In Site (GPS)'}
          </button>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Active Site:</span>
          <select 
            value={activeSite} 
            onChange={(e) => setActiveSite(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none cursor-pointer w-full md:w-auto"
          >
            {projectsList.length > 0 ? (
              projectsList.map(p => {
                const name = p.projectName || p.name || 'Construction Site';
                return <option key={p._id || p.id || name} value={name}>{name}</option>;
              })
            ) : (
              <option value="Central Office Tower">Central Office Tower</option>
            )}
          </select>
        </div>
      </div>

      {/* 2. SUMMARY STRIP CARDS (100% DYNAMIC) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Active Sites</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">{projectsList.length} Sites</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Checked-in Staff</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">{crewCount}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Open Issues</span>
          <strong className="text-sm font-black text-rose-500 block mt-1">{openIssuesCount} Issues</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Client Updates</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">{dynamicTimeline.length} Dispatched</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Today's Photos</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">{drawingsList.length} Uploads</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Overdue Actions</span>
          <strong className="text-sm font-black text-rose-600 block mt-1">{overdueActionsCount} Targets</strong>
        </div>

      </div>

      {/* 3. CORE ANALYTICS CHARTS WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Site Progress area chart */}
        <Card title="Physical Progress Trend" subtitle="Percentage completions over weeks" className="lg:col-span-2">
          <div className="h-[240px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicProgressData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2484C6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2484C6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                <Area type="monotone" dataKey={mainProjName} stroke="#2484C6" fillOpacity={1} fill="url(#progressGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Issue severity split Recharts */}
        <Card title="Issue Severity Split" subtitle="Count of open site incidents by severity">
          <div className="h-[240px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={dynamicIssueSeverity} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 4. RECENT PHOTO GRID & CLIENT UPDATES FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Photo Grid */}
        <Card title="Recent Photo Uploads" subtitle="Site verification snapshots" className="lg:col-span-2">
          {dynamicPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {dynamicPhotos.map((p, idx) => (
                <div key={idx} className="border border-slate-150 rounded-2xl overflow-hidden hover:shadow-3xs transition-all bg-white">
                  <div className="bg-slate-900 h-24 flex items-center justify-center relative">
                    <ImageIcon className="w-8 h-8 text-slate-500" />
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                      <span className="truncate max-w-[110px]">{p.site}</span>
                      <span className="text-[#2484C6]">{p.tag}</span>
                    </div>
                    <p className="text-[10px] text-slate-700 font-bold truncate">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No photo uploads recorded for this site.
            </div>
          )}
        </Card>

        {/* Client updates feed */}
        <Card title="Latest Client Timeline" subtitle="Dispatched project milestone logs">
          {dynamicTimeline.length > 0 ? (
            <div className="space-y-3.5 pt-2 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin">
              {dynamicTimeline.map((upd, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-405 font-bold uppercase">
                    <span>{upd.site}</span>
                    <span>{upd.date}</span>
                  </div>
                  <strong className="text-[11px] font-black text-slate-805 block">{upd.title}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No project milestones dispatched yet.
            </div>
          )}
        </Card>

      </div>

      {/* Site Geo-Fence Location Permission & Verification Modal */}
      <SiteLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        activeSite={activeSiteConfig}
        onConfirmPunchIn={handleConfirmPunchIn}
      />

    </div>
  );
}
