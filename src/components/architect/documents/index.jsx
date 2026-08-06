import React, { useState } from 'react';
import { 
  Search, Folder, FileText, Download, Eye, Upload, X, ArrowLeft 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_DOCS = [
  { name: "Nirman Building Design Guidelines 2026.pdf", category: "Design briefs", size: "4.2 MB", date: "2026-06-15", version: "V1.0" },
  { name: "Lobby Design Material Options.pdf", category: "Reference files", size: "8.5 MB", date: "2026-07-20", version: "V2.1" },
  { name: "Central Office Tower Contract_Signed.pdf", category: "Contracts", size: "1.2 MB", date: "2026-05-12", version: "V1.0" },
  { name: "Concrete Structural Load Limits.xlsx", category: "Site documents", size: "1.8 MB", date: "2026-07-02", version: "V1.2" }
];

export default function Documents() {
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectingDoc, setInspectingDoc] = useState(null);
  
  const categories = ['All', 'Design briefs', 'Reference files', 'Contracts', 'Site documents', 'PDFs'];

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory || 
                            (selectedCategory === 'PDFs' && d.name.endsWith('.pdf'));
    return matchesSearch && matchesCategory;
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    const title = await window.prompt("Enter Document Title:", "", "Upload Architectural Document");
    if (!title || !title.trim()) return;
    
    const newDoc = {
      name: title.endsWith('.pdf') ? title : `${title}.pdf`,
      category: selectedCategory === 'All' ? 'Design briefs' : selectedCategory,
      size: "2.4 MB",
      date: new Date().toISOString().split('T')[0],
      version: "V1.0"
    };

    setDocuments([newDoc, ...documents]);
    alert("Document uploaded successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER HEADER BAR */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                selectedCategory === cat 
                  ? 'bg-brand-primary text-slate-905 shadow-3xs' 
                  : 'bg-slate-50 border border-slate-150 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>
          
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-brand-primary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-3xs flex items-center gap-1 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* 2. CARD GRID VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.map((doc, idx) => (
          <div 
            key={idx} 
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex justify-between items-center gap-4 hover:border-[#2484C6]/40 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-450 flex-shrink-0">
                <FileText className="w-5 h-5 text-[#2484C6]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150 uppercase tracking-wider self-start">
                  {doc.category}
                </span>
                <strong className="text-slate-805 block text-xs truncate mt-1.5" title={doc.name}>{doc.name}</strong>
                <span className="text-[9px] text-slate-400 block mt-1 font-bold uppercase tracking-wider">
                  Size: {doc.size} | Date: {doc.date} &bull; Version: {doc.version}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setInspectingDoc(doc)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl transition-all shadow-3xs"
                title="Inspect File"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alert(`Downloading: ${doc.name}`)}
                className="p-1.5 bg-white border border-slate-205 hover:bg-slate-55 text-slate-500 rounded-xl transition-all shadow-3xs"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. INSPECTION MODAL */}
      {inspectingDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inspectingDoc.category} &bull; Version {inspectingDoc.version}</span>
                <h3 className="text-sm font-black text-slate-905">{inspectingDoc.name}</h3>
              </div>
              <button 
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-[10px] h-48 overflow-y-auto">
                <div className="border-b border-slate-750 pb-2 text-center text-xs font-bold text-sky-400 mb-2 uppercase">
                  PDF PREVIEW: {inspectingDoc.name}
                </div>
                <p className="text-slate-500"># Nirman Architects Document Registry</p>
                <p className="mt-2">1. All structural calculations require concrete grade validations (M30/M40 mix profiles).</p>
                <p>2. Column load bearings must satisfy standard engineering seismic guidelines Zone IV specs.</p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setInspectingDoc(null)}
                  className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => alert(`Downloading: ${inspectingDoc.name}`)}
                  className="px-4 py-2 bg-brand-primary text-slate-905 rounded-xl text-xs font-black transition-all shadow-3xs"
                >
                  Download Document
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
