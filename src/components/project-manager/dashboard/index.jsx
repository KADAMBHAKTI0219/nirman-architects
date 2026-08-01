import React, { useState, useEffect } from 'react';
import Stats from './Stats';
import ProjectTimelineList from './ProjectTimelineList';
import TeamWorkloadChart from './TeamWorkloadChart';
import ClientQueriesPanel from './ClientQueriesPanel';
import Card from '../../common/Card';
import DataTable from '../../common/DataTable';
import DrawingViewer from '../../common/DrawingViewer';
import { getProjectAttendance, getHRDashboardWidgets } from '../../../service/mockApi';

export default function Dashboard() {
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [pmAttendance, setPmAttendance] = useState([]);
  const [widgets, setWidgets] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPMData = async () => {
      try {
        setLoading(true);
        
        // Load PM specific stats widgets dynamically
        const widgetsRes = await getHRDashboardWidgets();
        if (widgetsRes.success && widgetsRes.data) {
          setWidgets(widgetsRes.data);
        }

        // Load project team attendance list
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
        <DrawingViewer 
          drawing={selectedDrawing} 
          onClose={() => setSelectedDrawing(null)} 
          onStatusChange={handleUpdateDrawingStatus}
        />
      )}
    </div>
  );
}
