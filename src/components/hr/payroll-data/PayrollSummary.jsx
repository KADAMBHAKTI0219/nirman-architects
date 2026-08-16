import React from 'react';
import { Users, DollarSign, Wallet, Percent, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export default function PayrollSummary({ records = [] }) {
  const totalEmployees = records.length;
  const totalBaseSalary = records.reduce((sum, r) => sum + (Number(r.baseSalary) || 0), 0);
  const totalDeductions = records.reduce((sum, r) => sum + (Number(r.totalDeduction) || 0), 0);
  const totalNetPay = records.reduce((sum, r) => sum + (Number(r.netSalary) || 0), 0);
  const isGenerated = totalEmployees > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {/* Total Employees */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Employees</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <strong className="text-xl font-black text-slate-900 block">{totalEmployees}</strong>
        <span className="text-[10px] font-semibold text-slate-400 block">Staff in payroll cycle</span>
      </div>

      {/* Base Payroll */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Base Payroll</span>
          <Wallet className="w-4 h-4 text-blue-500" />
        </div>
        <strong className="text-xl font-black text-slate-900 block">{formatCurrency(totalBaseSalary)}</strong>
        <span className="text-[10px] font-semibold text-slate-400 block">Total monthly base</span>
      </div>

      {/* Total Deductions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Deductions</span>
          <Percent className="w-4 h-4 text-rose-500" />
        </div>
        <strong className="text-xl font-black text-rose-600 block">{formatCurrency(totalDeductions)}</strong>
        <span className="text-[10px] font-semibold text-slate-400 block">Absences & unpaid leave</span>
      </div>

      {/* Net Payroll */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Net Payroll</span>
          <DollarSign className="w-4 h-4 text-emerald-500" />
        </div>
        <strong className="text-xl font-black text-emerald-600 block">{formatCurrency(totalNetPay)}</strong>
        <span className="text-[10px] font-semibold text-slate-400 block">Total payable amount</span>
      </div>

      {/* Status */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Cycle Status</span>
          <ShieldCheck className="w-4 h-4 text-amber-500" />
        </div>
        <strong className={`text-sm font-black block mt-1 ${isGenerated ? 'text-emerald-600' : 'text-slate-500'}`}>
          {isGenerated ? 'Generated' : 'Not Generated'}
        </strong>
        <span className="text-[10px] font-semibold text-slate-400 block">
          {isGenerated ? `${totalEmployees} records active` : 'Awaiting generation'}
        </span>
      </div>
    </div>
  );
}
