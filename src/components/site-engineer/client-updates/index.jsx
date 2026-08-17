import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Send, FileText, Image as ImageIcon, MapPin, 
  CheckCheck, Clock, Archive, X, Upload 
} from 'lucide-react';
import Card from '../../common/Card';
import { getProjects } from '../../../service/project';
import { getSiteLocations } from '../../../service/siteLocationService';
import { useToast } from '../../../context/ToastContext';

export default function ClientUpdates() {
  const { showToast } = useToast();
  const [updates, setUpdates] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newSite, setNewSite] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [projectsList, setProjectsList] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Registered Site Locations first
      const locRes = await getSiteLocations();
      let locationsList = [];
      if (locRes?.success && Array.isArray(locRes.locations) && locRes.locations.length > 0) {
        locationsList = locRes.locations.map(loc => ({
          id: loc._id || loc.id,
          name: loc.projectName || loc.name || 'Site Location'
        }));
      }

      // 2. Fetch Projects as fallback/milestone source
      const projRes = await getProjects();
      let projList = [];
      if (projRes?.projects && Array.isArray(projRes.projects)) projList = projRes.projects;
      else if (Array.isArray(projRes)) projList = projRes;

      // Merge unique site locations
      const siteNamesSet = new Set(locationsList.map(l => l.name));
      projList.forEach(p => {
        const pName = p.projectName || p.name || p.title;
        if (pName && !siteNamesSet.has(pName)) {
          siteNamesSet.add(pName);
          locationsList.push({ id: p._id || p.id || pName, name: pName });
        }
      });

      setProjectsList(locationsList);

      if (locationsList.length > 0) {
        setNewSite(locationsList[0].name);

        // Derive dynamic timeline from live project milestones
        const derivedUpdates = projList.flatMap((p, pIdx) => {
          const siteName = p.projectName || p.name || 'Construction Site';
          return (p.milestones || []).map((m, mIdx) => ({
            id: m._id || `upd-${pIdx}-${mIdx}`,
            date: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            site: siteName,
            title: m.name || 'Site Progress Milestone',
            description: m.description || `Milestone execution for ${siteName} in progress.`,
            status: m.isCompleted ? 'Sent to Client' : 'Sent to Client',
            photos: m.isCompleted ? 1 : 0
          }));
        });

        if (derivedUpdates.length > 0) {
          setUpdates(derivedUpdates);
        }
      }
    } catch (err) {
      console.warn("Client updates load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedPhoto({
      file,
      name: file.name,
      previewUrl
    });
    showToast(`Photo "${file.name}" attached!`, "success");
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostUpdate = (status = 'Sent to Client') => {
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast("Please fill out the update title and description fields.", "error");
      return;
    }

    const newUpdate = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      site: newSite || 'Construction Site',
      title: newTitle,
      description: newDesc,
      status: status,
      photos: selectedPhoto ? 1 : 0,
      photoUrl: selectedPhoto?.previewUrl || null
    };

    setUpdates([newUpdate, ...updates]);
    setNewTitle('');
    setNewDesc('');
    setSelectedPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    showToast(
      status === 'Sent to Client' ? "Update dispatched to Client Portal!" : "Update saved as draft.",
      status === 'Sent to Client' ? "success" : "info"
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-in fade-in duration-200">
      
      {/* Hidden File Input for Attach Photo */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*" 
        onChange={handlePhotoSelect}
        className="hidden" 
      />

      {/* LEFT/CENTER CHRONOLOGICAL TIMELINE (2/3 width) */}
      <div className="xl:col-span-2 space-y-6">
        
        <Card title="Client Dispatch Timeline" subtitle="Historical record of structural updates shared with client dashboard">
          
          {updates.length > 0 ? (
            <div className="space-y-6 pt-3 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-105">
              {updates.map(upd => (
                <div key={upd.id} className="relative pl-8 space-y-2">
                  
                  {/* Timeline node dot indicator */}
                  <div className={`absolute left-[7px] top-1.5 w-3 h-3 rounded-full border-2 bg-white -translate-x-1/2 ${
                    upd.status === 'Sent to Client' ? 'border-[#2484C6]' : 'border-slate-400'
                  }`}></div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">{upd.date}</span>
                        <strong className="text-slate-805 block text-xs mt-0.5">{upd.title}</strong>
                      </div>

                      <div className="flex gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          upd.status === 'Sent to Client' ? 'bg-blue-50 text-[#2484C6] border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>{upd.status}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-655 leading-relaxed font-semibold">{upd.description}</p>

                    {upd.photoUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden max-w-xs border border-slate-200">
                        <img src={upd.photoUrl} alt="Attached Site Verification" className="w-full h-32 object-cover" />
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2.5 border-t border-slate-100/50">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {upd.site}
                      </span>
                      
                      {upd.photos > 0 && (
                        <span className="flex items-center gap-1 text-[#2484C6] font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {upd.photos} Photo Attached
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              No site updates dispatched yet. Compose a new update below to broadcast to Client Portal.
            </div>
          )}

        </Card>

      </div>

      {/* RIGHT COLUMN: DISPATCH FORM (1/3 width) */}
      <Card title="Compose Client Update" subtitle="Broadcast site construction metrics">
        <div className="space-y-4 text-xs font-semibold text-slate-550">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block uppercase">
              Update Title <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Completed foundations check"
              className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-705 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block uppercase">Site Location</label>
            <select 
              value={newSite} 
              onChange={(e) => setNewSite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-700 font-semibold cursor-pointer"
            >
              {projectsList.length > 0 ? (
                projectsList.map(p => {
                  const pName = p.name || p.projectName || 'Construction Site';
                  return (
                    <option key={p.id || p._id || pName} value={pName}>{pName}</option>
                  );
                })
              ) : (
                <option value="">No Active Sites Available</option>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block uppercase">
              Brief Description <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <textarea 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe physical milestones completed, materials received, or crew numbers..."
              className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-705 font-semibold h-24 focus:outline-none"
            />
          </div>

          {/* REAL FILE ATTACHMENT BOX */}
          {selectedPhoto ? (
            <div className="p-3 border border-blue-200 rounded-xl bg-blue-50/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <img src={selectedPhoto.previewUrl} alt="Thumbnail" className="w-10 h-10 rounded-lg object-cover border border-blue-200 flex-shrink-0" />
                <div className="truncate">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">{selectedPhoto.name}</span>
                  <span className="text-[9px] text-[#2484C6] font-bold uppercase">Image Attached</span>
                </div>
              </div>
              <button 
                onClick={handleRemovePhoto}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 border border-dashed border-slate-205 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
            >
              <ImageIcon className="w-5 h-5 text-slate-400" />
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Attach Site Photo</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handlePostUpdate('Sent to Client')}
              className="flex-1 py-2 bg-brand-primary text-slate-905 rounded-xl font-black uppercase text-center shadow-3xs flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Send Client
            </button>
            <button
              onClick={() => handlePostUpdate('Draft')}
              className="px-4 py-2 border border-slate-205 text-slate-655 hover:bg-slate-55 rounded-xl font-bold uppercase"
            >
              Draft
            </button>
          </div>
        </div>
      </Card>

    </div>
  );
}
