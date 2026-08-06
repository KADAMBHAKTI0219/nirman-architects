import React, { useState, useEffect } from 'react';
import Stats from './Stats';
import ProjectTimelineList from './ProjectTimelineList';
import TeamWorkloadChart from './TeamWorkloadChart';
import ClientQueriesPanel from './ClientQueriesPanel';
import Card from '../../common/Card';
import DrawingViewer from '../../common/DrawingViewer';
import MarkupEditor from '../../admin/markup/MarkupEditor';
import { getProjectAttendance, getHRDashboardWidgets } from '../../../service/mockApi';
import { getProjectDrawings, approveDrawing, uploadDrawing } from '../../../service/drawing';
import SiteLocationManagerModal from '../projects/SiteLocationManagerModal';
import {
  MapPin, Globe, Search, Bell, Plus, Download, MoreVertical,
  FileText, CheckCircle, ArrowRight, X, Upload, FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [pmAttendance, setPmAttendance] = useState([]);
  const [widgets, setWidgets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSiteLocationModalOpen, setIsSiteLocationModalOpen] = useState(false);
  const [isNewDrawingModalOpen, setIsNewDrawingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // New Drawing Form state
  const [newDrawingTitle, setNewDrawingTitle] = useState('');
  const [newDrawingProject, setNewDrawingProject] = useState('Oceanic Luxury Villas');
  const [newDrawingCategory, setNewDrawingCategory] = useState('Structural DWG');
  const [newDrawingNotes, setNewDrawingNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [drawingQueue, setDrawingQueue] = useState([
    {
      id: 1,
      title: "Foundation Elevation Details V2.1",
      project: "Oceanic Luxury Villas",
      type: "STRUCTURAL DWG",
      uploader: "Sarah Connor",
      role: "Architect",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      status: "AWAITING PM APPROVAL",
      date: "2026-07-22"
    },
    {
      id: 2,
      title: "HVAC Layout Schematic V1.0",
      project: "Smart City Mall",
      type: "SERVICE DWG",
      uploader: "Mike Tyson",
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      status: "AWAITING PM APPROVAL",
      date: "2026-07-21"
    },
    {
      id: 3,
      title: "Bioclimatic Facade Mockup V1.3",
      project: "Central Office Tower",
      type: "CONCEPT DWG",
      uploader: "Sarah Connor",
      role: "Architect",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      status: "AWAITING CLIENT SIGNOFF",
      date: "2026-07-20"
    }
  ]);

  useEffect(() => {
    const loadPMData = async () => {
      try {
        setLoading(true);
        const widgetsRes = await getHRDashboardWidgets();
        if (widgetsRes.success && widgetsRes.data) {
          setWidgets(widgetsRes.data);
        }
        const response = await getProjectAttendance('proj_1');
        if (response.success && response.logs) {
          setPmAttendance(response.logs);
        }

        // Try loading drawings from drawing service
        const drawingsRes = await getProjectDrawings('proj-1');
        if (drawingsRes && drawingsRes.allDrawings && drawingsRes.allDrawings.length > 0) {
          const apiQueue = drawingsRes.allDrawings.map((d, index) => ({
            id: d._id || d.id || index + 10,
            title: d.title || "Blueprint Document",
            project: d.projectName || "Oceanic Luxury Villas",
            type: (d.category || "STRUCTURAL DWG").toUpperCase(),
            uploader: d.uploadedBy?.name || "Sarah Connor",
            role: d.uploadedBy?.role || "Architect",
            avatar: d.uploadedBy?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
            status: d.status || "AWAITING PM APPROVAL",
            date: d.createdAt ? d.createdAt.split('T')[0] : "2026-07-22"
          }));
          setDrawingQueue(apiQueue);
        }
      } catch (err) {
        console.error('Failed to load PM data', err);
      } finally {
        setLoading(false);
      }
    };
    loadPMData();
  }, []);

  const handleUpdateDrawingStatus = async (id, newStatus) => {
    try {
      await approveDrawing(id, `Marked as ${newStatus} by PM.`);
    } catch (e) { }
    setDrawingQueue(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    setSelectedDrawing(null);
    alert(`Drawing successfully updated to: ${newStatus}`);
  };

  const handleCreateNewDrawing = async (e) => {
    e.preventDefault();
    if (!newDrawingTitle.trim()) return;

    setIsUploading(true);
    try {
      const res = await uploadDrawing({
        title: newDrawingTitle,
        projectId: 'proj-1',
        category: newDrawingCategory,
        notes: newDrawingNotes,
        fileUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      });

      const newDoc = {
        id: res.drawing?._id || Date.now(),
        title: newDrawingTitle,
        project: newDrawingProject,
        type: newDrawingCategory.toUpperCase(),
        uploader: "Sarah Connor",
        role: "Lead PM",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
        status: "AWAITING PM APPROVAL",
        date: new Date().toISOString().split('T')[0]
      };

      setDrawingQueue(prev => [newDoc, ...prev]);
      setIsNewDrawingModalOpen(false);
      setNewDrawingTitle('');
      setNewDrawingNotes('');
      alert("New drawing blueprint uploaded successfully!");
    } catch (err) {
      alert("Error uploading drawing: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = (format) => {
    const dataStr = JSON.stringify(drawingQueue, null, 2);
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PM_Drawing_Approval_Queue.${format.toLowerCase()}`;
    link.click();
  };

  const filteredDrawings = drawingQueue.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.uploader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loggedInUserName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name) return user.name.split(' ')[0];
    } catch (e) { }
    return "John";
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* 1. TOP WELCOME & SEARCH HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5.5 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-extrabold text-[10px] uppercase tracking-wider border border-sky-400/30">
              Project Manager Command Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Good morning, {loggedInUserName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Monitor real-time project timelines, site punch-ins, client communications & drawing approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10">
          {/* Search Bar Input */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search drawings, projects, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
            />
          </div>

          {/* Notification Icon */}
          <button
            onClick={() => navigate('/project-manager/chats')}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-300 relative transition-all cursor-pointer shadow-xs"
            title="Notifications & Chats"
          >
            <Bell className="w-4 h-4 text-sky-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-slate-900">
              3
            </span>
          </button>

          {/* + New Drawing Button */}
          <button
            onClick={() => setIsNewDrawingModalOpen(true)}
            className="px-4.5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Drawing</span>
          </button>
        </div>
      </div>

      {/* 2. PROJECT SITE GEO-FENCING TOP BANNER */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-4.5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-indigo-800/40 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Globe className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-tight">Project Site Geo-Fencing System</h3>
              <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded border border-emerald-500/30 uppercase">Active</span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Configure GPS coordinates & allowed radius boundaries for automated site biometric punch-ins
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSiteLocationModalOpen(true)}
          className="px-4.5 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 relative z-10"
        >
          <MapPin className="w-4 h-4" />
          <span>Configure Site Locations</span>
        </button>
      </div>

      {/* 3. 8 STAT CARDS GRID */}
      <Stats pmAttendance={pmAttendance} widgets={widgets} />

      {/* 4. ACTIVE PROJECTS & TIMELINES + TEAM PRODUCTIVITY GRID (Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectTimelineList />
        </div>
        <div>
          <TeamWorkloadChart />
        </div>
      </div>

      {/* 5. DRAWING APPROVAL QUEUE CARD (Screenshot 2) */}
      <Card
        title="Drawing Approval Queue"
        subtitle="Design blueprints submitted for Project Manager verification"
        headerAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('CSV')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-slate-400" /> CSV
            </button>
            <button
              onClick={() => handleExport('Excel')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-slate-400" /> Excel
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-slate-400" /> PDF
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-bold">DRAWING NAME</th>
                <th className="pb-3 font-bold">PROJECT</th>
                <th className="pb-3 font-bold">UPLOADED BY</th>
                <th className="pb-3 font-bold">STAGE</th>
                <th className="pb-3 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filteredDrawings.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">

                  {/* DRAWING NAME Column */}
                  <td className="py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-black text-[9px] flex items-center justify-center uppercase tracking-tight shrink-0">
                        DWG
                      </div>
                      <div>
                        <span
                          onClick={() => setSelectedDrawing(row)}
                          className="font-extrabold text-slate-850 block hover:text-sky-600 cursor-pointer transition-colors text-xs"
                        >
                          {row.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                          {row.type}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* PROJECT Column */}
                  <td className="py-3.5 align-middle font-bold text-slate-700">
                    {row.project}
                  </td>

                  {/* UPLOADED BY Column */}
                  <td className="py-3.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={row.avatar}
                        alt={row.uploader}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-3xs"
                      />
                      <div>
                        <span className="font-extrabold text-slate-800 block text-xs">{row.uploader}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">({row.role})</span>
                      </div>
                    </div>
                  </td>

                  {/* STAGE Column */}
                  <td className="py-3.5 align-middle">
                    <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider inline-block ${row.status.includes('PM') || row.status.includes('AWAITING PM')
                        ? 'bg-amber-50 text-amber-600 border border-amber-200/50'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}>
                      {row.status}
                    </span>
                  </td>

                  {/* ACTION Column */}
                  <td className="py-3.5 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5 relative">
                      <button
                        onClick={() => setSelectedDrawing(row)}
                        className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold rounded-xl text-xs transition-all border border-sky-200/60 cursor-pointer shadow-3xs"
                      >
                        Review DWG
                      </button>
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === row.id ? null : row.id)}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === row.id && (
                        <div className="absolute right-0 top-9 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1 text-left text-xs animate-in fade-in">
                          <button
                            onClick={() => handleUpdateDrawingStatus(row.id, 'APPROVED')}
                            className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-emerald-700 font-bold rounded-lg transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve Drawing
                          </button>
                          <button
                            onClick={() => handleUpdateDrawingStatus(row.id, 'CHANGES REQUESTED')}
                            className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 font-bold rounded-lg transition-colors flex items-center gap-2"
                          >
                            <X className="w-3.5 h-3.5" /> Request Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Footer Link */}
          <div className="pt-4 text-center border-t border-slate-100 mt-2">
            <button
              onClick={() => navigate('/project-manager/drawings')}
              className="text-xs font-extrabold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all drawings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* 6. CLIENT QUERIES & COMMUNICATIONS (Screenshot 2) */}
      <ClientQueriesPanel />

      {/* MARKUP / BLUEPRINT EDITOR MODAL */}
      {selectedDrawing && (
        <MarkupEditor
          documentData={{
            ...selectedDrawing,
            name: selectedDrawing.title || "Ground Floor Wall Layout Blueprint",
            fileUrl: "/architecture.pdf",
            pdfUrl: "/architecture.pdf"
          }}
          onBack={() => setSelectedDrawing(null)}
          onSaveDocument={(updatedDoc) => {
            handleUpdateDrawingStatus(selectedDrawing.id, 'APPROVED');
            setSelectedDrawing(null);
          }}
        />
      )}

      {/* NEW DRAWING UPLOAD MODAL */}
      {isNewDrawingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-900">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Upload New Drawing Blueprint</h3>
                  <p className="text-[11px] text-slate-400">Submit CAD/DWG file for PM verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewDrawingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDrawing} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Drawing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Floor Electrical Plan V1.0"
                  value={newDrawingTitle}
                  onChange={(e) => setNewDrawingTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Project</label>
                <select
                  value={newDrawingProject}
                  onChange={(e) => setNewDrawingProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
                  <option value="Central Office Tower">Central Office Tower</option>
                  <option value="Smart City Mall">Smart City Mall</option>
                  <option value="Metro Station Phase 3">Metro Station Phase 3</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Drawing Type / Category</label>
                <select
                  value={newDrawingCategory}
                  onChange={(e) => setNewDrawingCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Structural DWG">Structural DWG</option>
                  <option value="Service DWG">Service DWG</option>
                  <option value="Concept DWG">Concept DWG</option>
                  <option value="Architectural DWG">Architectural DWG</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes for Project Manager review..."
                  value={newDrawingNotes}
                  onChange={(e) => setNewDrawingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDrawingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : 'Submit Drawing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PM SITE GEO-FENCE LOCATION MANAGER MODAL */}
      <SiteLocationManagerModal
        isOpen={isSiteLocationModalOpen}
        onClose={() => setIsSiteLocationModalOpen(false)}
      />

    </div>
  );
}
