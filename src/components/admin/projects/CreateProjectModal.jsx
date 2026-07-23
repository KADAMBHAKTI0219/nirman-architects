import React from 'react';
import { X } from 'lucide-react';

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  newProject,
  setNewProject
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Register New Project</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Assign client details and initial valuation limits</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto max-h-[460px] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Project Code</label>
              <input 
                type="text" 
                required 
                value={newProject.code}
                onChange={(e) => setNewProject({...newProject, code: e.target.value})}
                placeholder="PRJ-CP-104"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Project Name</label>
              <input 
                type="text" 
                required 
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Tower Phase 2"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Client Corporation</label>
              <input 
                type="text" 
                required 
                value={newProject.client}
                onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                placeholder="NexGen Ltd."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Client Email</label>
              <input 
                type="email" 
                required 
                value={newProject.clientEmail}
                onChange={(e) => setNewProject({...newProject, clientEmail: e.target.value})}
                placeholder="email@client.com"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Client Phone</label>
              <input 
                type="text" 
                required 
                value={newProject.clientPhone}
                onChange={(e) => setNewProject({...newProject, clientPhone: e.target.value})}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Physical Location</label>
              <input 
                type="text" 
                required 
                value={newProject.location}
                onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                placeholder="Sector 62, Noida"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Category Type</label>
              <select 
                value={newProject.category}
                onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
                <option value="Retail">Retail</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Priority Weight</label>
              <select 
                value={newProject.priority}
                onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Valuation Budget ($)</label>
              <input 
                type="number" 
                required 
                value={newProject.budget}
                onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                placeholder="1200000"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Lead Manager</label>
              <select 
                value={newProject.manager}
                onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Sarah Connor">Sarah Connor</option>
                <option value="John Wick">John Wick</option>
                <option value="Frank Castle">Frank Castle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
              <input 
                type="date" 
                required 
                value={newProject.startDate}
                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Est Completion</label>
              <input 
                type="date" 
                required 
                value={newProject.estCompletion}
                onChange={(e) => setNewProject({...newProject, estCompletion: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-sm transition-all"
            >
              Register Contract
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
