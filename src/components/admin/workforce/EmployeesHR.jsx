import React, { useState } from 'react';
import { 
  Search, Eye, ShieldCheck, Mail, MapPin, Briefcase, FileText, CheckCircle2, 
  Clock, Plus, Filter, Award, ChevronRight, Laptop, Calendar, DollarSign, UserCheck
} from 'lucide-react';
import Card from '../../common/Card';

export default function EmployeesHR({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onAddEmployeeClick
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = ['All', 'Architecture', 'Engineering', 'Project Management', 'HR'];

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Employees</span>
          <strong className="text-base font-black text-slate-800 block mt-1">28 Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Shift</span>
          <strong className="text-base font-black text-emerald-600 block mt-1">24 Active</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">On Leave</span>
          <strong className="text-base font-black text-rose-600 block mt-1">2 Leave</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">New Joiners</span>
          <strong className="text-base font-black text-sky-500 block mt-1">3 New</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Resigned</span>
          <strong className="text-base font-black text-slate-500 block mt-1">1 Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Departments</span>
          <strong className="text-base font-black text-indigo-505 block mt-1">4 Groups</strong>
        </div>
      </div>

      {/* 2. Main split view: Directory (2/3 width) + Profile Inspector (1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Search, Filters, and Table Directory */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search employees directory..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept} Department</option>
                ))}
              </select>

              <button
                onClick={onAddEmployeeClick}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile details</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Shift Hours</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Duty status</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map(emp => (
                    <tr 
                      key={emp.id} 
                      className={`hover:bg-slate-50/40 cursor-pointer ${selectedEmployee?.id === emp.id ? 'bg-slate-50' : ''}`}
                      onClick={() => onSelectEmployee(emp)}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-xs">
                            {emp.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <strong className="text-slate-805 block">{emp.name}</strong>
                            <span className="text-[9px] text-slate-400 block font-semibold">{emp.designation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{emp.department}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{emp.shift}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          emp.attendanceStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>{emp.attendanceStatus}</span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                          <Award className="w-3 h-3 text-indigo-500" />
                          {emp.performanceBadge}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEmployee(emp);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                          title="Open HR Profile Profile"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-slate-655" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Selected Employee Profile Command Drawer */}
        <div className="space-y-6">
          
          {selectedEmployee ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-6 animate-in fade-in duration-200">
              
              {/* Profile Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center font-black text-slate-805">
                  {selectedEmployee.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-black text-slate-905 text-sm leading-none">{selectedEmployee.name}</h4>
                  <span className="text-[10px] text-slate-450 font-bold block mt-1">{selectedEmployee.designation} &bull; Joined {selectedEmployee.joiningDate}</span>
                </div>
              </div>

              {/* Roster / Scheduling details */}
              <div className="space-y-3.5 text-xs text-slate-650">
                
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Department & Shift</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-750">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEmployee.department} Department &bull; {selectedEmployee.shift}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Leave Tracker Status</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-750">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEmployee.leaveStatus} ({selectedEmployee.leaveHistory})</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Payroll Summary</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-750">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Salary: {selectedEmployee.payrollData.salary} &bull; Bank: {selectedEmployee.payrollData.bank}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Assigned Active Projects</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEmployee.assignedProjects.map(proj => (
                      <span key={proj} className="px-2 py-0.5 bg-slate-50 border border-slate-150 rounded text-[9px] font-bold text-slate-500">
                        {proj}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">HR Documents Vault</span>
                  <div className="space-y-1.5 mt-1.5">
                    {selectedEmployee.documents.map(doc => (
                      <div key={doc} className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-700">{doc}</span>
                        <button 
                          onClick={() => alert(`Downloading Document: ${doc}`)}
                          className="text-[9px] text-[#2484C6] hover:underline font-bold uppercase"
                        >
                          Get file
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Actions panel */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => alert(`Opening edit dialog for employee: ${selectedEmployee.name}`)}
                  className="flex-1 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded-xl transition-all shadow-3xs"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => alert(`Leave application approved for ${selectedEmployee.name}`)}
                  className="flex-1 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 text-xs font-black uppercase rounded-xl transition-all shadow-sm"
                >
                  Approve Leave
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs text-center text-slate-400 h-80 flex flex-col items-center justify-center">
              <UserCheck className="w-8 h-8 text-slate-300 mb-2" />
              <span>Select an employee record to inspect detailed leaves, payrolls, and documents.</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
