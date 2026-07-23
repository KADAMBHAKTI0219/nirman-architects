import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Award, CheckSquare, Clock, AlertTriangle, Eye, Send } from 'lucide-react';
import Card from '../../common/Card';

export default function HRPerformance({
  performanceRecords,
  onUpdateNotes
}) {
  const [selectedRecord, setSelectedRecord] = useState(performanceRecords[0]);
  const [notesInput, setNotesInput] = useState('');

  const handleNotesSubmit = (e) => {
    e.preventDefault();
    if (!notesInput.trim()) return;
    onUpdateNotes(selectedRecord.id, notesInput);
    setSelectedRecord(prev => ({
      ...prev,
      reviewNotes: notesInput
    }));
    setNotesInput('');
    alert("Performance review notes saved successfully!");
  };

  // Chart data comparing task completion and productivity
  const chartData = performanceRecords.map(rec => ({
    name: rec.name.split(' ')[0],
    completion: rec.taskCompletion,
    productivity: rec.productivity
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Upper split layout: Employee List (1/3) + Selected Scorecard (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Employees selection */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4 h-[380px] overflow-y-auto">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Staff Roster Reviews</span>
          <div className="space-y-2">
            {performanceRecords.map(rec => (
              <button
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                  selectedRecord?.id === rec.id
                    ? 'bg-brand-tint border-brand-primary text-slate-900 font-extrabold shadow-3xs'
                    : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div>
                  <strong className="block">{rec.name}</strong>
                  <span className="text-[9px] block text-slate-400 font-semibold">{rec.role}</span>
                </div>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black">{rec.score}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Scorecard & Review Notes Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedRecord ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center font-black text-indigo-650 text-xs">
                  {selectedRecord.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-black text-slate-905 text-xs block leading-none">{selectedRecord.name}</h4>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-1">Reviewing: {selectedRecord.role}</span>
                </div>
              </div>

              {/* Ratios Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Productivity</span>
                  <strong className="text-sm text-slate-800 block">{selectedRecord.productivity}%</strong>
                </div>
                <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Tasks Done</span>
                  <strong className="text-sm text-slate-800 block">{selectedRecord.taskCompletion}%</strong>
                </div>
                <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Attendance</span>
                  <strong className="text-sm text-slate-800 block">{selectedRecord.attendanceScore}%</strong>
                </div>
                <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-450 block uppercase text-rose-500">Delay count</span>
                  <strong className="text-sm text-rose-600 block">{selectedRecord.delaysCount} Alerts</strong>
                </div>
              </div>

              {/* Review notes summary */}
              <div className="space-y-1 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">HR Evaluator Notes</span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-2xl leading-relaxed text-slate-700 italic">
                  "{selectedRecord.reviewNotes}"
                </p>
              </div>

              {/* Notes submission form */}
              <form onSubmit={handleNotesSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-405 uppercase block">Update review evaluation</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required 
                    placeholder="Type performance details (e.g. Excellent CAD layout precision, riser code check verified)..." 
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase shadow-3xs flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Save Notes
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs text-center text-slate-400">
              Select an employee record from the roster.
            </div>
          )}

        </div>

      </div>

      {/* Ratios Comparison Chart */}
      <Card title="Productivity & Task Completion Ratios" subtitle="Comparison of completion ratios across department groups">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" fill="#8FC9FF" name="Task Completion (%)" />
              <Bar dataKey="productivity" fill="#34D399" name="Productivity Score (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
