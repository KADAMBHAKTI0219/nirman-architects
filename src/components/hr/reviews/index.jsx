import React, { useState } from 'react';
import { 
  Award, CheckCircle, Search, Eye, X, BookOpen, Clock, AlertTriangle 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_REVIEWS = [
  { id: "REV-101", employeeId: "EMP-101", name: "Sarah Connor", rating: 4.8, goals: "100%", attendanceScore: "96%", reviewer: "Bruce Wayne", status: "Completed", cycle: "Quarterly", feedback: "Excellent blueprints leadership." },
  { id: "REV-102", employeeId: "EMP-102", name: "Alice Smith", rating: 4.5, goals: "90%", attendanceScore: "94%", reviewer: "Sarah Connor", status: "Completed", cycle: "Quarterly", feedback: "Staircase layout checks are precise." },
  { id: "REV-103", employeeId: "EMP-103", name: "Bob Johnson", rating: 3.8, goals: "80%", attendanceScore: "92%", reviewer: "John Wick", status: "Due", cycle: "Quarterly", feedback: "Awaiting final foundation survey notes." },
  { id: "REV-104", employeeId: "EMP-104", name: "Charlie Brown", rating: 3.5, goals: "75%", attendanceScore: "88%", reviewer: "Sarah Connor", status: "Due", cycle: "Quarterly", feedback: "Awaiting submission of CAD files." },
  { id: "REV-105", employeeId: "EMP-105", name: "Frank Castle", rating: 4.2, goals: "85%", attendanceScore: "91%", reviewer: "John Wick", status: "Completed", cycle: "Quarterly", feedback: "Concrete deadweight audits logs check." }
];

export default function Reviews() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(INITIAL_REVIEWS[0]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const filtered = reviews.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartReview = (name) => {
    alert(`Initiating new feedback appraisal loop for ${name}... Completed.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Performance & Reviews</strong>
            <span className="text-[10px] text-slate-405 block font-bold">Conduct staff appraisals, track target completion logs, and review marks</span>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Due Reviews</span>
          <strong className="text-base font-black text-amber-500 block mt-0.5">2 Reviews</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Completed Reviews</span>
          <strong className="text-base font-black text-emerald-600 block mt-0.5">3 Done</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">High Performers</span>
          <strong className="text-base font-black text-indigo-505 block mt-0.5">2 Staff</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Needs Attention</span>
          <strong className="text-base font-black text-rose-500 block mt-0.5">1 Alert</strong>
        </div>
      </div>

      {/* 3. TABLE & REVIEW DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Table Container */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'} space-y-4`}>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search reviews..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Appraisal Rating</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Goals Done</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Review Cycle</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(r => (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-50/40 cursor-pointer ${selectedReview?.id === r.id ? 'bg-slate-50' : ''}`}
                      onClick={() => {
                        setSelectedReview(r);
                        setDrawerOpen(true);
                      }}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <strong className="text-slate-850 block">{r.name}</strong>
                          <span className="text-[9px] text-slate-405 block font-semibold">{r.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="text-[#2484C6] font-extrabold">{r.rating} / 5.0</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{r.goals}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{r.attendanceScore}</td>
                      <td className="px-4 py-3.5 text-slate-455 align-middle">{r.cycle}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle" onClick={(e)=>e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedReview(r);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-550" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right drawer - Review details */}
        {drawerOpen && selectedReview && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Appraisal Feedback</span>
                <strong className="text-slate-805 block text-xs mt-1">{selectedReview.name}</strong>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-550 font-bold">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Reviewer</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedReview.reviewer}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Review status</span>
                <span className="font-bold text-slate-750 block mt-0.5">{selectedReview.status}</span>
              </div>
              
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[8px] text-slate-405 block uppercase">Feedback Comments</span>
                <p className="text-[10px] font-semibold text-slate-700 italic">
                  "{selectedReview.feedback}"
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleStartReview(selectedReview.name)}
                  className="w-full py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 text-xs font-black uppercase rounded-xl transition-all shadow-sm"
                >
                  Start Review Cycle
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
