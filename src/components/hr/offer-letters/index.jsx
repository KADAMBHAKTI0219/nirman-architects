import React, { useState, useEffect, useMemo } from 'react';
import { getUsersList } from '../../../service/auth';
import {
  getOfferLetterMetadata,
  downloadOfferLetterPDF,
  regenerateOfferLetter
} from '../../../service/hrm/offerLetter';

import OfferLetterHeader from './OfferLetterHeader';
import OfferLetterTable from './OfferLetterTable';
import OfferLetterForm from './OfferLetterForm';
import OfferLetterDetailsDrawer from './OfferLetterDetailsDrawer';
import { Search, Users, FileCheck, Sparkles, X } from 'lucide-react';

export default function HROfferLetters() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formUserId, setFormUserId] = useState('');
  const [formInitialEmployee, setFormInitialEmployee] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [downloadingUserId, setDownloadingUserId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getUsersList();
      let usersArr = [];
      if (res && res.success && Array.isArray(res.users)) {
        usersArr = res.users;
      } else if (Array.isArray(res)) {
        usersArr = res;
      }

      // Fetch metadata for each user to get latest offer letter state
      const enriched = await Promise.all(
        usersArr.map(async (u) => {
          try {
            const metaRes = await getOfferLetterMetadata(u._id || u.id);
            const latest = metaRes?.latest || metaRes?.data?.latest || null;
            return {
              ...u,
              _id: u._id || u.id,
              latest
            };
          } catch (e) {
            return {
              ...u,
              _id: u._id || u.id,
              latest: null
            };
          }
        })
      );

      setEmployees(enriched);
    } catch (err) {
      console.error("Error loading offer letters directory:", err);
      showToast("Error loading employee offer letters.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Offer Letter Generation / Regeneration
  const handleRegenerate = async (userId, payload) => {
    try {
      setIsSubmittingForm(true);
      showToast("Generating offer letter version...");
      await regenerateOfferLetter(userId, payload);
      showToast("Offer letter generated successfully!");
      setFormOpen(false);
      await loadData();
    } catch (err) {
      console.error("Regenerate offer letter error:", err);
      showToast(err.message || "Failed to generate offer letter.", "error");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Handle PDF Download
  const handleDownloadPDF = async (userId, employeeName) => {
    try {
      setDownloadingUserId(userId);
      showToast(`Preparing offer letter PDF for ${employeeName}...`);
      await downloadOfferLetterPDF(userId, employeeName);
      showToast("Offer letter PDF downloaded successfully!");
    } catch (err) {
      console.error("Download offer letter PDF error:", err);
      showToast(err.message || "Failed to download offer letter PDF.", "error");
    } finally {
      setDownloadingUserId(null);
    }
  };

  const openFormForUser = (userObj) => {
    setFormUserId(userObj ? userObj._id : '');
    setFormInitialEmployee(userObj || null);
    setFormOpen(true);
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter((e) => {
      const nameMatch = e.name?.toLowerCase().includes(q);
      const emailMatch = e.email?.toLowerCase().includes(q);
      const deptMatch = e.department?.toLowerCase().includes(q);
      const desigMatch = e.designation?.toLowerCase().includes(q);
      return nameMatch || emailMatch || deptMatch || desigMatch;
    });
  }, [employees, searchQuery]);

  const totalEmployees = employees.length;
  const generatedCount = employees.filter(e => e.latest && e.latest._id).length;

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <OfferLetterHeader onOpenGenerateModal={() => openFormForUser(null)} />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <strong className="text-xl font-black text-slate-900 block">{totalEmployees}</strong>
          <span className="text-[10px] font-semibold text-slate-400 block">Employees in directory</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Generated Letters</span>
            <FileCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <strong className="text-xl font-black text-emerald-600 block">{generatedCount}</strong>
          <span className="text-[10px] font-semibold text-slate-400 block">Active offer letters</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Latest Version</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <strong className="text-xl font-black text-blue-600 block">{generatedCount} Records</strong>
          <span className="text-[10px] font-semibold text-slate-400 block">Up-to-date metadata</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, designation, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <OfferLetterTable
        items={filteredEmployees}
        loading={loading}
        onSelectUser={(emp) => {
          setSelectedUser(emp);
          setDrawerOpen(true);
        }}
        onDownloadPDF={handleDownloadPDF}
        onOpenGenerateForUser={openFormForUser}
        downloadingUserId={downloadingUserId}
      />

      {/* Details Drawer */}
      <OfferLetterDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employee={selectedUser}
        onDownloadPDF={handleDownloadPDF}
        onOpenGenerateForUser={(emp) => {
          setDrawerOpen(false);
          openFormForUser(emp);
        }}
        isDownloadingPDF={downloadingUserId === selectedUser?._id}
      />

      {/* Form Modal */}
      <OfferLetterForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialUserId={formUserId}
        initialEmployee={formInitialEmployee}
        onSubmit={handleRegenerate}
        isSubmitting={isSubmittingForm}
      />

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold z-50 flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
          toast.type === 'success' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-rose-900 border-rose-800 text-rose-100'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
