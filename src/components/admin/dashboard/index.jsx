import React, { useState } from 'react';
import Stats from './Stats';
import RevenuesChart from './RevenuesChart';
import PortfolioChart from './PortfolioChart';
import HealthIndicators from './HealthIndicators';
import ActivitiesFeed from './ActivitiesFeed';
import Card from '../../common/Card';
import DataTable from '../../common/DataTable';
import DrawingViewer from '../../common/DrawingViewer';

export default function Dashboard() {
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  // Approvals Data
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 101, title: "Foundation Elevation Details V2.1", project: "Oceanic Luxury Villas", type: "Structural DWG", uploader: "Sarah Connor (Architect)", status: "Pending PM Review", date: "2026-07-22" },
    { id: 102, title: "HVAC Layout Schematic V1.0", project: "Smart City Mall", type: "Service DWG", uploader: "Mike Tyson (Designer)", status: "Pending Client Approval", date: "2026-07-21" },
    { id: 103, title: "Plumbing Riser Diagram V1.2", project: "Central Office Tower", type: "GFC Release", uploader: "Sarah Connor (Architect)", status: "Pending Admin Signoff", date: "2026-07-20" }
  ]);

  const handleUpdateDrawingStatus = (id, newStatus) => {
    setPendingApprovals(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    setSelectedDrawing(null);
    alert(`Drawing marked as: ${newStatus}`);
  };

  const drawingColumns = [
    { header: "Drawing & Category", accessor: "title", render: (row) => (
      <div>
        <span className="font-bold text-slate-800 block cursor-pointer hover:text-brand-primary" onClick={() => setSelectedDrawing(row)}>
          {row.title}
        </span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase">{row.type}</span>
      </div>
    )},
    { header: "Project", accessor: "project" },
    { header: "Uploaded By", accessor: "uploader", render: (row) => (
      <span className="text-xs text-slate-650 font-semibold">{row.uploader}</span>
    )},
    { header: "Workflow Stage", accessor: "status", render: (row) => (
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
        row.status.includes('Admin') ? 'bg-amber-50 text-amber-600' :
        row.status.includes('Client') ? 'bg-sky-50 text-sky-600' : 'bg-slate-50 text-slate-500'
      }`}>
        {row.status}
      </span>
    )},
    { header: "Action", render: (row) => (
      <button 
        onClick={() => setSelectedDrawing(row)}
        className="px-3 py-1 bg-brand-primary text-slate-900 font-bold rounded-lg text-xs hover:bg-brand-secondary transition-all"
      >
        View & Sign
      </button>
    )}
  ];

  return (
    <div className="space-y-6">
      <Stats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenuesChart />
        </div>
        <div>
          <PortfolioChart />
        </div>
      </div>

      <Card title="Approvals Queue" subtitle="Drawing revisions requiring final GFC/Client release signatures">
        <DataTable 
          columns={drawingColumns} 
          data={pendingApprovals} 
          searchPlaceholder="Search drawing queue..."
          exportTitle="Admin Pending Drawing Approvals"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthIndicators />
        <ActivitiesFeed />
      </div>

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
