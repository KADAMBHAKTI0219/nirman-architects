import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import CustomSelect from '../../common/CustomSelect';

export default function ShiftDetailDrawer({ selectedCell, onClose, onSave }) {
  const [selectedShift, setSelectedShift] = useState(selectedCell?.shift || 'Morning');

  useEffect(() => {
    if (selectedCell) {
      setSelectedShift(selectedCell.shift || 'Morning');
    }
  }, [selectedCell]);

  if (!selectedCell) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(selectedCell.employeeName, selectedCell.day, selectedShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 text-xs font-semibold">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900">Shift Roster Assign</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-slate-600 font-bold">
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Employee & Day</span>
            <span className="font-bold text-slate-700 block mt-0.5">{selectedCell.employeeName} &bull; {selectedCell.day}</span>
          </div>

          <div>
            <CustomSelect
              label="Assign Shift"
              value={selectedShift}
              onChange={(val) => setSelectedShift(val)}
              options={[
                { value: 'Morning', label: 'Morning (09:00 AM - 05:30 PM)' },
                { value: 'Evening', label: 'Evening (02:00 PM - 10:30 PM)' },
                { value: 'Night', label: 'Night (08:00 PM - 04:30 AM)' },
                { value: 'Leave', label: 'Leave (Off Duty)' }
              ]}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 text-xs font-black uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Assign Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
