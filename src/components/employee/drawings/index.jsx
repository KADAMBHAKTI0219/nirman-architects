import React, { useState } from 'react';
import { 
  Search, Eye, FileDown, Lock, Unlock, MessageSquare, Layers,
  ZoomIn, ZoomOut, Maximize2, Pin, ArrowLeft, Send
} from 'lucide-react';
import Card from '../../common/Card';
import DrawingViewer from '../../common/DrawingViewer';

export default function EmployeeDrawings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectingDrawing, setInspectingDrawing] = useState(null);

  const categories = ['All', 'Working Drawings', 'Concept Drawings', 'MEP Plans'];

  const [drawings] = useState([
    { 
      id: "DWG-101", 
      name: "Ground Floor Wall Layout Blueprint", 
      project: "Central Office Tower", 
      category: "Working Drawings", 
      version: "V2.1", 
      status: "Approved", 
      locked: false,
      commentsCount: 2
    },
    { 
      id: "DWG-102", 
      name: "Mechanical HVAC Duct Routing Plan", 
      project: "Smart City Mall", 
      category: "MEP Plans", 
      version: "V1.0", 
      status: "Under Review", 
      locked: false,
      commentsCount: 1
    },
    { 
      id: "DWG-103", 
      name: "First Floor Plan Draft Schema", 
      project: "Oceanic Luxury Villas", 
      category: "Concept Drawings", 
      version: "V0.9", 
      status: "Draft", 
      locked: false,
      commentsCount: 0
    }
  ]);

  const filteredDrawings = drawings.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {inspectingDrawing && (
        <DrawingViewer 
          drawing={inspectingDrawing}
          onClose={() => setInspectingDrawing(null)}
          userPermissionLevel="MEMBER"
          initialMarkupMode={true}
        />
      )}

      {/* Gallery list view */}
      <div className="space-y-6">
        {/* Header filter controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-brand-primary text-slate-900 shadow-3xs' 
                    : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assigned blueprints..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>
        </div>

        {/* Cards Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrawings.map(d => (
            <div 
              key={d.id} 
              className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden hover:border-brand-primary/45 transition-all flex flex-col justify-between"
            >
              {/* Simulated Thumbnail */}
              <div 
                onClick={() => setInspectingDrawing(d)}
                className="bg-[#0A192F] p-4 h-32 flex items-center justify-center relative cursor-pointer group"
              >
                <svg viewBox="0 0 100 80" className="w-24 h-24 stroke-sky-500 fill-none stroke-[0.8] opacity-60 group-hover:scale-105 transition-transform">
                  <rect x="10" y="10" width="80" height="60" stroke="#1D4ED8" />
                  <line x1="10" y1="40" x2="90" y2="40" />
                  <line x1="50" y1="10" x2="50" y2="70" />
                </svg>
                <span className="absolute bottom-2 right-2 bg-slate-900/60 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-sky-400">
                  {d.version}
                </span>
                <div className="absolute inset-0 bg-sky-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 bg-brand-primary text-slate-900 font-extrabold text-[10px] rounded-xl shadow-md flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Blueprint
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3.5">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{d.id} &bull; {d.project}</span>
                  <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2 mt-0.5">{d.name}</h4>
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      d.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      d.status === 'GFC Locked' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{d.status}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectingDrawing(d)}
                      className="p-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center gap-1 text-[10px] font-extrabold px-2.5"
                      title="Inspect CAD Blueprint"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => alert(`Downloading blueprint: ${d.name}`)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-3xs cursor-pointer"
                      title="Download Drawing File"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}

          {filteredDrawings.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
              No blueprints found matching query.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
