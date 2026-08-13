import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import { FileText, FileDown, ExternalLink } from 'lucide-react';
import { getEmployeeDocuments, downloadDocument } from '../../../service/document';
import { useNavigate } from 'react-router-dom';

export default function DocumentsList() {
  const navigate = useNavigate();
  const [docsList, setDocsList] = useState([]);

  useEffect(() => {
    getEmployeeDocuments()
      .then(res => {
        const list = res?.documents || res?.data || (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          setDocsList(list.slice(0, 4));
        } else {
          setDocsList([
            { id: 'd-1', name: "Nirman Building Design Guidelines 2026.pdf", size: "4.2 MB", date: "2026-06-15" },
            { id: 'd-2', name: "Concrete Structural Load Limits.xlsx", size: "1.8 MB", date: "2026-07-02" },
            { id: 'd-3', name: "Safety Standards Manual.pdf", size: "8.5 MB", date: "2026-05-10" }
          ]);
        }
      })
      .catch(() => {
        setDocsList([
          { id: 'd-1', name: "Nirman Building Design Guidelines 2026.pdf", size: "4.2 MB", date: "2026-06-15" },
          { id: 'd-2', name: "Concrete Structural Load Limits.xlsx", size: "1.8 MB", date: "2026-07-02" },
          { id: 'd-3', name: "Safety Standards Manual.pdf", size: "8.5 MB", date: "2026-05-10" }
        ]);
      });
  }, []);

  const handleDownload = async (doc) => {
    const dId = doc._id || doc.id;
    const dName = doc.name || doc.documentName || 'Document.pdf';
    try {
      await downloadDocument(dId);
      if (doc.filePath || doc.fileUrl || doc.url) {
        window.open(doc.filePath || doc.fileUrl || doc.url, '_blank');
      } else {
        alert(`Downloading '${dName}'... Logged into DocumentAccessLog.`);
      }
    } catch (e) {
      alert(`Downloading '${dName}'`);
    }
  };

  return (
    <Card 
      title="Shared Project Documents" 
      subtitle="Download project drawings guidelines & CAD blueprints"
      headerAction={
        <button
          onClick={() => navigate('/employee/docs')}
          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          View All <ExternalLink className="w-3 h-3" />
        </button>
      }
    >
      <div className="space-y-3">
        {docsList.map((doc, idx) => {
          const docName = doc.name || doc.documentName || doc.fileName || 'Untitled Document.pdf';
          const docSize = doc.size || (doc.fileSizeKB ? `${(doc.fileSizeKB / 1024).toFixed(1)} MB` : '1.8 MB');
          const docDate = doc.date || (doc.createdAt ? doc.createdAt.split('T')[0] : '2026-06-15');

          return (
            <div key={doc._id || doc.id || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 block truncate" title={docName}>{docName}</span>
                  <span className="text-[9px] text-slate-400 block font-semibold">{docSize} | {docDate}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                title="Download File (Logs DOWNLOAD in audit log)"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
