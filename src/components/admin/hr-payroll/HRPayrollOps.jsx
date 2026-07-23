import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Search, DollarSign, FileText, Download, Calculator, Check } from 'lucide-react';
import Card from '../../common/Card';

const COLORS = ['#8FC9FF', '#A2D2FF', '#34D399', '#EF4444'];

export default function HRPayrollOps({
  payrollRecords,
  onCalculatePayroll,
  payrollApproved,
  onApprovePayroll
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('July 2026');

  // Filtered payroll
  const filteredRecords = payrollRecords.filter(rec => 
    rec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recharts Data
  const deptCostData = [
    { name: 'Architecture', cost: 15400 },
    { name: 'Engineering', cost: 24200 },
    { name: 'Project Mgmt', cost: 18500 }
  ];

  const monthlyTrendData = [
    { month: 'May', cost: 52000 },
    { month: 'Jun', cost: 55000 },
    { month: 'Jul', cost: 58100 }
  ];

  const componentSplitData = [
    { name: 'Basic Pay', value: 45000 },
    { name: 'Allowances', value: 8500 },
    { name: 'Bonuses', value: 6200 },
    { name: 'Deductions', value: 1600 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Month Selector & Calculation triggers */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-tint border border-brand-primary text-slate-805 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Payroll Process Area</strong>
            <span className="text-[10px] text-slate-400 block font-bold">Calculate net payouts linked to biometric attendance logs</span>
          </div>
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
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
            onClick={onCalculatePayroll}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase transition-all shadow-3xs"
          >
            Fetch Attendance Logs
          </button>

          <button
            onClick={onApprovePayroll}
            disabled={payrollApproved}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1.5 ${
              payrollApproved 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-150 cursor-not-allowed font-extrabold' 
                : 'bg-brand-primary hover:bg-brand-secondary text-slate-905'
            }`}
          >
            <Check className="w-4 h-4" />
            {payrollApproved ? 'Payroll Released' : 'Approve Release'}
          </button>
        </div>

      </div>

      {/* 2. Payouts Table */}
      <Card title="Employee Payroll Register Sheets" subtitle="Itemized salary components matching monthly roster shifts data">
        <div className="space-y-4">
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search staff payroll sheets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee details</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Salary</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Allowances</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deductions</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-rose-500">Delay penalty</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bonuses</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Pay</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3.5 align-middle">
                      <div>
                        <strong className="text-slate-805 block">{rec.name}</strong>
                        <span className="text-[9px] text-slate-400 block font-semibold">{rec.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-bold align-middle">${rec.base}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">+${rec.allowance}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">-${rec.deduction}</td>
                    <td className="px-4 py-3.5 text-rose-505 font-bold align-middle">-${rec.delayPenalty}</td>
                    <td className="px-4 py-3.5 text-emerald-600 font-bold align-middle">+${rec.bonus}</td>
                    <td className="px-4 py-3.5 text-slate-805 font-black align-middle">${rec.netPay}</td>
                    <td className="px-4 py-3.5 text-right align-middle">
                      <button
                        onClick={() => alert(`Downloading Payslip PDF for ${rec.name}`)}
                        className="px-2.5 py-1 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-3xs transition-all flex items-center gap-0.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </Card>

      {/* 3. Payroll Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cost Trend */}
        <Card title="Monthly Payroll Expenses" subtitle="Total salary costs over recent months">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="105%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Line type="monotone" dataKey="cost" stroke="#34D399" strokeWidth={3} name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dept expense */}
        <Card title="Expense by Department" subtitle="Payroll cost weights by business team groups">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="105%">
              <BarChart data={deptCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="cost" fill="#A2D2FF" radius={[4, 4, 0, 0]} name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Components split */}
        <Card title="Salary Component Breakdown" subtitle="Distribution ratio of payroll payouts components">
          <div className="h-48 flex justify-center items-center">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={componentSplitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {componentSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" iconSize={8} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
}
