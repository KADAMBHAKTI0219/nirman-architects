import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Eye, Download, ShieldCheck, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import Card from '../../common/Card';
import { getClientEngagementSummary, getDocumentAccessLog } from '../../../service/document';

const COLORS_TYPE = ['#8FC9FF', '#A2D2FF', '#B0E0FE', '#D1E8FC', '#E5F0FA', '#34D399', '#FBBF24'];

export default function DocumentReports({ documents = [] }) {
  const [engagement, setEngagement] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEngagementData = async () => {
      setLoading(true);
      try {
        const [engRes, logRes] = await Promise.all([
          getClientEngagementSummary('client-1'),
          getDocumentAccessLog('')
        ]);
        if (engRes && engRes.summary) {
          setEngagement(engRes.summary);
        }
        if (logRes && logRes.accessLogs) {
          setAccessLogs(logRes.accessLogs);
        }
      } catch (err) {
        console.error("Failed to load document engagement reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, []);

  // 1. Process project-wise document count
  const projectCounts = {};
  documents.forEach(d => {
    const projName = d.project || 'Central Office Tower';
    projectCounts[projName] = (projectCounts[projName] || 0) + 1;
  });
  const projectData = Object.keys(projectCounts).map(key => ({
    name: key,
    value: projectCounts[key]
  }));

  // 2. Process file type distribution
  const typeCounts = {};
  documents.forEach(d => {
    const t = d.type || 'PDF';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const typeData = Object.keys(typeCounts).map(key => ({
    name: key,
    value: typeCounts[key]
  }));

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* SECTION 1: CLIENT DOCUMENT ENGAGEMENT ANALYTICS (18.5) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">CRM Module 6 - Client Portal Engagement</span>
            <h3 className="text-sm font-extrabold text-slate-900">Client Document Engagement Analytics</h3>
          </div>
          {engagement && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {engagement.engagementRatePercent}% Engagement Rate
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Shared Documents</span>
            <strong className="text-xl font-extrabold text-slate-900 block mt-1">{engagement?.totalSharedDocuments || 5}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Visible to Client Portal</span>
          </div>

          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
            <span className="text-[10px] text-indigo-600 font-bold uppercase block">Engaged Documents</span>
            <strong className="text-xl font-extrabold text-indigo-900 block mt-1">{engagement?.totalEngagedDocuments || 3}</strong>
            <span className="text-[10px] text-indigo-600 font-medium">Opened or downloaded by Client</span>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">Unopened Shared Docs</span>
            <strong className="text-xl font-extrabold text-amber-900 block mt-1">
              {engagement?.unopenedDocuments?.length || 2}
            </strong>
            <span className="text-[10px] text-amber-700 font-medium">Prioritized for PM follow-up</span>
          </div>
        </div>

        {/* Unopened Shared Documents Prioritization List */}
        {engagement?.unopenedDocuments && engagement.unopenedDocuments.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Unopened Documents (Requires Follow-Up)</span>
            <div className="space-y-2">
              {engagement.unopenedDocuments.map(doc => (
                <div key={doc._id} className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <div>
                      <strong className="text-slate-900 font-bold block">{doc.fileName}</strong>
                      <span className="text-[10px] text-slate-500">{doc.category}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Sent follow-up reminder to client for: ${doc.fileName}`)}
                    className="px-3 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-xl cursor-pointer hover:bg-amber-700 transition-all"
                  >
                    Send Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: CLIENT DOCUMENT ACCESS LOGS (18.4) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Audit Trail (18.4)</span>
            <h3 className="text-sm font-extrabold text-slate-900">Client Contact Document Access Logs</h3>
          </div>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-md">
            {accessLogs.length} Access Events Logged
          </span>
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {accessLogs.map(log => (
            <div key={log._id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  log.action === 'DOWNLOAD' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {log.action === 'DOWNLOAD' ? <Download className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block">{log.contactId?.name || 'Kadam Bhakti'}</strong>
                  <span className="text-[10px] text-slate-500 font-mono">{log.contactId?.email || 'bhakti@gmail.com'} • Action: <strong className="text-slate-700 font-extrabold">{log.action}</strong></span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {log.accessedAt ? new Date(log.accessedAt).toLocaleString() : 'Recent'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: REPOSITORY CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Project-wise Documents Count */}
        <Card title="Document Count by Project" subtitle="Volume of archived files inside project-wise repositories">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="value" fill="#A2D2FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: File Type Distribution Donut Chart */}
        <Card title="Repository Format Types" subtitle="Distribution of PDF, DWG, XLSX, and ZIP files">
          <div className="h-64 flex flex-col justify-center items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
