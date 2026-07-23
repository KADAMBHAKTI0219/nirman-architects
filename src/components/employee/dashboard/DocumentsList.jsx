import React from 'react';
import Card from '../../common/Card';
import { FileText, FileDown } from 'lucide-react';

const documents = [
  { name: "Nirman Building Design Guidelines 2026.pdf", size: "4.2 MB", date: "2026-06-15" },
  { name: "Concrete Structural Load Limits.xlsx", size: "1.8 MB", date: "2026-07-02" },
  { name: "Safety Standards Manual.pdf", size: "8.5 MB", date: "2026-05-10" }
];

export default function DocumentsList() {
  return (
    <Card title="Shared Project Documents" subtitle="Download project drawings guidelines & CAD blueprints">
      <div className="space-y-3">
        {documents.map((doc, idx) => (
          <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-800 block truncate" title={doc.name}>{doc.name}</span>
                <span className="text-[9px] text-slate-400 block">{doc.size} | {doc.date}</span>
              </div>
            </div>
            <button
              onClick={() => alert(`Downloading '${doc.name}'... Successful.`)}
              className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors flex-shrink-0"
              title="Download File"
            >
              <FileDown className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
