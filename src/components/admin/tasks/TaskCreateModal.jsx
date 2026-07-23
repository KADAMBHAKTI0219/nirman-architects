import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TaskCreateModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    title: '',
    project: 'Central Office Tower',
    assignee: 'Sarah Connor',
    dept: 'Architecture',
    priority: 'Medium',
    deadline: '',
    estTime: '',
    description: '',
    dependencies: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset Form
    setFormData({
      title: '',
      project: 'Central Office Tower',
      assignee: 'Sarah Connor',
      dept: 'Architecture',
      priority: 'Medium',
      deadline: '',
      estTime: '',
      description: '',
      dependencies: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Register New Task</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Assign requirements and deadline bounds</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[460px] space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Task Title</label>
            <input 
              type="text" 
              required 
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Draft HVAC Schematics V2"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Project Reference</label>
              <select 
                value={formData.project}
                onChange={(e) => handleChange('project', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Central Office Tower">Central Office Tower</option>
                <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
                <option value="Smart City Mall">Smart City Mall</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Assignee</label>
              <select 
                value={formData.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Sarah Connor">Sarah Connor</option>
                <option value="Alice Smith">Alice Smith</option>
                <option value="Bob Johnson">Bob Johnson</option>
                <option value="Frank Castle">Frank Castle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Department</label>
              <select 
                value={formData.dept}
                onChange={(e) => handleChange('dept', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Architecture">Architecture</option>
                <option value="Engineering">Engineering</option>
                <option value="Procurement">Procurement</option>
                <option value="Quality Control">Quality Control</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Est Time (Hours)</label>
              <input 
                type="number" 
                required 
                value={formData.estTime}
                onChange={(e) => handleChange('estTime', e.target.value)}
                placeholder="12"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Deadline Date</label>
              <input 
                type="date" 
                required 
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Dependencies</label>
            <input 
              type="text" 
              value={formData.dependencies}
              onChange={(e) => handleChange('dependencies', e.target.value)}
              placeholder="e.g. Soil tests sign-off"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Detailed Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe staircase balustrades, concrete reinforcement guidelines..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
            ></textarea>
          </div>

          {/* Footer Actions */}
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
              Register Task
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
