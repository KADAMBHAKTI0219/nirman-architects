import React, { useState } from 'react';
import {
  Camera, Image as ImageIcon, ZoomIn, ZoomOut, Maximize2, Tag, Calendar, Download, RefreshCw, Eye, Sparkles, User, Layers
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_IMAGES = [
  {
    id: 1,
    title: "Central Lobby Main Entrance 3D Elevation Render",
    date: "2026-07-22",
    type: "3D Render",
    tag: "3D Renders",
    uploadedBy: "Bob Johnson (Senior Architect)",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    description: "Photorealistic 3D architectural render showing double-height entrance lobby with Italian marble cladding and acoustic wooden louvers."
  },
  {
    id: 2,
    title: "Living Room False Ceiling & Lighting Scheme Render",
    date: "2026-07-20",
    type: "3D Render",
    tag: "Interiors",
    uploadedBy: "Sarah Connor (Interior Design Lead)",
    imageUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    description: "Cove lighting layout and cove detail render for master living area with warm LED profiles."
  },
  {
    id: 3,
    title: "Basement Excavation & Foundation RCC Casting Status",
    date: "2026-07-15",
    type: "Site Photo",
    tag: "Site Progress",
    uploadedBy: "Frank Castle (Site Engineer)",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80",
    description: "Actual site photograph showing foundation raft concreting and waterproofing membrane installation."
  },
  {
    id: 4,
    title: "Superstructure Column & Slab Steel Framing Status",
    date: "2026-07-21",
    type: "Site Photo",
    tag: "Structural",
    uploadedBy: "Frank Castle (Site Engineer)",
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    description: "Structural inspection photograph verifying TMT rebar spacing for ground floor columns."
  },
  {
    id: 5,
    title: "Exterior Facade Glass & Aluminum Composite Render",
    date: "2026-07-18",
    type: "3D Render",
    tag: "3D Renders",
    uploadedBy: "Bob Johnson (Senior Architect)",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    description: "High-definition facade 3D render displaying double-glazed glass panels and bronze anodized aluminum mullions."
  }
];

export default function Photos3D() {
  const [images, setImages] = useState(INITIAL_IMAGES);
  const [selectedImg, setSelectedImg] = useState(INITIAL_IMAGES[0]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tagsList = ['All', '3D Renders', 'Site Progress', 'Interiors', 'Structural'];

  const filteredImages = images.filter(img => {
    return selectedTag === 'All' || img.tag === selectedTag;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800 pb-12 w-full">

      {/* 1. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            3D Renders & Site Progress Gallery
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Photorealistic architectural visualization, high-res site photos, and 3D walkthroughs
          </p>
        </div>

        {/* Filter Category Pills */}
        <div className="p-1 bg-white border border-slate-200 rounded-xl flex gap-1 shadow-3xs overflow-x-auto">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${selectedTag === tag
                  ? 'bg-brand-primary text-slate-900 shadow-3xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN VISUAL MEDIA VIEWER */}
      {selectedImg && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* Hero Media Card (2/3 width) */}
          <Card
            title={selectedImg.title}
            subtitle={`${selectedImg.type} • Uploaded by ${selectedImg.uploadedBy}`}
            className="xl:col-span-2"
            actions={
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale(prev => Math.max(0.75, prev - 0.25))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale(1)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-1.5 bg-brand-primary text-slate-900 rounded-xl transition-all cursor-pointer shadow-3xs ml-1"
                  title="Expand Full Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            }
          >
            <div className="bg-slate-100 rounded-2xl p-2 relative overflow-hidden h-[380px] flex items-center justify-center select-none shadow-inner border border-slate-200/80">
              <div
                className="w-full h-full relative flex items-center justify-center transition-transform duration-200 overflow-hidden rounded-xl"
              >
                <img
                  src={selectedImg.imageUrl}
                  alt={selectedImg.title}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300"
                  style={{ transform: `scale(${zoomScale})` }}
                />
              </div>

              <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs px-3 py-1 rounded-xl text-[10px] font-black text-white uppercase tracking-wider shadow-sm border border-white/20">
                {selectedImg.type}
              </span>
            </div>
          </Card>

          {/* Details Sidebar Card (1/3 width) */}
          <Card title="Metadata & Technical Notes" subtitle="File details & upload audit">
            <div className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Description / Notes</span>
                <p className="text-slate-800 leading-relaxed font-semibold">
                  "{selectedImg.description}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Category Tag</span>
                  <strong className="text-slate-900 block mt-0.5 font-bold">{selectedImg.tag}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Upload Date</span>
                  <strong className="text-slate-900 block mt-0.5 font-mono">{selectedImg.date}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Uploader Author</span>
                <strong className="text-slate-900 block mt-0.5 font-bold">{selectedImg.uploadedBy}</strong>
              </div>

              <button
                onClick={() => alert(`Downloading high-resolution source file: ${selectedImg.title}`)}
                className="w-full py-2.5 bg-brand-primary text-slate-900 font-extrabold rounded-xl text-xs uppercase hover:bg-brand-secondary transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-900" />
                <span>Download Source File (HD)</span>
              </button>
            </div>
          </Card>

        </div>
      )}

      {/* 3. THUMBNAIL CATALOG GRID */}
      <Card title="All Progress Photos & Renders Catalog" subtitle="Click any visual snap to load into viewer">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredImages.map(img => {
            const isSel = selectedImg?.id === img.id;
            return (
              <div
                key={img.id}
                onClick={() => {
                  setSelectedImg(img);
                  setZoomScale(1);
                }}
                className={`bg-white rounded-3xl border transition-all cursor-pointer overflow-hidden shadow-2xs group flex flex-col justify-between ${isSel ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200/90 hover:border-indigo-300'
                  }`}
              >
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase text-white border border-white/20">
                    {img.tag}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <strong className="text-slate-900 block text-xs font-extrabold truncate" title={img.title}>
                    {img.title}
                  </strong>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-2">
                    <span>{img.type}</span>
                    <span className="font-mono">{img.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* FULL SCREEN LIGHTBOX MODAL */}
      {isFullscreen && selectedImg && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in">
          <div className="relative max-w-5xl w-full space-y-3">
            <div className="flex justify-between items-center text-white pb-2 border-b border-white/10">
              <h3 className="text-sm font-extrabold">{selectedImg.title}</h3>
              <button
                onClick={() => setIsFullscreen(false)}
                className="text-white/70 hover:text-white font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={selectedImg.imageUrl}
                alt={selectedImg.title}
                className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
