import React, { useState } from 'react';
import { 
  Search, Eye, EyeOff, Plus, Building, Smartphone, Mail, MapPin, User, 
  ShieldCheck, AlertCircle, X, Key, CheckCircle, Ban, RefreshCw 
} from 'lucide-react';
import { createClient, deactivateClient } from '../../../service/client';
import CRMClientProfile from './CRMClientProfile';

export default function CRMClientList({
  clients = [],
  loading = false,
  selectedClient,
  onSelectClient,
  onRefreshClients,
  onUpdateClientNotes
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [tempPasswordResult, setTempPasswordResult] = useState(null);

  // Inspect Profile Modal State
  const [inspectingClient, setInspectingClient] = useState(null);

  // Form State for New Client & Primary OWNER Contact
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    billingAddress: '',
    siteAddress: ''
  });
  const [showTempPass, setShowTempPass] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'primaryContactPhone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClientSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.primaryContactName.trim() || !formData.primaryContactEmail.trim()) {
      setModalError('Client name, phone, primary contact name, and primary contact email are required.');
      return;
    }

    if (formData.phone.trim().length !== 10) {
      setModalError('Company Phone number must be exactly 10 digits.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createClient({
        name: formData.name.trim(),
        companyName: formData.companyName.trim() || null,
        phone: formData.phone.trim(),
        email: formData.email.trim() || formData.primaryContactEmail.trim(),
        billingAddress: formData.billingAddress.trim() || null,
        siteAddresses: formData.siteAddress.trim() ? [formData.siteAddress.trim()] : [],
        primaryContactName: formData.primaryContactName.trim(),
        primaryContactEmail: formData.primaryContactEmail.trim(),
        primaryContactPhone: formData.primaryContactPhone.trim() || formData.phone.trim()
      });

      if (res?.success) {
        setTempPasswordResult({
          clientName: res.client?.name || formData.name,
          primaryContactEmail: res.primaryContact?.email || formData.primaryContactEmail,
          tempPassword: res.primaryContact?.temporaryPassword || 'N/A'
        });
        setShowAddModal(false);
        setFormData({
          name: '',
          companyName: '',
          phone: '',
          email: '',
          primaryContactName: '',
          primaryContactEmail: '',
          primaryContactPhone: '',
          billingAddress: '',
          siteAddress: ''
        });
        if (onRefreshClients) onRefreshClients();
      } else {
        setModalError(res?.message || 'Failed to create client.');
      }
    } catch (err) {
      setModalError(err.message || 'Error submitting client data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateClient = async (e, clientId, clientName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to deactivate Client "${clientName}"?`)) return;

    try {
      const res = await deactivateClient(clientId);
      if (res?.success) {
        alert(res.message);
        if (onRefreshClients) onRefreshClients();
      } else {
        if (window.confirm(`${res?.message}\n\nDo you want to force deactivate this client account?`)) {
          const forceRes = await deactivateClient(clientId, true);
          if (forceRes?.success) {
            alert(forceRes.message);
            if (onRefreshClients) onRefreshClients();
          } else {
            alert(forceRes?.message || 'Failed to deactivate.');
          }
        }
      }
    } catch (err) {
      alert(err.message || 'Error deactivating client.');
    }
  };

  const handleViewDetails = (e, clientDoc) => {
    e.stopPropagation();
    setInspectingClient(clientDoc);
    if (onSelectClient) onSelectClient(clientDoc);
  };

  const filteredClients = clients.filter(c => {
    const nameStr = (c.name || '').toLowerCase();
    const compStr = (c.companyName || c.company || '').toLowerCase();
    const phoneStr = (c.phone || '').toLowerCase();
    const emailStr = (c.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = nameStr.includes(q) || compStr.includes(q) || phoneStr.includes(q) || emailStr.includes(q);
    const isAct = c.isActive !== false;
    const matchesStatus = filterStatus === 'All' || (filterStatus === 'Active' ? isAct : !isAct);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 w-full">
      
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Client Directory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage Client Accounts, Multi-User Contacts, Linked Projects & Portal Authentication
          </p>
        </div>

        <button
          onClick={() => { setModalError(''); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-brand-dark" />
          Create New Client Account
        </button>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-3 items-center justify-between w-full">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by client name, company, phone, email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white font-bold"
          >
            <option value="All">All Client Accounts</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Deactivated Accounts</option>
          </select>

          <button
            onClick={onRefreshClients}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
            title="Refresh Client List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Client Directory Table (FULL WIDTH) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="px-5 py-4">Client & Company</th>
                <th className="px-5 py-4">Account Contact</th>
                <th className="px-5 py-4">Primary OWNER Contact</th>
                <th className="px-5 py-4 text-center">Active Projects</th>
                <th className="px-5 py-4">Account Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    <span>Loading clients directory...</span>
                  </td>
                </tr>
              ) : filteredClients.length > 0 ? (
                filteredClients.map(c => {
                  const isSelected = inspectingClient && (inspectingClient._id || inspectingClient.id) === (c._id || c.id);
                  const isAct = c.isActive !== false;
                  const primary = c.primaryContact;
                  const projCount = c.activeProjectCount !== undefined ? c.activeProjectCount : (c.projects?.length || 0);

                  return (
                    <tr 
                      key={c._id || c.id} 
                      onClick={(e) => handleViewDetails(e, c)}
                      className={`hover:bg-slate-50/90 cursor-pointer transition-all ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      {/* Client & Company */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center flex-shrink-0 border border-indigo-200 shadow-2xs">
                            {(c.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-slate-900 font-extrabold text-xs block truncate">{c.name}</strong>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium truncate mt-0.5">
                              <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              {c.companyName || c.company || 'Private Client'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Account Contact */}
                      <td className="px-5 py-4 text-slate-600">
                        <div className="space-y-0.5 font-mono text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-slate-500 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Primary Contact */}
                      <td className="px-5 py-4">
                        {primary ? (
                          <div className="min-w-0 space-y-0.5">
                            <span className="font-extrabold text-slate-900 block text-xs truncate flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                              {primary.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block truncate">
                              {primary.email}
                            </span>
                            <span className="inline-block px-2 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              OWNER
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No contact linked</span>
                        )}
                      </td>

                      {/* Active Projects Count (Clean Single Line Badge) */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-black border border-slate-200 shadow-3xs">
                          {projCount} Projects
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                          isAct ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isAct ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleViewDetails(e, c)}
                            className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all border border-slate-200"
                            title="View Full Client Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAct && (
                            <button
                              onClick={(e) => handleDeactivateClient(e, c._id || c.id, c.name)}
                              className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-200"
                              title="Soft-Deactivate Client Account"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No client accounts match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. INSPECT DETAILS MODAL (VIEW DETAILS POPUP) */}
      {inspectingClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CRMClientProfile
              client={inspectingClient}
              onClose={() => setInspectingClient(null)}
              onUpdateClientNotes={onUpdateClientNotes}
              onRefresh={() => {
                if (onRefreshClients) onRefreshClients();
              }}
            />
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE CLIENT & PRIMARY OWNER CONTACT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Create Client Account</h3>
                <p className="text-xs text-slate-500">
                  Directly register Client Company & Primary OWNER Contact (Auto-generates temporary password)
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClientSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Account Details Header */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
                  1. Client Account Master Details
                </span>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company / Account Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Wayne Enterprises or Mr. Bruce Wayne"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Legal Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="e.g. Wayne Enterprises Ltd."
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company Phone * (10 Digits)</label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. info@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Primary Contact Header */}
              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 space-y-3">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">
                  2. Primary Contact Person (Assigned OWNER Permission)
                </span>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Contact Full Name *</label>
                  <input
                    type="text"
                    name="primaryContactName"
                    placeholder="e.g. Bruce Wayne"
                    value={formData.primaryContactName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Portal Login Email *</label>
                    <input
                      type="email"
                      name="primaryContactEmail"
                      placeholder="bruce@waynecorp.com"
                      value={formData.primaryContactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Phone (10 Digits)</label>
                    <input
                      type="tel"
                      name="primaryContactPhone"
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.primaryContactPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Billing Address</label>
                  <textarea
                    name="billingAddress"
                    rows="2"
                    placeholder="HQ registered address"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Site Address</label>
                  <textarea
                    name="siteAddress"
                    rows="2"
                    placeholder="Project site location"
                    value={formData.siteAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Register Client & Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: TEMPORARY PASSWORD RESULT DISPLAY */}
      {tempPasswordResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Client Registered Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Account created for <strong className="text-slate-800">{tempPasswordResult.clientName}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-left space-y-2 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block font-sans">Login Identifier Email:</span>
                <span className="font-extrabold text-slate-900">{tempPasswordResult.primaryContactEmail}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block font-sans flex items-center justify-between">
                  <span className="flex items-center gap-1"><Key className="w-3 h-3 text-indigo-600" /> Temporary Generated Password:</span>
                  <button 
                    onClick={() => setShowTempPass(!showTempPass)} 
                    className="text-slate-500 hover:text-indigo-600 font-sans text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showTempPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showTempPass ? 'Hide' : 'Show'}</span>
                  </button>
                </span>
                <div className="px-3 py-2.5 bg-indigo-50 text-indigo-900 font-black rounded-xl border border-indigo-200 mt-1 text-sm text-center tracking-widest selection:bg-indigo-200 relative">
                  {showTempPass ? tempPasswordResult.tempPassword : '••••••••••••'}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
              Please share these temporary credentials with the Client contact. They will be prompted to change their password on first login.
            </p>

            <button
              onClick={() => setTempPasswordResult(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs"
            >
              Done / Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
