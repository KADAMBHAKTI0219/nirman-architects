import React, { useState } from 'react';
import { X, Clock, RefreshCw, Save } from 'lucide-react';

export default function ShiftDetailDrawer({
  selectedCell,
  onClose,
  onSave
}) {
  const [selectedShift, setSelectedShift] = useState('');

  React.useEffect(() => {
    if (selectedCell) {
      setSelectedShift(selectedCell.shift);
    }
  }, [selectedCell]);

  if (!selectedCell) {
    return (
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-center text-slate-400 text-xs py-8">
        Click a shift block in the grid to schedule or swap.
      </div>
    );
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(selectedCell.employeeName, selectedCell.day, selectedShift);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
      
      <div className="flex justify-between items-start border-b border-slate-50 pb-3">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Roster Assignment</span>
          <strong className="text-slate-805 block text-xs mt-1">{selectedCell.employeeName}</strong>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-100 text-slate-405 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-slate-550 font-bold">
        <div>
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Role & Day</span>
          <span className="font-bold text-slate-700 block mt-0.5">{selectedCell.role} &bull; {selectedCell.day}</span>
        </div>

        <div>
          <label className="text-[9px] font-bold text-slate-405 uppercase block mb-1">Assign Shift</label>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
          >
            <option value="Morning">Morning (09:00 AM - 05:30 PM)</option>
            <option value="Evening">Evening (02:00 PM - 10:30 PM)</option>
            <option value="Night">Night (08:00 PM - 04:30 AM)</option>
            <option value="Leave">Leave (Off Duty)</option>
          </select>
        </div>

        <div className="pt-3 border-t border-slate-50 flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 text-xs font-black uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
          >
            <Save className="w-4 h-4" />
            Assign Shift
          </button>
        </div>
      </form>

    </div>
  );
}
