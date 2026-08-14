import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, FileText, CheckCircle, AlertCircle, Search, 
  Download, Eye, RefreshCw, X, Play 
} from 'lucide-react';
import Card from '../../common/Card';
import {
  getAllPayroll,
  downloadEmployeePayslip
} from '../../../service/hrm/payroll';
import { parseIndexedObjectToArray } from '../../../service/hrm/leave';

export default function PayrollData() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('July 2026');
  const [selectedPay, setSelectedPay] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const [monthName, yearStr] = selectedMonth.split(' ');
  const monthNum = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  }[monthName] || 7;
  const yearNum = Number(yearStr) || 2026;

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await getAllPayroll({ month: monthNum, year: yearNum });
      const list = parseIndexedObjectToArray(res);
      const mapped = list.map(rec => {
        const userObj = rec.userId || {};
        return {
          id: rec._id,
          userId: userObj._id || rec.userId,
          name: userObj.name || "Nirman Employee",
          employeeId: userObj.email?.split('@')[0] || "EMP",
          gross: rec.baseSalary || 0,
          deductions: rec.totalDeduction || 0,
          net: rec.netSalary || 0,
          status: "Paid",
          bank: "Nirman Axis Bank",
          payslipNo: `PS-${rec.year}-${String(rec.month).padStart(2, '0')}-${rec._id?.substring(18).toUpperCase() || 'XXX'}`
        };
      });
      setPayroll(mapped);
      if (mapped.length > 0) {
        setSelectedPay(mapped[0]);
      } else {
        setSelectedPay(null);
      }
    } catch (err) {
      console.error("Failed to fetch payroll list for HR:", err);
      showToast("Error loading payroll sheets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth]);

  const handleDownloadPDF = async () => {
    if (!selectedPay) return;
    try {
      showToast(`Downloading payslip for ${selectedPay.name}...`);
      await downloadEmployeePayslip(selectedPay.userId, selectedPay.name, monthNum, yearNum);
      showToast("Payslip downloaded successfully!");
    } catch (err) {
      console.error("Error downloading employee slip:", err);
      showToast("Admin privilege required to download other employee slips.", "error");
    }
  };

  const filtered = payroll.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGross = payroll.reduce((acc, p) => acc + p.gross, 0);
  const totalNet = payroll.reduce((acc, p) => acc + p.net, 0);
  const totalDeductions = payroll.reduce((acc, p) => acc + p.deductions, 0);

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT & ADMIN DASHBOARD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Payroll Processing & Salary Disbursal
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Process monthly employee salaries, statutory tax deductions, and automated payslip releases
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => alert("Initiating automated salary disbursal batch processing...")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer border border-brand-secondary/40"
          >
            <Play className="w-4 h-4 text-slate-900 stroke-[2.5]" />
            <span>Process Salary Batch</span>
          </button>
        </div>
      </div>

      {/* 1. TOP BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-tint border border-brand-primary text-slate-805 rounded-2xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Payroll Operations</strong>
            <span className="text-[10px] text-slate-400 block font-bold">Process operational salary releases and tax deduction logs</span>
          </div>
        </div>

        <div className="flex gap-2.5 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-700 bg-white font-semibold"
          >
            <option value="June 2026">June 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="August 2026">August 2026</option>
          </select>
          <button
            onClick={fetchPayroll}
            className="p-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 rounded-xl transition-all shadow-3xs"
            title="Refresh Payroll List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-bold text-slate-550">
        <div className="premium-stat-box p-4 text-center bg-white border border-slate-100 rounded-2xl shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Gross</span>
          <strong className="text-base font-black text-slate-800 block mt-0.5">${totalGross.toLocaleString()}</strong>
        </div>
        <div className="premium-stat-box p-4 text-center bg-white border border-slate-100 rounded-2xl shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Net Payable</span>
          <strong className="text-base font-black text-emerald-600 block mt-0.5">${totalNet.toLocaleString()}</strong>
        </div>
        <div className="premium-stat-box p-4 text-center bg-white border border-slate-100 rounded-2xl shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Deductions</span>
          <strong className="text-base font-black text-slate-500 block mt-0.5">${totalDeductions.toLocaleString()}</strong>
        </div>
        <div className="premium-stat-box p-4 text-center bg-white border border-slate-100 rounded-2xl shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Employees</span>
          <strong className="text-base font-black text-amber-500 block mt-0.5">{payroll.length} Staff</strong>
        </div>
        <div className="premium-stat-box p-4 text-center bg-white border border-slate-100 rounded-2xl shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Status</span>
          <strong className="text-base font-black text-emerald-500 block mt-0.5">Ready</strong>
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
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-xs font-bold text-slate-405">
                        No payroll sheets compiled for the selected cycle.
                      </td>
                    </tr>
                  )}
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
                <div className="flex justify-between items-center text-[10px] text-rose-505">
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
                  onClick={handleDownloadPDF}
                  className="flex-1 py-2 bg-slate-150 hover:bg-slate-200 text-slate-705 text-xs font-black uppercase rounded-xl transition-all shadow-3xs flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Get PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold z-50 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-705' : 'bg-rose-50 border-rose-100 text-rose-705'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

