import React, { useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Info, Edit3, Trash2, CalendarRange, Award } from 'lucide-react';
import Card from '../../common/Card';

export default function LeaveMaster({
  leaveTypes,
  onDeactivate,
  onCreate
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    defaultQuota: 5,
    carryForward: false,
    colorTag: '#2484C6',
    description: '',
    isPaid: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    
    // Normalize properties to map precisely to the backend model schema
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      isPaid: Boolean(formData.isPaid),
      defaultQuotaPerYear: Number(formData.defaultQuota),
      defaultQuota: Number(formData.defaultQuota),
      colorTag: formData.colorTag,
      description: formData.description?.trim()
    };

    onCreate(payload);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      code: '',
      defaultQuota: 5,
      carryForward: false,
      colorTag: '#2484C6',
      description: '',
      isPaid: true
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header controls */}
      <div className="flex justify-between items-center bg-slate-50/40 p-4 rounded-2xl border border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none">Dynamic Leave Master</h3>
          <span className="text-[10px] text-slate-400 font-bold block mt-1">Configure company-wide dynamic leave categories and quotas</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Leave Type
        </button>
      </div>

      {/* 2. Leave Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaveTypes.map((type) => (
          <div 
            key={type._id}
            className={`bg-white p-5 rounded-3xl border shadow-2xs space-y-4 flex flex-col justify-between transition-all hover:shadow-md ${
              type.isActive ? 'border-slate-100/90' : 'border-slate-200 bg-slate-50/50 opacity-75'
            }`}
          >
            <div className="space-y-3">
              {/* Card Header Tag */}
              <div className="flex justify-between items-start gap-1.5 flex-wrap">
                <div className="flex gap-1.5 items-center">
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
                    style={{ backgroundColor: type.colorTag || '#2484C6' }}
                  >
                    {type.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    type.isPaid !== false 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {type.isPaid !== false ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  type.isActive 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {type.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <strong className="text-slate-805 block text-sm font-extrabold">{type.name}</strong>
                <p className="text-[11px] text-slate-500 font-medium leading-normal mt-1 min-h-[36px]">
                  {type.description || 'No description provided.'}
                </p>
              </div>

              {/* Quotas & Carry Forward info */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-550">
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Quota</span>
                  <span className="text-slate-700 block mt-0.5">
                    {type.defaultQuota !== undefined ? type.defaultQuota : (type.defaultQuotaPerYear !== undefined ? type.defaultQuotaPerYear : 0)} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Type</span>
                  <span className="text-slate-700 block mt-0.5">{type.isPaid !== false ? 'Paid' : 'Unpaid'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Carry Fwd</span>
                  <span className="text-slate-700 block mt-0.5">{type.carryForward ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {type.isActive && (
              <div className="pt-3 border-t border-slate-50 flex justify-end">
                <button
                  onClick={() => onDeactivate(type._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                  title="Deactivate Leave Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Deactivate
                </button>
              </div>
            )}
          </div>
        ))}

        {leaveTypes.length === 0 && (
          <div className="col-span-1 md:col-span-3 py-12 bg-white rounded-3xl border border-slate-100 text-center text-slate-400 font-bold uppercase tracking-wider">
            <CalendarRange className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No leave types defined yet. Click Add Leave Type.
          </div>
        )}
      </div>

      {/* 3. Create Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <h4 className="text-sm font-black text-slate-805 uppercase tracking-wider">Create New Leave Type</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-1">Define dynamic leave terms and parameters</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1.5 hover:bg-slate-50 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-550">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Leave Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Marriage Leave"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Leave Code (Unique)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. MRG"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Default Quota (Days)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="60"
                    value={formData.defaultQuota}
                    onChange={(e) => setFormData({...formData, defaultQuota: parseInt(e.target.value) || 0})}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Color Tag Hex</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={formData.colorTag}
                      onChange={(e) => setFormData({...formData, colorTag: e.target.value})}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 bg-transparent flex-shrink-0"
                    />
                    <input 
                      type="text" 
                      required
                      value={formData.colorTag}
                      onChange={(e) => setFormData({...formData, colorTag: e.target.value})}
                      className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-700 block uppercase font-black">Carry Forward</span>
                    <span className="text-[8px] text-slate-400 block font-bold leading-normal mt-0.5">Roll over unused balance</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, carryForward: !formData.carryForward})}
                    className="text-slate-600 focus:outline-none"
                  >
                    {formData.carryForward ? (
                      <ToggleRight className="w-9 h-9 text-brand-primary" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-700 block uppercase font-black">Paid Leave</span>
                    <span className="text-[8px] text-slate-400 block font-bold leading-normal mt-0.5">No salary deductions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isPaid: !formData.isPaid})}
                    className="text-slate-600 focus:outline-none"
                  >
                    {formData.isPaid ? (
                      <ToggleRight className="w-9 h-9 text-brand-primary" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Description</label>
                <textarea 
                  placeholder="Provide details about policies or approval terms..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 resize-none leading-normal font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider text-[10px] font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl shadow-xs uppercase tracking-wider text-[10px] font-black"
                >
                  Create Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
