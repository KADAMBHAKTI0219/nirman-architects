import React from 'react';
import { PieChart, Building, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export default function PayrollAnalytics({ records = [] }) {
  if (!records || records.length === 0) return null;

  // Department Aggregates
  const departmentMap = {};
  records.forEach(rec => {
    const dept = rec.department || 'Unassigned';
    if (!departmentMap[dept]) {
      departmentMap[dept] = { count: 0, base: 0, deductions: 0, net: 0 };
    }
    departmentMap[dept].count += 1;
    departmentMap[dept].base += Number(rec.baseSalary) || 0;
    departmentMap[dept].deductions += Number(rec.totalDeduction) || 0;
    departmentMap[dept].net += Number(rec.netSalary) || 0;
  });

  const departmentList = Object.entries(departmentMap).map(([name, data]) => ({
    name,
    ...data
  }));

  // Overall totals for ratio calculations
  const totalBase = records.reduce((sum, r) => sum + (Number(r.baseSalary) || 0), 0);
  const totalDeductions = records.reduce((sum, r) => sum + (Number(r.totalDeduction) || 0), 0);
  const totalNet = records.reduce((sum, r) => sum + (Number(r.netSalary) || 0), 0);

  const netPct = totalBase > 0 ? Math.round((totalNet / totalBase) * 100) : 0;
  const deductionPct = totalBase > 0 ? Math.round((totalDeductions / totalBase) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
          <BarChart3 className="w-5 h-5 stroke-[2]" />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Payroll Insights</h2>
          <p className="text-xs text-slate-400 font-semibold">Real-time department cost breakdown and salary ratios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Department Payroll Expense */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Department Breakdown</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {departmentList.map(dept => (
              <div key={dept.name} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-slate-800">{dept.name}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                    {dept.count} {dept.count === 1 ? 'staff' : 'staff'}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Salary:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(dept.base)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Deductions:</span>
                    <span className="font-bold text-rose-600">-{formatCurrency(dept.deductions)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Net Payable:</span>
                    <span className="text-emerald-600">{formatCurrency(dept.net)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Salary Component Distribution */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-slate-400" />
            <span>Salary Ratios</span>
          </h3>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Net Pay Proportion</span>
                <span className="text-emerald-600 font-extrabold">{netPct}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, netPct)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Deduction Ratio</span>
                <span className="text-rose-600 font-extrabold">{deductionPct}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, deductionPct)}%` }} />
              </div>
            </div>

            <div className="pt-2 text-[11px] font-semibold text-slate-400 border-t border-slate-200">
              Calculated dynamically from {records.length} payroll records for selected month.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
