import React, { useState, useEffect } from 'react';
import {
  Camera, Image as ImageIcon, ZoomIn, ZoomOut, Maximize2, Tag, Calendar, Download, RefreshCw, Eye, Sparkles, User, Layers
} from 'lucide-react';
import Card from '../../common/Card';
import { getClientDashboard } from '../../../service/crm/client';
import { getClientProjectDrawings } from '../../../service/drawing';

const INITIAL_IMAGES = [
  {
    id: 1,
    title: "Central Lobby Main Entrance 3D Elevation Render",
    date: "2026-07-22",
    type: "3D Render",
    tag: "3D Renders",
    uploadedBy: "Bob Johnson (Senior Architect)",
    projectName: "Central Office Tower",
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
    projectName: "Oceanic Luxury Villas",
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
    projectName: "Central Office Tower",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    description: "Actual site photograph showing foundation raft concreting and waterproofing membrane installation."
  },
  {
    id: 4,
    title: "Superstructure Column & Slab Steel Framing Status",
    date: "2026-07-21",
    type: "Site Photo",
    tag: "Structural",
    uploadedBy: "Frank Castle (Site Engineer)",
    projectName: "Oceanic Luxury Villas",
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
    projectName: "Central Office Tower",
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
  
  const [projects, setProjects] = useState([]);
  const [selectedProjId, setSelectedProjId] = useState(null);
  const [loading, setLoading] = useState(false);

  const tagsList = ['All', '3D Renders', 'Site Progress', 'Interiors', 'Structural'];

  // 1. Fetch Client Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getClientDashboard();
        if (res && res.activeProjects && res.activeProjects.length > 0) {
          setProjects(res.activeProjects);
          setSelectedProjId(res.activeProjects[0].projectId);
        }
      } catch (err) {
        console.error("Failed to load client projects for 3D gallery:", err);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch Drawings when project changes
  useEffect(() => {
    if (!selectedProjId) return;
    const fetchDrawings = async () => {
      setLoading(true);
      try {
        const res = await getClientProjectDrawings(selectedProjId);
        const list = [
          ...(res.pendingApproval || []),
          ...(res.approved || []),
          ...(res.changesRequested || [])
        ];

        if (list.length > 0) {
          const mapped = list.map((d, index) => {
            const cat = String(d.category || d.categoryName || '3D Renders').toLowerCase();
            let tag = '3D Renders';
            let type = '3D Render';

            if (cat.includes('site') || cat.includes('progress') || cat.includes('photo')) {
              tag = 'Site Progress';
              type = 'Site Photo';
            } else if (cat.includes('ceiling') || cat.includes('lighting') || cat.includes('interior') || cat.includes('furniture')) {
              tag = 'Interiors';
              type = 'Interior Render';
            } else if (cat.includes('structure') || cat.includes('foundation') || cat.includes('rcc') || cat.includes('framing')) {
              tag = 'Structural';
              type = 'Structural Blueprint';
            } else if (cat.includes('concept') || cat.includes('elevation') || cat.includes('exterior')) {
              tag = '3D Renders';
              type = '3D Render';
            }

            let imageUrl = d.thumbnailUrl || d.fileUrl || "";
            // Resolve relative uploads
            if (imageUrl.startsWith('/uploads')) {
              imageUrl = `https://nirman-architects.onrender.com${imageUrl}`;
            }

            const isPdf = imageUrl.toLowerCase().includes('.pdf') || !imageUrl;
            if (isPdf) {
              if (tag === 'Site Progress') {
                imageUrl = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80";
              } else if (tag === 'Interiors') {
                imageUrl = "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80";
              } else if (tag === 'Structural') {
                imageUrl = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80";
              } else {
                imageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
              }
            }

            return {
              id: d._id || d.id || `dwg-${index}`,
              title: d.drawingName || d.title || 'Project Blueprint',
              date: d.createdAt ? d.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
              type: type,
              tag: tag,
              uploadedBy: d.uploadedBy || 'Nirman Design Team',
              imageUrl: imageUrl,
              fileUrl: d.fileUrl || '',
              description: d.description || `Official approved ${type} drawing for construction and client review.`
            };
          });
          setImages(mapped);
          setSelectedImg(mapped[0]);
        } else {
          setImages(INITIAL_IMAGES);
          setSelectedImg(INITIAL_IMAGES[0]);
        }
      } catch (err) {
        console.error("Failed to load drawings for 3D gallery:", err);
        setImages(INITIAL_IMAGES);
        setSelectedImg(INITIAL_IMAGES[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchDrawings();
  }, [selectedProjId]);

  // 3. Auto-select first image when tag changes
  useEffect(() => {
    if (selectedTag === 'All') return;
    const firstOfTag = images.find(img => img.tag === selectedTag);
    if (firstOfTag) {
      setSelectedImg(firstOfTag);
      setZoomScale(1);
    }
  }, [selectedTag, images]);

  const filteredImages = images.filter(img => {
    return selectedTag === 'All' || img.tag === selectedTag;
  });

  const activeProject = projects.find(p => p.projectId === selectedProjId) || projects[0] || {};
  const currentProjectName = activeProject.projectName || '';
  const displayProjectName = currentProjectName || selectedImg?.projectName || 'Central Office Tower';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800 pb-12 w-full">

      {/* 1. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            3D Renders & Site Progress Gallery
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-bold">
            {displayProjectName ? `Project Workspace: ${displayProjectName}` : "Photorealistic architectural visualization, high-res site photos, and 3D walkthroughs"}
          </p>
        </div>

        {/* Project Selector & Filter Category Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjId || ''}
              onChange={(e) => setSelectedProjId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer shadow-3xs"
            >
              {projects.map(p => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName}
                </option>
              ))}
            </select>
          )}

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
      </div>

      {/* 2. MAIN VISUAL MEDIA VIEWER */}
      {selectedImg && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* Hero Media Card (2/3 width) */}
          <Card
            title={selectedImg.title}
            subtitle={`${selectedImg.type} • Project: ${displayProjectName} • Uploaded by ${selectedImg.uploadedBy}`}
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
            <div className="space-y-4">
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

              {/* Consolidated Metadata Block directly under the player */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200/85 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Description / Notes</span>
                  <p className="text-slate-800 leading-relaxed font-semibold mt-0.5">
                    "{selectedImg.description}"
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Category Tag</span>
                    <strong className="text-slate-900 block mt-0.5 font-bold truncate">{selectedImg.tag}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Upload Date</span>
                    <strong className="text-slate-900 block mt-0.5 font-mono truncate">{selectedImg.date}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Linked Project</span>
                    <strong className="text-slate-900 block mt-0.5 font-bold truncate" title={displayProjectName}>
                      {displayProjectName}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Uploader Author</span>
                    <strong className="text-slate-900 block mt-0.5 font-bold truncate" title={selectedImg.uploadedBy}>
                      {selectedImg.uploadedBy}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (selectedImg.fileUrl) {
                      window.open(selectedImg.fileUrl, '_blank');
                    } else {
                      alert(`Downloading high-resolution source file: ${selectedImg.title}`);
                    }
                  }}
                  className="w-full py-2.5 bg-brand-primary text-slate-900 font-extrabold rounded-xl text-xs uppercase hover:bg-brand-secondary transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-900" />
                  <span>Download Source File (HD)</span>
                </button>
              </div>
            </div>
          </Card>

          {/* All Progress Photos & Renders Catalog Card (1/3 width Sidebar) */}
          <Card 
            title="Photos & Renders Catalog" 
            subtitle="Click any visual snap to load into viewer"
            className="xl:col-span-1 h-[680px] flex flex-col"
          >
            <div className="overflow-y-auto pr-1 space-y-3 flex-1 max-h-[600px]">
              {filteredImages.map(img => {
                const isSel = selectedImg?.id === img.id;
                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      setSelectedImg(img);
                      setZoomScale(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`bg-white p-2.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center group ${
                      isSel 
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30' 
                        : 'border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
                      <img
                        src={img.imageUrl}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase text-white border border-white/20">
                        {img.tag}
                      </span>
                    </div>

                    {/* Metadata text */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-brand-accent transition-colors" title={img.title}>
                        {img.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {img.date}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                        {img.type} &bull; {img.projectName || displayProjectName}
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredImages.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-bold">No progress photos found for this category.</p>
                </div>
              )}
            </div>
          </Card>

        </div>
      )}

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
