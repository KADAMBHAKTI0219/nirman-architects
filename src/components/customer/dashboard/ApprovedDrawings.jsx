import React, { useState } from 'react';
import Card from '../../common/Card';
import DataTable from '../../common/DataTable';
import DrawingViewer from '../../common/DrawingViewer';
import { Download } from 'lucide-react';

export default function ApprovedDrawings() {
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [clientDrawings, setClientDrawings] = useState([
    { id: 1, title: "Central Lobby 3D Architectural Render", category: "Interior 3D View", status: "Awaiting Client Approval", date: "2026-07-22" },
    { id: 2, title: "Ground Floor Wall Layout Blueprint", category: "Working DWG", status: "Approved by Client", date: "2026-07-20" },
    { id: 3, title: "L3 Electrical & Power Routing Blueprint", category: "Service DWG", status: "Awaiting Client Approval", date: "2026-07-21" },
    { id: 4, title: "Plumbing Main Riser Schematic V1.0", category: "GFC Approved", status: "Approved by Client", date: "2026-07-15" }
  ]);

  const handleUpdateDrawingStatus = (id, newStatus) => {
    setClientDrawings(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    setSelectedDrawing(null);
  };

  const handleClientApprove = (id, action) => {
    const statusText = action === 'approve' ? 'Approved by Client' : 'Revisions Requested';
    setClientDrawings(prev => prev.map(d => d.id === id ? { ...d, status: statusText } : d));
    alert(`Drawing marked as: ${statusText}`);
  };

  const drawingColumns = [
    { header: "Drawing & Category", accessor: "title", render: (row) => (
      <div>
        <span className="font-bold text-slate-805 block cursor-pointer hover:text-brand-primary" onClick={() => setSelectedDrawing(row)}>
          {row.title}
        </span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase">{row.category}</span>
      </div>
    )},
    { header: "Uploaded Date", accessor: "date" },
    { header: "Approval Status", accessor: "status", render: (row) => (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
        row.status.includes('Approved') ? 'bg-emerald-50 text-emerald-600' :
        row.status.includes('Awaiting') ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
      }`}>
        {row.status}
      </span>
    )},
    { header: "Review Action", render: (row) => (
      row.status.includes('Awaiting') ? (
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handleClientApprove(row.id, 'approve')}
            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-605 rounded-lg text-[10px] font-bold transition-all"
          >
            Approve
          </button>
          <button 
            onClick={() => handleClientApprove(row.id, 'reject')}
            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-605 rounded-lg text-[10px] font-bold transition-all"
          >
            Revise
          </button>
        </div>
      ) : (
        <button 
          onClick={() => alert(`Downloading blueprint... Successful.`)}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-707 font-bold rounded-lg text-[10px] transition-all"
        >
          <Download className="w-3 h-3" />
          Download PDF
        </button>
      )
    )}
  ];

  return (
    <Card title="Drawings Approval Pipeline" subtitle="Download finalized schematics or approve pending concept drafts">
      <DataTable 
        columns={drawingColumns} 
        data={clientDrawings} 
        searchPlaceholder="Search drawing files..."
        exportTitle="Client Drawings Approved Logs"
      />

      {selectedDrawing && (
        <DrawingViewer 
          drawing={selectedDrawing} 
          onClose={() => setSelectedDrawing(null)} 
          onStatusChange={handleUpdateDrawingStatus}
        />
      )}
    </Card>
  );
}
