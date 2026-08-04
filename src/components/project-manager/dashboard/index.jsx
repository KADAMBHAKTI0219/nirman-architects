import React, { useState, useEffect } from 'react';
import Stats from './Stats';
import ProjectTimelineList from './ProjectTimelineList';
import TeamWorkloadChart from './TeamWorkloadChart';
import ClientQueriesPanel from './ClientQueriesPanel';
import Card from '../../common/Card';
import DataTable from '../../common/DataTable';
import DrawingViewer from '../../common/DrawingViewer';
import MarkupEditor from '../../admin/markup/MarkupEditor';
import { getProjectAttendance, getHRDashboardWidgets } from '../../../service/mockApi';

import SiteLocationManagerModal from '../projects/SiteLocationManagerModal';
import { MapPin, Globe } from 'lucide-react';

export default function Dashboard() {
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [pmAttendance, setPmAttendance] = useState([]);
  const [widgets, setWidgets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSiteLocationModalOpen, setIsSiteLocationModalOpen] = useState(false);

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
      } catch (err) {
        console.error('Failed to load PM data', err);
      } finally {
        setLoading(false);
      }
    };
    loadPMData();
  }, []);

  const [drawingQueue, setDrawingQueue] = useState([
    { id: 1, title: "Foundation Elevation Details V2.1", project: "Oceanic Luxury Villas", type: "Structural DWG", uploader: "Sarah Connor (Architect)", status: "Awaiting PM Approval", date: "2026-07-22" },
    { id: 2, title: "HVAC Layout Schematic V1.0", project: "Smart City Mall", type: "Service DWG", uploader: "Mike Tyson (Designer)", status: "Awaiting PM Approval", date: "2026-07-21" },
    { id: 3, title: "Bioclimatic Facade Mockup V1.3", project: "Central Office Tower", type: "Concept DWG", uploader: "Sarah Connor (Architect)", status: "Awaiting Client Signoff", date: "2026-07-20" }
  ]);

  const handleUpdateDrawingStatus = (id, newStatus) => {
    setDrawingQueue(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    setSelectedDrawing(null);
    alert(`Drawing marked as: ${newStatus}`);
  };

  const drawingColumns = [
    { header: "Drawing Name", accessor: "title", render: (row) => (
      <div>
        <span className="font-bold text-slate-805 block hover:text-brand-primary cursor-pointer" onClick={() => setSelectedDrawing(row)}>
          {row.title}
        </span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase">{row.type}</span>
      </div>
    )},
    { header: "Project", accessor: "project" },
    { header: "Uploaded By", accessor: "uploader" },
    { header: "Stage", accessor: "status", render: (row) => (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
        row.status.includes('PM') ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
      }`}>
        {row.status}
      </span>
    )},
    { header: "Action", render: (row) => (
      <button 
        onClick={() => setSelectedDrawing(row)}
        className="px-3 py-1 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-bold rounded-lg text-xs transition-colors"
      >
        Review DWG
      </button>
    )}
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls (PM Site Location Geo-Fence Setup Button) */}
      <div className="bg-slate-900 text-white p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Project Site Geo-Fencing</h3>
            <p className="text-[10px] text-slate-400 font-medium">Configure GPS coordinates & allowed radiuses for site punch-in</p>
          </div>
        </div>
        <button
          onClick={() => setIsSiteLocationModalOpen(true)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          <span>Configure Site Locations</span>
        </button>
      </div>

      <Stats pmAttendance={pmAttendance} widgets={widgets} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectTimelineList />
        </div>
        <div>
          <TeamWorkloadChart />
        </div>
      </div>

      <Card title="Drawing Approval Queue" subtitle="Design blueprints submitted for Project Manager verification">
        <DataTable 
          columns={drawingColumns} 
          data={drawingQueue} 
          searchPlaceholder="Search drawings..."
          exportTitle="PM Pending Drawing Review"
        />
      </Card>

      <ClientQueriesPanel />

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
            handleUpdateDrawingStatus(selectedDrawing.id, 'Approved');
            setSelectedDrawing(null);
          }}
        />
      )}

      {/* PM Site Geo-Fence Location Manager Modal */}
      <SiteLocationManagerModal
        isOpen={isSiteLocationModalOpen}
        onClose={() => setIsSiteLocationModalOpen(false)}
      />
    </div>
  );
}
