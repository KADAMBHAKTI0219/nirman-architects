import React, { useState } from 'react';
import { 
  Camera, Image as ImageIcon, ZoomIn, ZoomOut, Maximize2, Tag, Calendar 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_IMAGES = [
  { id: 1, title: "Central Lobby Main Entrance Render", date: "2026-07-22", type: "3D Render", tag: "design", uploadedBy: "Bob Johnson (Architect)" },
  { id: 2, title: "Basement Excavation Foundations Status", date: "2026-07-15", type: "Site Photo", tag: "progress", uploadedBy: "Frank Castle (Site Engineer)" },
  { id: 3, title: "L3 Electrical Cable Trays Laying", date: "2026-07-21", type: "Site Photo", tag: "site", uploadedBy: "Frank Castle (Site Engineer)" }
];

export default function Photos3D() {
  const [images, setImages] = useState(INITIAL_IMAGES);
  const [selectedImg, setSelectedImg] = useState(INITIAL_IMAGES[0]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [zoomScale, setZoomScale] = useState(1);

  const tagsList = ['All', 'progress', 'design', 'site'];

  const filteredImages = images.filter(img => {
    return selectedTag === 'All' || img.tag === selectedTag;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER TABS */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs overflow-x-auto scrollbar-none">
        {tagsList.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              selectedTag === tag 
                ? 'bg-brand-primary text-slate-905 shadow-3xs' 
                : 'bg-slate-50 border border-slate-150 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 2. 3D HERO VIEW CENTER SECTION */}
      {selectedImg && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Hero Panel (2/3 width) */}
          <Card title="3D Render & Photo Walkthrough" subtitle="Verify design dimensions and aesthetics" className="lg:col-span-2">
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 relative overflow-hidden h-[340px] flex items-center justify-center select-none shadow-inner">
              
              {/* Scale Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 z-10 text-sky-400">
                <button 
                  onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setZoomScale(prev => Math.max(0.75, prev - 0.25))}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setZoomScale(1)}
                  className="px-2 py-0.5 text-[8px] hover:bg-slate-800 rounded-lg font-black uppercase transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Graphic Placeholder */}
              <div 
                className="w-full h-full relative flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <svg viewBox="0 0 100 80" className="w-[70%] h-[70%] stroke-sky-500 fill-none stroke-[0.6] opacity-60">
                  <rect x="5" y="5" width="90" height="70" stroke="#1D4ED8" />
                  <line x1="5" y1="40" x2="95" y2="40" />
                  <polygon points="50,15 15,65 85,65" stroke="#3B82F6" strokeWidth="0.8" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none"></div>
              </div>

              <span className="absolute top-4 left-4 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-[9px] font-black text-sky-400 uppercase tracking-widest">
                {selectedImg.type}
              </span>
            </div>
          </Card>

          {/* Details Sidebar (1/3 width) */}
          <div className="xl:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4 text-xs font-bold text-slate-550">
            <span className="text-[9px] text-slate-400 block uppercase">Metadata Specifications</span>
            <strong className="text-slate-805 block text-sm leading-snug">{selectedImg.title}</strong>
            
            <div className="space-y-3.5 pt-2 border-t border-slate-50 text-[10px]">
              <div>
                <span className="text-slate-400 block font-semibold">Uploaded By</span>
                <strong className="text-slate-700 block mt-0.5">{selectedImg.uploadedBy}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Upload Date & Category</span>
                <strong className="text-slate-700 block mt-0.5">{selectedImg.date} &bull; Tag: {selectedImg.tag}</strong>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading source visual file: ${selectedImg.title}`)}
              className="w-full py-2 bg-brand-primary text-slate-905 rounded-xl font-black uppercase text-center shadow-3xs"
            >
              Download Source File
            </button>
          </div>

        </div>
      )}

      {/* 3. THUMBNAIL GALLERY GRID */}
      <Card title="All Progress Photos & Renders" subtitle="Browse historical updates snaps catalog">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {filteredImages.map(img => (
            <div 
              key={img.id}
              onClick={() => {
                setSelectedImg(img);
                setZoomScale(1);
              }}
              className={`border rounded-2xl overflow-hidden cursor-pointer hover:border-[#2484C6]/40 transition-all ${
                selectedImg?.id === img.id ? 'border-[#2484C6] shadow-3xs' : 'border-slate-150'
              }`}
            >
              <div className="bg-slate-950 h-28 flex items-center justify-center relative">
                <ImageIcon className="w-8 h-8 text-slate-700" />
                <span className="absolute bottom-2 right-2 text-[8px] bg-slate-900/60 px-1.5 py-0.5 rounded text-sky-400 font-bold uppercase">
                  {img.tag}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <strong className="text-slate-805 block text-[11px] truncate leading-none">{img.title}</strong>
                <span className="text-[9px] text-slate-400 block font-semibold">{img.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
