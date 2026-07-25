import React, { useState } from 'react';
import { 
  Search, Eye, FileDown, Lock, Unlock, MessageSquare, Layers,
  ZoomIn, ZoomOut, Maximize2, Pin, ArrowLeft, Send
} from 'lucide-react';
import Card from '../../common/Card';

export default function EmployeeDrawings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectingDrawing, setInspectingDrawing] = useState(null);
  
  // Canvas zoom state
  const [zoomScale, setZoomScale] = useState(1);
  const [annotationPins, setAnnotationPins] = useState([]);
  const [pinText, setPinText] = useState('');
  const [activePinCoords, setActivePinCoords] = useState(null);

  const categories = ['All', 'Working Drawings', 'Concept Drawings', 'MEP Plans'];

  const [drawings, setDrawings] = useState([
    { 
      id: "DWG-101", 
      name: "Ground Floor Wall Layout Blueprint", 
      project: "Central Office Tower", 
      category: "Working Drawings", 
      version: "V2.1", 
      status: "Approved", 
      locked: false,
      commentsCount: 2,
      pins: [
        { x: 30, y: 40, text: "Headroom height clearance check required." }
      ]
    },
    { 
      id: "DWG-102", 
      name: "Mechanical HVAC Duct Routing Plan", 
      project: "Smart City Mall", 
      category: "MEP Plans", 
      version: "V1.0", 
      status: "Under Review", 
      locked: false,
      commentsCount: 1,
      pins: []
    },
    { 
      id: "DWG-103", 
      name: "First Floor Plan Draft Schema", 
      project: "Oceanic Luxury Villas", 
      category: "Concept Drawings", 
      version: "V1.1", 
      status: "GFC Locked", 
      locked: true,
      commentsCount: 0,
      pins: []
    }
  ]);

  const filteredDrawings = drawings.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCanvasClick = (e) => {
    if (inspectingDrawing.locked) {
      alert("This drawing is GFC Locked and cannot be annotated.");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setActivePinCoords({ x: x.toFixed(1), y: y.toFixed(1) });
  };

  const handlePlacePinSubmit = (e) => {
    e.preventDefault();
    if (!pinText.trim() || !activePinCoords) return;

    const newPin = {
      x: parseFloat(activePinCoords.x),
      y: parseFloat(activePinCoords.y),
      text: pinText
    };

    const updatedDrawing = {
      ...inspectingDrawing,
      pins: [...inspectingDrawing.pins, newPin],
      commentsCount: inspectingDrawing.commentsCount + 1
    };

    setDrawings(prev => prev.map(d => d.id === inspectingDrawing.id ? updatedDrawing : d));
    setInspectingDrawing(updatedDrawing);
    setPinText('');
    setActivePinCoords(null);
  };

  return (
    <div className="space-y-6">
      
      {inspectingDrawing ? (
        
        // Detailed CAD inspect screen
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setInspectingDrawing(null);
                  setActivePinCoords(null);
                }}
                className="p-1.5 hover:bg-slate-150 bg-white border border-slate-205 text-slate-600 rounded-xl transition-all shadow-3xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inspectingDrawing.id} &bull; {inspectingDrawing.project}</span>
                <h3 className="text-sm font-black text-slate-905">{inspectingDrawing.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-wider border ${
                inspectingDrawing.locked ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {inspectingDrawing.locked ? 'GFC Locked' : 'Draft Active'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Blueprint Canvas Pane */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden h-[420px] flex items-center justify-center select-none shadow-inner">
                
                {/* Canvas Controls */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 z-10">
                  <button 
                    onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                    className="p-1 hover:bg-slate-800 text-sky-400 rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setZoomScale(prev => Math.max(0.75, prev - 0.25))}
                    className="p-1 hover:bg-slate-800 text-sky-400 rounded-lg transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setZoomScale(1)}
                    className="px-2 py-0.5 text-[8px] hover:bg-slate-800 text-sky-400 rounded-lg font-black uppercase transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {/* SVG Blueprint Canvas */}
                <div 
                  className="w-full h-full relative cursor-crosshair overflow-auto flex items-center justify-center"
                  onClick={handleCanvasClick}
                >
                  <div 
                    className="w-[90%] h-[90%] border border-dashed border-sky-900/60 relative transition-transform duration-205 flex items-center justify-center"
                    style={{ transform: `scale(${zoomScale})` }}
                  >
                    <svg viewBox="0 0 100 80" className="w-full h-full stroke-sky-500 fill-none stroke-[0.6] opacity-75">
                      <rect x="5" y="5" width="90" height="70" stroke="#1D4ED8" strokeWidth="1" />
                      <line x1="5" y1="20" x2="95" y2="20" />
                      <line x1="5" y1="60" x2="95" y2="60" />
                      <line x1="30" y1="5" x2="30" y2="75" />
                      <line x1="70" y1="5" x2="70" y2="75" />
                      <circle cx="50" cy="40" r="12" />
                      <path d="M 50 15 L 50 65 M 15 40 L 85 40" stroke="#3B82F6" strokeWidth="0.4" />
                    </svg>

                    {/* Annotation Pins */}
                    {inspectingDrawing.pins.map((pin, idx) => (
                      <div
                        key={idx}
                        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-rose-500/20 border-2 border-rose-500 rounded-full flex items-center justify-center cursor-pointer shadow-sm animate-bounce"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        title={pin.text}
                      >
                        <span className="text-[7px] font-black text-rose-605">!</span>
                      </div>
                    ))}

                    {/* Pending placement Pin indicator */}
                    {activePinCoords && (
                      <div
                        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center animate-ping"
                        style={{ left: `${activePinCoords.x}%`, top: `${activePinCoords.y}%` }}
                      >
                        <span className="text-[7px] font-black text-yellow-600">?</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Annotation Side panel */}
            <div className="space-y-4">
              
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
                <div className="border-b border-slate-50 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">CAD Annotation Pins</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Click canvas blueprint to drop pinpoint markups</span>
                </div>

                {activePinCoords ? (
                  <form onSubmit={handlePlacePinSubmit} className="space-y-3 p-3 bg-yellow-50/50 border border-yellow-150 rounded-2xl">
                    <strong className="text-[10px] text-yellow-805 block">Place pin at coordinates: X: {activePinCoords.x}%, Y: {activePinCoords.y}%</strong>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter design notes / correction details..." 
                      value={pinText}
                      onChange={(e) => setPinText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 bg-white font-semibold"
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setActivePinCoords(null)}
                        className="px-3 py-1 bg-white border border-slate-205 text-slate-555 text-[9px] font-bold rounded-lg uppercase"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-brand-primary text-slate-905 text-[9px] font-black rounded-lg uppercase shadow-3xs"
                      >
                        Drop Pin
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-400">
                    {!inspectingDrawing.locked 
                      ? "Click anywhere on the blue blueprint grid canvas to place an engineering annotation note."
                      : "Annotations are disabled on GFC locked releases."}
                  </div>
                )}

                {/* Pins checklist log */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {inspectingDrawing.pins.map((pin, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Pin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>Coordinates: X: {pin.x}%, Y: {pin.y}%</span>
                      </div>
                      <p className="text-slate-500 font-semibold leading-normal">{pin.text}</p>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>

      ) : (
        
        // Gallery list view
        <>
          {/* Header filter controls */}
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
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search assigned blueprints..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
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
                <div className="bg-[#0A192F] p-4 h-28 flex items-center justify-center relative">
                  <svg viewBox="0 0 100 80" className="w-24 h-24 stroke-sky-500 fill-none stroke-[0.8] opacity-60">
                    <rect x="10" y="10" width="80" height="60" stroke="#1D4ED8" />
                    <line x1="10" y1="40" x2="90" y2="40" />
                    <line x1="50" y1="10" x2="50" y2="70" />
                  </svg>
                  <span className="absolute bottom-2 right-2 bg-slate-900/60 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-sky-400">
                    {d.version}
                  </span>
                </div>

                <div className="p-4 space-y-3.5">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{d.id} &bull; {d.project}</span>
                    <h4 className="text-xs font-black text-slate-805 leading-snug line-clamp-2 mt-0.5">{d.name}</h4>
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
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-3xs"
                        title="Inspect CAD Blueprint"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Downloading blueprint: ${d.name}`)}
                        className="p-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-3xs"
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
        </>
      )}

    </div>
  );
}
