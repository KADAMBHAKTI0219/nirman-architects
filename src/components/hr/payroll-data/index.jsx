import React, { useState } from 'react';
import { 
  DollarSign, FileText, CheckCircle, AlertCircle, Search, 
  Download, Eye, RefreshCw, X, Play 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_PAYROLL = [
  { id: "PAY-101", employeeId: "EMP-101", name: "Sarah Connor", gross: 75000, deductions: 5200, net: 69800, status: "Paid", bank: "Nirman Axis Bank", payslipNo: "PS-2026-071" },
  { id: "PAY-102", employeeId: "EMP-102", name: "Alice Smith", gross: 45000, deductions: 3100, net: 41900, status: "Paid", bank: "Nirman Axis Bank", payslipNo: "PS-2026-072" },
  { id: "PAY-103", employeeId: "EMP-103", name: "Bob Johnson", gross: 50000, deductions: 3500, net: 46500, status: "Pending", bank: "HDFC Salaries", payslipNo: "PS-2026-073" },
  { id: "PAY-104", employeeId: "EMP-104", name: "Charlie Brown", gross: 35000, deductions: 2400, net: 32600, status: "Pending", bank: "HDFC Salaries", payslipNo: "PS-2026-074" },
  { id: "PAY-105", employeeId: "EMP-105", name: "Frank Castle", gross: 40000, deductions: 2800, net: 37200, status: "Error", bank: "Unmatched IFSC", payslipNo: "PS-2026-075" }
];

export default function PayrollData() {
  const [payroll, setPayroll] = useState(INITIAL_PAYROLL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPay, setSelectedPay] = useState(INITIAL_PAYROLL[0]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const filtered = payroll.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunPayroll = () => {
    alert("Running payroll processing sequence for the current month... Success.");
    setPayroll(prev => prev.map(p => p.status === 'Pending' ? { ...p, status: 'Paid' } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Payroll Operations</strong>
            <span className="text-[10px] text-slate-405 block font-bold">Process operational salary releases and tax deduction logs</span>
          </div>
        </div>

        <button
          onClick={handleRunPayroll}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
        >
          <Play className="w-4 h-4" />
          Run Payroll
        </button>
      </div>

      {/* 2. SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Payroll</span>
          <strong className="text-base font-black text-slate-800 block mt-0.5">$245,000</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Net Payable</span>
          <strong className="text-base font-black text-emerald-600 block mt-0.5">$228,000</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Deductions</span>
          <strong className="text-base font-black text-slate-500 block mt-0.5">$17,000</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Approvals</span>
          <strong className="text-base font-black text-amber-500 block mt-0.5">2 Pending</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Payroll Errors</span>
          <strong className="text-base font-black text-rose-500 block mt-0.5">1 Alert</strong>
        </div>
      </div>

      {/* 3. TABLE & PAYSLIP DETAILS DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Table Container */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'} space-y-4`}>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff payroll..." 
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
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Salary</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deductions</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Pay</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-50/40 cursor-pointer ${selectedPay?.id === p.id ? 'bg-slate-50' : ''}`}
                      onClick={() => {
                        setSelectedPay(p);
                        setDrawerOpen(true);
                      }}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <strong className="text-slate-805 block">{p.name}</strong>
                          <span className="text-[9px] text-slate-405 block font-semibold">{p.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-bold align-middle">${p.gross.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-slate-450 align-middle">${p.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-emerald-600 font-extrabold align-middle">${p.net.toLocaleString()}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          p.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle" onClick={(e)=>e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedPay(p);
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

        {/* Right drawer - payslip info */}
        {drawerOpen && selectedPay && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payslip Info</span>
                <strong className="text-slate-805 block text-xs mt-1">{selectedPay.name}</strong>
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
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Payslip Number</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedPay.payslipNo}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Credited Bank</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedPay.bank}</span>
              </div>
              
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-455">
                  <span>Gross Base Salary:</span>
                  <span>${selectedPay.gross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-rose-500">
                  <span>Tax Deductions:</span>
                  <span>-${selectedPay.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-black text-slate-800 pt-2 border-t border-slate-205">
                  <span>Net Payable Amount:</span>
                  <span>${selectedPay.net.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => alert(`Downloading payslip for ${selectedPay.name}`)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase rounded-xl transition-all shadow-3xs flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Get PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
