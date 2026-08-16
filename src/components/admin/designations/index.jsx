import React, { useState } from 'react';
import { 
  Award, Search, Plus, Edit2, Trash2, Eye, Users, CheckCircle, XCircle, 
  X, Filter, Layers, Briefcase
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const INITIAL_DESIGNATIONS = [
  { id: 'DES-01', title: 'Principal Architect', department: 'Architecture & Design', level: 'L5 - Executive', employeesCount: 3, status: 'Active', description: 'Lead architectural vision, client design presentations, and structural sign-offs.' },
  { id: 'DES-02', title: 'Senior Project Manager', department: 'Project Management', level: 'L4 - Senior', employeesCount: 5, status: 'Active', description: 'Oversees multi-site execution, timelines, resource allocation, and budget controls.' },
  { id: 'DES-03', title: 'Structural Engineer', department: 'Structural Engineering', level: 'L3 - Mid', employeesCount: 8, status: 'Active', description: 'Performs structural calculations, load-bearing validations, and GFC reviews.' },
  { id: 'DES-04', title: 'Site Supervision Engineer', department: 'Site Operations & Supervision', level: 'L3 - Mid', employeesCount: 14, status: 'Active', description: 'Manages daily site labor, quality control checks, and contractor billing logs.' },
  { id: 'DES-05', title: 'Senior CAD Designer', department: 'Architecture & Design', level: 'L3 - Mid', employeesCount: 10, status: 'Active', description: 'Creates 2D AutoCAD layouts, elevation blueprints, and working construction drawings.' },
  { id: 'DES-06', title: 'BIM & 3D Specialist', department: 'Architecture & Design', level: 'L3 - Mid', employeesCount: 6, status: 'Active', description: 'Builds 3D Revit models, VR walkthroughs, and material rendering views.' },
  { id: 'DES-07', title: 'HR Operations Manager', department: 'Human Resources', level: 'L4 - Senior', employeesCount: 2, status: 'Active', description: 'Handles employee grievances, policy enforcement, biometric devices, and payroll.' },
  { id: 'DES-08', title: 'Accounts Lead', department: 'Accounts & Finance', level: 'L4 - Senior', employeesCount: 2, status: 'Active', description: 'Manages ledger accounts, GST filings, vendor invoices, and financial reporting.' },
  { id: 'DES-09', title: 'Junior Architect Apprentice', department: 'Architecture & Design', level: 'L1 - Entry', employeesCount: 9, status: 'Inactive', description: 'Assists senior architects with site measurements and preliminary drafting.' }
];

export default function DesignationsPage() {
  const { showToast } = useToast();
  const [designations, setDesignations] = useState(INITIAL_DESIGNATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDes, setSelectedDes] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Architecture & Design',
    level: 'L3 - Mid',
    description: '',
    status: 'Active'
  });

  const filteredDes = designations.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || item.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      department: 'Architecture & Design',
      level: 'L3 - Mid',
      description: '',
      status: 'Active'
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedDes(item);
    setFormData({
      title: item.title,
      department: item.department,
      level: item.level,
      description: item.description,
      status: item.status
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Designation title is required', 'error');
      return;
    }

    if (isEditing && selectedDes) {
      setDesignations(designations.map(d => d.id === selectedDes.id ? { ...d, ...formData } : d));
      showToast(`Designation "${formData.title}" updated successfully`, 'success');
    } else {
      const newDes = {
        id: `DES-0${designations.length + 1}`,
        title: formData.title.trim(),
        department: formData.department,
        level: formData.level,
        employeesCount: 0,
        status: formData.status,
        description: formData.description.trim() || 'No description provided.'
      };
      setDesignations([newDes, ...designations]);
      showToast(`Designation "${formData.title}" created successfully`, 'success');
    }

    setShowAddModal(false);
  };

  const handleDeleteDes = (id, title) => {
    if (window.confirm(`Are you sure you want to delete designation "${title}"?`)) {
      setDesignations(designations.filter(d => d.id !== id));
      showToast(`Designation "${title}" removed`, 'info');
    }
  };

  const totalEmps = designations.reduce((acc, d) => acc + d.employeesCount, 0);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E5F0FA] text-[#3B82F6] rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Designations</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage employee roles, levels, and organizational positions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Designation</span>
        </button>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Designations</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{designations.length}</span>
          </div>
          <div className="p-3 bg-[#E5F0FA] text-[#3B82F6] rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Executive / Senior</span>
            <span className="text-2xl font-black text-[#3B82F6] mt-1 block">
              {designations.filter(d => d.level.includes('L4') || d.level.includes('L5')).length}
            </span>
          </div>
          <div className="p-3 bg-[#E5F0FA] text-[#3B82F6] rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Positions</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {designations.filter(d => d.status === 'Active').length}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search designation title or department..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
          >
            <option value="All">All Departments</option>
            <option value="Architecture & Design">Architecture & Design</option>
            <option value="Structural Engineering">Structural Engineering</option>
            <option value="Project Management">Project Management</option>
            <option value="Site Operations & Supervision">Site Operations</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Accounts & Finance">Accounts & Finance</option>
          </select>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">DESIGNATION TITLE</th>
                <th className="py-3.5 px-4">DEPARTMENT</th>
                <th className="py-3.5 px-4">LEVEL</th>
                <th className="py-3.5 px-4">EMPLOYEES</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDes.length > 0 ? (
                filteredDes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#E5F0FA] text-[#3B82F6] flex items-center justify-center font-bold shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{item.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {item.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-[#3B82F6]" />
                        {item.employeesCount} staff
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'Active' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedDes(item); setShowViewModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-[#3B82F6] hover:bg-[#E5F0FA] rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-[#3B82F6] hover:bg-[#E5F0FA] rounded-lg transition-colors cursor-pointer"
                          title="Edit Designation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDes(item.id, item.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Designation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No designations found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search criteria or add a new designation.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD / EDIT DESIGNATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {isEditing ? 'Edit Designation' : 'Add New Designation'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Designation Title <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Lead Interior Architect"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-white font-semibold"
                >
                  <option value="Architecture & Design">Architecture & Design</option>
                  <option value="Structural Engineering">Structural Engineering</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Site Operations & Supervision">Site Operations & Supervision</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Job Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-white font-semibold"
                >
                  <option value="L1 - Entry">L1 - Entry Level</option>
                  <option value="L2 - Associate">L2 - Associate</option>
                  <option value="L3 - Mid">L3 - Mid Level</option>
                  <option value="L4 - Senior">L4 - Senior / Lead</option>
                  <option value="L5 - Executive">L5 - Executive / Principal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-white font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Role duties and qualifications..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-slate-50/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Create Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. VIEW DETAILS MODAL */}
      {showViewModal && selectedDes && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#E5F0FA] text-[#3B82F6] rounded-xl font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedDes.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{selectedDes.id}</span>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Department</span>
                <p className="font-bold text-slate-800">{selectedDes.department}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Job Level</span>
                  <p className="font-bold text-[#3B82F6]">{selectedDes.level}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Employees</span>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedDes.employeesCount}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Role Description</span>
                <p className="text-slate-600 leading-relaxed">{selectedDes.description}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
