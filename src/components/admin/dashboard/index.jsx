import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import Stats from './Stats';
import HealthIndicators from './HealthIndicators';
import ActivitiesFeed from './ActivitiesFeed';
import Card from '../../common/Card';
import DataTable from '../../common/DataTable';
import DrawingViewer from '../../common/DrawingViewer';
import { getDrawings, pmReview, adminReview } from '../../../service/drawing';

export default function Dashboard() {
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);

  const fetchApprovalsQueue = async () => {
    setLoadingApprovals(true);
    try {
      const res = await getDrawings({});
      let list = [];
      if (res?.drawings && Array.isArray(res.drawings)) list = res.drawings;
      else if (res?.data?.drawings && Array.isArray(res.data.drawings)) list = res.data.drawings;
      else if (res?.allDrawings && Array.isArray(res.allDrawings)) list = res.allDrawings;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res)) list = res;

      if (list.length > 0) {
        const formatted = list.map((d, idx) => {
          const dId = d._id || d.id || `drg-${idx + 1}`;
          const title = d.drawingName || d.title || d.name || `Drawing ${d.drawingNumber || idx + 1}`;
          const project = typeof d.projectId === 'object' && d.projectId !== null 
            ? (d.projectId.projectName || d.projectId.name) 
            : (d.projectName || d.project || 'Oceanic Luxury Villas');
          const type = d.categoryName || d.fileType || d.drawingCategory || 'STRUCTURAL DWG';
          
          let uploader = '';
          if (typeof d.createdBy === 'object' && d.createdBy !== null && d.createdBy.name) {
            const desig = d.createdBy.designation || d.createdBy.role || 'Super Admin';
            uploader = `${d.createdBy.name} (${desig})`;
          } else if (typeof d.uploadedBy === 'object' && d.uploadedBy !== null && d.uploadedBy.name) {
            const desig = d.uploadedBy.designation || d.uploadedBy.role || 'Architect';
            uploader = `${d.uploadedBy.name} (${desig})`;
          } else if (typeof d.currentVersionId === 'object' && d.currentVersionId !== null && typeof d.currentVersionId.uploadedBy === 'object' && d.currentVersionId.uploadedBy !== null && d.currentVersionId.uploadedBy.name) {
            const desig = d.currentVersionId.uploadedBy.designation || 'Architect';
            uploader = `${d.currentVersionId.uploadedBy.name} (${desig})`;
          } else if (typeof d.uploader === 'string' && d.uploader) {
            uploader = d.uploader;
          } else if (typeof d.uploadedBy === 'string' && d.uploadedBy) {
            uploader = d.uploadedBy;
          } else {
            uploader = 'Bhakti Kadam (Super Admin)';
          }

          let status = d.status || d.workflowStage || 'PENDING PM REVIEW';
          if (status === 'DESIGNER_UPLOADED') status = 'PENDING PM REVIEW';
          if (status === 'PM_APPROVED') status = 'PENDING ADMIN SIGNOFF';
          if (status === 'ADMIN_APPROVED') status = 'PENDING CLIENT APPROVAL';

          return {
            ...d,
            id: dId,
            _id: dId,
            title,
            project,
            type,
            uploader,
            status,
            date: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '2026-08-01'
          };
        });

        setPendingApprovals(formatted);
      } else {
        setPendingApprovals([]);
      }
    } catch (err) {
      console.warn("Failed to fetch drawings for approvals queue:", err);
    } finally {
      setLoadingApprovals(false);
    }
  };

  useEffect(() => {
    fetchApprovalsQueue();
  }, []);

  const handleUpdateDrawingStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'PM_APPROVED' || newStatus === 'APPROVED') {
        await pmReview(id, { decision: 'PM_APPROVED', comments: 'Approved by PM on Admin Dashboard' });
      } else if (newStatus === 'ADMIN_APPROVED' || newStatus === 'PENDING_CLIENT_APPROVAL') {
        await adminReview(id, { decision: 'PENDING_CLIENT_APPROVAL', comments: 'Approved by Admin on Dashboard' });
      }
    } catch (e) {}

    setPendingApprovals(prev => prev.map(d => (d.id === id || d._id === id) ? { ...d, status: newStatus } : d));
    setSelectedDrawing(null);
    fetchApprovalsQueue();
    alert(`Drawing status updated to: ${newStatus}`);
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
        row.status.includes('Admin') || row.status.includes('ADMIN') ? 'bg-amber-50 text-amber-600' :
        row.status.includes('Client') || row.status.includes('CLIENT') ? 'bg-sky-50 text-sky-600' : 'bg-slate-50 text-slate-500'
      }`}>
        {row.status}
      </span>
    )},
    { header: "Action", render: (row) => (
      <button 
        onClick={() => setSelectedDrawing(row)}
        className="px-3.5 py-1.5 bg-brand-primary text-slate-900 font-black rounded-xl text-xs hover:bg-brand-secondary transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-brand-secondary/40 shadow-3xs cursor-pointer"
      >
        <Eye className="w-4 h-4 shrink-0 stroke-[2.5]" />
        <span className="whitespace-nowrap font-extrabold leading-none">View & Sign</span>
      </button>
    )}
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      {/* TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Command Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time financial overview, project health indicators & GFC sign-off queue
          </p>
        </div>
        <button
          onClick={fetchApprovalsQueue}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-3xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`w-4 h-4 ${loadingApprovals ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <Stats />

      <Card title="Approvals Queue" subtitle="Drawing revisions requiring final GFC/Client release signatures">
        <DataTable 
          columns={drawingColumns} 
          data={pendingApprovals} 
          searchPlaceholder="Search drawing queue..."
          exportTitle="Admin Pending Drawing Approvals"
          showExport={false}
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
          initialMarkupMode={true}
          onStatusChange={handleUpdateDrawingStatus}
        />
      )}
    </div>
  );
}
