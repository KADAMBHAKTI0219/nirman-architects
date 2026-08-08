import React, { useState, useEffect } from 'react';
import { 
  Building, Smartphone, Mail, MapPin, Layers, FileText, CheckCircle2, 
  AlertCircle, MessageSquare, Plus, Download, Key, ShieldCheck, Eye, EyeOff, 
  Trash2, Edit, Save, RefreshCw, UserCheck, Lock, ChevronRight, User, Ban, X
} from 'lucide-react';
import { 
  updateClient, 
  getClientContacts, 
  addClientContact, 
  updateContactPermission, 
  deactivateContact, 
  resetTempPassword,
  getLinksByClient,
  createClientProjectLink,
  toggleProjectLinkVisibility,
  unlinkProject
} from '../../../service/crm/client';
import { getProjects } from '../../../service/project';

export default function CRMClientProfile({
  client,
  onUpdateClientNotes,
  onRefresh,
  onClose
}) {
  const [activeSubTab, setActiveSubTab] = useState('contacts'); // contacts, projects, details, drawings, notes
  
  // Contacts State
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactForm, setNewContactForm] = useState({ name: '', email: '', phone: '', permissionLevel: 'MEMBER' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');
  const [tempPasswordResult, setTempPasswordResult] = useState(null);

  // Projects Linkage State
  const [linkedProjects, setLinkedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ projectId: '', projectName: '', visibleToClient: true });
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [loadingAllProjects, setLoadingAllProjects] = useState(false);

  // Account Edit State
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', companyName: '', phone: '', email: '', billingAddress: '', siteAddresses: '' });
  const [accountSubmitting, setAccountSubmitting] = useState(false);

  // Internal Notes State
  const [internalNote, setInternalNote] = useState('');
  const [showTempPassProfile, setShowTempPassProfile] = useState(false);

  const clientId = client ? (client._id || client.id) : null;

  useEffect(() => {
    if (clientId) {
      fetchClientContacts();
      fetchLinkedProjects();
      fetchAvailableProjects();
      setAccountForm({
        name: client.name || '',
        companyName: client.companyName || client.company || '',
        phone: client.phone || '',
        email: client.email || '',
        billingAddress: client.billingAddress || client.address || '',
        siteAddresses: Array.isArray(client.siteAddresses) ? client.siteAddresses.join('\n') : (client.siteAddresses || '')
      });
    }
  }, [clientId]);

  const fetchAvailableProjects = async () => {
    setLoadingAllProjects(true);
    try {
      const res = await getProjects();
      if (res && res.success && Array.isArray(res.projects)) {
        setAllProjects(res.projects);
        if (res.projects.length > 0) {
          const first = res.projects[0];
          setLinkForm(prev => ({
            ...prev,
            projectId: first._id || first.id,
            projectName: first.name || first.projectName || 'Project'
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch available projects:", err);
    } finally {
      setLoadingAllProjects(false);
    }
  };

  const fetchClientContacts = async () => {
    if (!clientId) return;
    setContactsLoading(true);
    try {
      const res = await getClientContacts(clientId);
      if (res?.success) {
        setContacts(res.contacts || []);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setContactsLoading(false);
    }
  };

  const fetchLinkedProjects = async () => {
    if (!clientId) return;
    setProjectsLoading(true);
    try {
      const res = await getLinksByClient(clientId);
      if (res?.success) {
        setLinkedProjects(res.links || []);
      }
    } catch (err) {
      console.error("Error fetching linked projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  // 1. Account Details Submit
  const handleAccountUpdateSubmit = async (e) => {
    e.preventDefault();
    setAccountSubmitting(true);
    try {
      const res = await updateClient(clientId, {
        name: accountForm.name,
        companyName: accountForm.companyName,
        phone: accountForm.phone,
        email: accountForm.email,
        billingAddress: accountForm.billingAddress,
        siteAddresses: accountForm.siteAddresses.split('\n').filter(Boolean)
      });
      if (res?.success) {
        alert(res.message);
        setIsEditingAccount(false);
        if (onRefresh) onRefresh();
      } else {
        alert(res?.message || 'Failed to update client profile.');
      }
    } catch (err) {
      alert(err.message || 'Error updating client profile.');
    } finally {
      setAccountSubmitting(false);
    }
  };

  // 2. Add Contact Submit
  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    if (!newContactForm.name.trim() || !newContactForm.email.trim()) {
      setContactError('Contact name and email are required.');
      return;
    }

    setContactSubmitting(true);
    try {
      const res = await addClientContact(clientId, newContactForm);
      if (res?.success) {
        setTempPasswordResult({
          contactName: res.contact?.name || newContactForm.name,
          email: res.contact?.email || newContactForm.email,
          tempPassword: res.contact?.temporaryPassword || 'N/A'
        });
        setShowAddContactModal(false);
        setNewContactForm({ name: '', email: '', phone: '', permissionLevel: 'MEMBER' });
        fetchClientContacts();
      } else {
        setContactError(res?.message || 'Failed to add contact.');
      }
    } catch (err) {
      setContactError(err.message || 'Error adding contact.');
    } finally {
      setContactSubmitting(false);
    }
  };

  // 3. Permission Update
  const handlePermissionChange = async (contactId, newLevel) => {
    try {
      const res = await updateContactPermission(clientId, contactId, newLevel);
      if (res?.success) {
        alert(res.message);
        fetchClientContacts();
      } else {
        alert(res?.message || 'Failed to update permission level.');
      }
    } catch (err) {
      alert(err.message || 'Error updating permission.');
    }
  };

  // 4. Contact Deactivate
  const handleDeactivateContact = async (contactId, contactName) => {
    if (!window.confirm(`Deactivate ClientContact "${contactName}"?`)) return;
    try {
      const res = await deactivateContact(clientId, contactId);
      if (res?.success) {
        alert(res.message);
        fetchClientContacts();
      } else {
        alert(res?.message || 'Failed to deactivate contact.');
      }
    } catch (err) {
      alert(err.message || 'Error deactivating contact.');
    }
  };

  // 5. Admin Temp Password Reset
  const handleResetTempPassword = async (contactId, contactEmail) => {
    if (!window.confirm(`Regenerate temporary password for contact "${contactEmail}"?`)) return;
    try {
      const res = await resetTempPassword(clientId, contactId);
      if (res?.success) {
        setTempPasswordResult({
          contactName: contactEmail,
          email: res.email,
          tempPassword: res.temporaryPassword
        });
      } else {
        alert(res?.message || 'Failed to reset temp password.');
      }
    } catch (err) {
      alert(err.message || 'Error resetting temp password.');
    }
  };

  // 6. Project Link Submit
  const handleCreateLinkSubmit = async (e) => {
    e.preventDefault();
    setLinkSubmitting(true);
    try {
      const res = await createClientProjectLink({
        clientId,
        projectId: linkForm.projectId,
        projectName: linkForm.projectName,
        visibleToClient: linkForm.visibleToClient
      });
      if (res?.success) {
        alert(res.message);
        setShowLinkModal(false);
        fetchLinkedProjects();
      } else {
        alert(res?.message || 'Failed to link project.');
      }
    } catch (err) {
      alert(err.message || 'Error linking project.');
    } finally {
      setLinkSubmitting(false);
    }
  };

  // 7. Toggle Link Visibility
  const handleToggleVisibility = async (linkId, currentVis) => {
    try {
      const res = await toggleProjectLinkVisibility(linkId, !currentVis);
      if (res?.success) {
        fetchLinkedProjects();
      } else {
        alert(res?.message || 'Failed to toggle visibility.');
      }
    } catch (err) {
      alert(err.message || 'Error toggling visibility.');
    }
  };

  // 8. Unlink Project
  const handleUnlinkProject = async (linkId, projName) => {
    const notes = await window.prompt(`Unlink project "${projName}" from Client account?\nEnter audit reason/notes:`, "", "Unlink Project Audit");
    if (notes === null) return;
    try {
      const res = await unlinkProject(linkId, notes);
      if (res?.success) {
        alert(res.message);
        fetchLinkedProjects();
      } else {
        alert(res?.message || 'Failed to unlink project.');
      }
    } catch (err) {
      alert(err.message || 'Error unlinking project.');
    }
  };

  // Note Submit
  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    if (onUpdateClientNotes) onUpdateClientNotes(clientId, internalNote);
    setInternalNote('');
    alert("Internal CRM notes saved!");
  };

  if (!client) return null;

  const initials = (client.name || 'C').split(' ').map(n=>n[0]).join('').slice(0, 2);

  const subTabs = [
    { id: 'contacts', label: `Multi-User Contacts (${contacts.length})` },
    { id: 'projects', label: `Linked Projects (${linkedProjects.length})` },
    { id: 'details', label: 'Account Profile Details' },
    { id: 'drawings', label: 'Shared Files' },
    { id: 'notes', label: 'Internal Notes' }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xl space-y-6 font-sans max-w-4xl w-full mx-auto animate-in fade-in duration-200">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-base shadow-xs">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{client.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                client.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {client.isActive !== false ? 'Active Account' : 'Deactivated Account'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" /> {client.companyName || client.company || 'Private Client'}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Close Profile Modal"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 2. Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Company Phone</span>
          <span className="font-extrabold text-slate-900 font-mono text-xs truncate block mt-0.5">{client.phone}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Company Email</span>
          <span className="font-extrabold text-slate-900 text-xs truncate block mt-0.5">{client.email || 'N/A'}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Billing Address</span>
          <span className="font-bold text-slate-700 text-xs truncate block mt-0.5">{client.billingAddress || client.address || 'N/A'}</span>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2 pb-1">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 border cursor-pointer ${
              activeSubTab === t.id
                ? 'bg-brand-primary border-brand-primary text-brand-dark shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4. Tab Content Body */}
      <div className="min-h-[280px] max-h-[440px] overflow-y-auto pr-1 space-y-4 text-xs font-medium">
        
        {/* PANEL 1: CLIENT CONTACTS (CRM MODULE 2) */}
        {activeSubTab === 'contacts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Multi-User Client Contacts ({contacts.length})
              </span>
              <button
                onClick={() => { setContactError(''); setShowAddContactModal(true); }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" /> Add Contact
              </button>
            </div>

            {contactsLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading client contacts...</span>
              </div>
            ) : contacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map(ct => {
                  const isAct = ct.isActive !== false;

                  return (
                    <div key={ct._id || ct.id} className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900 font-extrabold text-sm">{ct.name}</strong>
                            {ct.isPrimaryContact && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono block mt-1">{ct.email}</span>
                          {ct.phone && <span className="text-xs text-slate-400 font-mono block">{ct.phone}</span>}
                        </div>

                        {/* Permission Level Selector */}
                        <div className="flex flex-col items-end gap-1.5">
                          <select
                            value={ct.permissionLevel || 'MEMBER'}
                            onChange={(e) => handlePermissionChange(ct._id || ct.id, e.target.value)}
                            className="px-2.5 py-1 text-xs font-black rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="VIEW_ONLY">VIEW_ONLY</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleResetTempPassword(ct._id || ct.id, ct.email)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-all"
                              title="Regenerate Temporary Password (Admin Helper)"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            {isAct && !ct.isPrimaryContact && (
                              <button
                                onClick={() => handleDeactivateContact(ct._id || ct.id, ct.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Deactivate Contact"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No contacts registered for this client account.
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: LINKED PROJECTS (CRM MODULE 3) */}
        {activeSubTab === 'projects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Linked Client Projects ({linkedProjects.length})
              </span>
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-brand-dark" /> Link Project
              </button>
            </div>

            {projectsLoading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading linked projects...</span>
              </div>
            ) : linkedProjects.length > 0 ? (
              <div className="space-y-2.5">
                {linkedProjects.map(link => {
                  const projName = link.projectId?.name || link.projectName || 'Architectural Project';
                  const isVis = link.visibleToClient !== false;

                  return (
                    <div key={link._id || link.id} className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-slate-900 font-extrabold text-sm block">{projName}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">Linked on {new Date(link.linkedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleVisibility(link._id || link.id, isVis)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer border ${
                            isVis ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                          title="Toggle Client Portal Visibility"
                        >
                          {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                          {isVis ? 'Visible in Portal' : 'Hidden from Client'}
                        </button>

                        <button
                          onClick={() => handleUnlinkProject(link._id || link.id, projName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Unlink Project (Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No active projects linked to this client.
              </div>
            )}
          </div>
        )}

        {/* PANEL 3: ACCOUNT PROFILE EDIT */}
        {activeSubTab === 'details' && (
          <form onSubmit={handleAccountUpdateSubmit} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-extrabold text-slate-900 text-sm">Account Master Details</span>
              {!isEditingAccount ? (
                <button
                  type="button"
                  onClick={() => setIsEditingAccount(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Account Fields
                </button>
              ) : (
                <span className="text-xs font-black text-indigo-600 uppercase">Editing Mode...</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Account / Family Name</label>
                <input
                  type="text"
                  value={accountForm.name}
                  disabled={!isEditingAccount}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs disabled:bg-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={accountForm.companyName}
                  disabled={!isEditingAccount}
                  onChange={(e) => setAccountForm({ ...accountForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs disabled:bg-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Company Phone (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={accountForm.phone}
                  disabled={!isEditingAccount}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs disabled:bg-slate-100 font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Company Email</label>
                <input
                  type="email"
                  value={accountForm.email}
                  disabled={!isEditingAccount}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs disabled:bg-slate-100 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold text-xs mb-1">Billing Address</label>
                <textarea
                  rows="2"
                  value={accountForm.billingAddress}
                  disabled={!isEditingAccount}
                  onChange={(e) => setAccountForm({ ...accountForm, billingAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs disabled:bg-slate-100 font-semibold"
                />
              </div>
            </div>

            {isEditingAccount && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditingAccount(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accountSubmitting}
                  className="px-5 py-2 bg-brand-primary text-brand-dark font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Save className="w-4 h-4 text-brand-dark" /> Save Changes
                </button>
              </div>
            )}
          </form>
        )}

        {/* PANEL 4: SHARED FILES */}
        {activeSubTab === 'drawings' && (
          <div className="space-y-2.5">
            {(client.sharedFiles || []).length > 0 ? (
              (client.sharedFiles || []).map((file, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <span className="font-bold text-slate-800 block truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-450 block uppercase">{file.type} &bull; {file.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading shared file: ${file.name}`)}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-all flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No shared files available.
              </div>
            )}
          </div>
        )}

        {/* PANEL 5: INTERNAL NOTES */}
        {activeSubTab === 'notes' && (
          <form onSubmit={handleNoteSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-black text-slate-400 uppercase block">Internal Communication Notes</span>
            {client.internalNotes && (
              <p className="text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-xl italic leading-relaxed">
                "{client.internalNotes}"
              </p>
            )}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add internal CRM comment..." 
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-brand-primary text-brand-dark rounded-xl text-xs font-black shadow-2xs"
              >
                Post Note
              </button>
            </div>
          </form>
        )}

      </div>

      {/* MODAL: ADD CLIENT CONTACT */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-sm">Add Additional Client Contact</h4>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            {contactError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{contactError}</span>
              </div>
            )}

            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={newContactForm.name}
                  onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Login Email Address *</label>
                <input
                  type="email"
                  placeholder="sarah@company.com"
                  value={newContactForm.email}
                  onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={newContactForm.phone}
                  onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Permission Level *</label>
                <select
                  value={newContactForm.permissionLevel}
                  onChange={(e) => setNewContactForm({ ...newContactForm, permissionLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-slate-800"
                >
                  <option value="MEMBER">MEMBER (Standard Client Portal Access)</option>
                  <option value="OWNER">OWNER (Full Client Account Management)</option>
                  <option value="VIEW_ONLY">VIEW_ONLY (Read-Only Drawings & Approvals)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-2xs flex items-center gap-1"
                >
                  {contactSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Create Contact & Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK PROJECT */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-900 text-sm">Link Project to Client Account</h4>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={handleCreateLinkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Project to Link *</label>
                {loadingAllProjects ? (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs flex items-center gap-2 font-normal">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Loading available projects from database...</span>
                  </div>
                ) : allProjects.length > 0 ? (
                  <select
                    value={linkForm.projectId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = allProjects.find(p => (p._id || p.id) === selectedId);
                      setLinkForm({
                        ...linkForm,
                        projectId: selectedId,
                        projectName: found ? (found.name || found.projectName || 'Project') : 'Project'
                      });
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/30 bg-white font-semibold text-slate-900 cursor-pointer"
                    required
                  >
                    {allProjects.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.code ? `${p.code} - ` : ''}{p.name || p.projectName || 'Project'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-400 text-xs py-2 font-normal">No active projects found in database. Create a project first.</p>
                )}
              </div>

              {linkForm.projectId && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Selected Project Details</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-900">{linkForm.projectName}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{linkForm.projectId}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="visibleToClient"
                  checked={linkForm.visibleToClient}
                  onChange={(e) => setLinkForm({ ...linkForm, visibleToClient: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="visibleToClient" className="text-slate-700 font-bold cursor-pointer">
                  Visible to Client Portal Users
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowLinkModal(false)} className="px-3.5 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={linkSubmitting} className="px-4 py-2 bg-brand-primary text-brand-dark font-extrabold rounded-xl shadow-2xs">
                  {linkSubmitting ? 'Linking...' : 'Link Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEMP PASSWORD DISPLAY */}
      {tempPasswordResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="font-extrabold text-slate-900 text-sm">Credentials Generated</h4>
            <p className="text-xs text-slate-500">Contact: <strong>{tempPasswordResult.contactName}</strong></p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase font-sans">
                <span>Temporary Password:</span>
                <button 
                  onClick={() => setShowTempPassProfile(!showTempPassProfile)} 
                  className="text-slate-500 hover:text-indigo-600 font-sans text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {showTempPassProfile ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showTempPassProfile ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="px-2.5 py-1.5 bg-indigo-50 text-indigo-900 font-black rounded-lg border border-indigo-200 text-center tracking-wider text-xs">
                {showTempPassProfile ? tempPasswordResult.tempPassword : '••••••••••••'}
              </div>
            </div>

            <button
              onClick={() => setTempPasswordResult(null)}
              className="w-full py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
