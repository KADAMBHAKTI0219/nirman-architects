import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Download, Eye, File, Folder, Layers, X, Calendar, Database
} from 'lucide-react';
import Card from '../../common/Card';
import { getOfferLetterMetadata, downloadOfferLetterPDF } from '../../../service/hrm/offerLetter';

export default function EmployeeDocs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [inspectingDoc, setInspectingDoc] = useState(null);

  // Offer Letter Integration
  const [offerMetadata, setOfferMetadata] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const savedUserStr = localStorage.getItem('user');
  let loggedInUser = null;
  if (savedUserStr) {
    try {
      loggedInUser = JSON.parse(savedUserStr);
    } catch(e) {
      console.error("Error reading logged-in user:", e);
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  useEffect(() => {
    const fetchMyOfferLetter = async () => {
      if (!loggedInUser) return;
      const uId = loggedInUser.id || loggedInUser._id;
      if (!uId) return;
      try {
        setLoadingOffer(true);
        const res = await getOfferLetterMetadata(uId);
        if (res && res.success && res.data) {
          setOfferMetadata(res.data.latest || null);
        } else if (res && res.latest) {
          setOfferMetadata(res.latest || null);
        }
      } catch (err) {
        console.error("Failed to load personal offer letter metadata:", err);
      } finally {
        setLoadingOffer(false);
      }
    };
    fetchMyOfferLetter();
  }, []);

  const handleDownloadOfferLetter = async () => {
    if (!loggedInUser) return;
    const uId = loggedInUser.id || loggedInUser._id;
    try {
      showToast("Downloading your official Offer Letter PDF...");
      await downloadOfferLetterPDF(uId, loggedInUser.name || "Employee");
      showToast("Offer Letter downloaded successfully!");
    } catch (err) {
      console.error("Failed to download offer letter:", err);
      showToast("Error downloading Offer Letter PDF.", "error");
    }
  };

  const folders = ['All', 'Guidelines', 'Drawings', 'Reports', 'Site Photos'];

  const [documents, setDocuments] = useState([
    { name: "Nirman Building Design Guidelines 2026.pdf", folder: "Guidelines", size: "4.2 MB", date: "2026-06-15", project: "All Projects", type: "PDF" },
    { name: "Concrete Structural Load Limits.xlsx", folder: "Reports", size: "1.8 MB", date: "2026-07-02", project: "Central Office Tower", type: "XLSX" },
    { name: "First Floor Plan Draft Schema.dwg", folder: "Drawings", size: "12.4 MB", date: "2026-07-21", project: "Oceanic Luxury Villas", type: "DWG" },
    { name: "Excavation Pit Compaction Photo.jpg", folder: "Site Photos", size: "3.5 MB", date: "2026-07-20", project: "Smart City Mall", type: "JPEG" }
  ]);

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'All' || d.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const renderPreviewContent = (doc) => {
    switch (doc.type) {
      case 'PDF':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-[10px] h-64 overflow-y-auto">
            <div className="border-b border-slate-700 pb-2 text-center text-xs font-bold text-sky-400 mb-2">
              PDF VIEWER: {doc.name.toUpperCase()}
            </div>
            <p className="text-slate-455"># SECTION 1. REBAR PLACEMENT GUIDELINES</p>
            <p>1.1 Main reinforcement rebars require minimum spacing tolerances of 150mm center-to-center.</p>
            <p>1.2 Concrete cover depth for all sub-grade foundation footings must satisfy 75mm standard clearances.</p>
          </div>
        );
      case 'XLSX':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-355 font-mono text-[9px] h-64 overflow-y-auto">
            <div className="border-b border-slate-700 pb-2 text-center text-xs font-bold text-emerald-400 mb-2">
              SHEET VIEWER: {doc.name.toUpperCase()}
            </div>
            <div className="grid grid-cols-3 gap-1.5 border-b border-slate-805 pb-1 font-bold text-slate-400">
              <div>Metric</div>
              <div>Required Value</div>
              <div>Tolerance</div>
            </div>
            {[
              ["Max Load Bearing", "350 kN/m2", "+/- 5%"],
              ["Slump Test Height", "125 mm", "10 mm"],
              ["Curing Period", "28 Days", "Min 14 Days"]
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-1.5 py-1 border-b border-slate-800/40">
                <div>{row[0]}</div>
                <div>{row[1]}</div>
                <div className="text-emerald-450">{row[2]}</div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="bg-[#0B1E33] border border-slate-800 rounded-2xl p-6 h-64 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 100 80" className="w-24 h-24 stroke-sky-400 fill-none stroke-[0.8] opacity-70">
              <rect x="10" y="10" width="80" height="60" stroke="#2484C6" />
              <line x1="10" y1="40" x2="90" y2="40" />
            </svg>
            <span className="text-[10px] text-slate-400 font-bold block mt-2">PREVIEW NOT AVAILABLE FOR DWG/RAW FORMATS</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Employee Documents & Policy Vault
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Access official employment offer letters, company safety standards & policies
          </p>
        </div>
      </div>
      
      {/* Official Offer Letter Section */}
      {offerMetadata && (
        <div className="bg-gradient-to-r from-blue-50/50 to-[#E5F0FA]/30 p-5 rounded-3xl border border-blue-105 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white border border-blue-150 text-[#2484C6] rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Official Document</span>
              <strong className="text-slate-805 block text-xs mt-1">Official Employment Offer Letter</strong>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-bold uppercase">
                Issued for {offerMetadata.designationSnapshot} &bull; Joined {new Date(offerMetadata.joiningDateSnapshot).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleDownloadOfferLetter}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )}
      {/* Search and folders control row */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
          {folders.map(fold => (
            <button
              key={fold}
              onClick={() => setSelectedFolder(fold)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                selectedFolder === fold 
                  ? 'bg-brand-primary text-slate-905 shadow-3xs' 
                  : 'bg-slate-50 border border-slate-150 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {fold}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search guidelines & reports..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
          />
        </div>
      </div>

      {/* Grid of documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.map((doc, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-450 flex-shrink-0">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-[#2484C6] bg-[#E5F0FA] px-1.5 py-0.5 rounded uppercase tracking-wider self-start">
                  {doc.folder}
                </span>
                <strong className="text-slate-805 block text-xs truncate mt-1" title={doc.name}>{doc.name}</strong>
                <span className="text-[9px] text-slate-400 block mt-1 font-bold uppercase tracking-wider">
                  Size: {doc.size} | Date: {doc.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setInspectingDoc(doc)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl transition-all shadow-3xs"
                title="Inspect Document"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alert(`Downloading: ${doc.name}`)}
                className="p-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-3xs"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspection Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inspectingDoc.folder} &bull; {inspectingDoc.project}</span>
                <h3 className="text-sm font-black text-slate-905">{inspectingDoc.name}</h3>
              </div>
              <button 
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {renderPreviewContent(inspectingDoc)}

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setInspectingDoc(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => alert(`Downloading: ${inspectingDoc.name}`)}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black transition-all shadow-sm"
                >
                  Download Document
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold z-50 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-705' : 'bg-rose-50 border-rose-100 text-rose-705'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
