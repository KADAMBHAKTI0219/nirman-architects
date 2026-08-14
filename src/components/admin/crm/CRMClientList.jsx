import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Eye, EyeOff, Plus, Building, Smartphone, Mail, MapPin, User, 
  ShieldCheck, AlertCircle, X, Key, CheckCircle, Ban, RefreshCw, FolderPlus,
  LayoutGrid, List
} from 'lucide-react';
import { createClient, deactivateClient, createClientProjectLink } from '../../../service/crm/client';
import { createProject } from '../../../service/project';
import CRMClientProfile from './CRMClientProfile';
import CreateProjectModal from '../projects/CreateProjectModal';
import BrandLoader from '../../common/BrandLoader';
import { PageHeader, SearchFilterBar, StatusBadge } from '../../common';

export default function CRMClientList({
  clients = [],
  loading = false,
  selectedClient,
  onSelectClient,
  onRefreshClients,
  onUpdateClientNotes
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewFormat, setViewFormat] = useState('table'); // 'table' | 'cards'

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [tempPasswordResult, setTempPasswordResult] = useState(null);

  // Inspect Profile Modal State
  const [inspectingClient, setInspectingClient] = useState(null);

  // Create Project Modal States
  const [showCreateProjModal, setShowCreateProjModal] = useState(false);
  const [createProjClientTarget, setCreateProjClientTarget] = useState(null);
  const [newProjectData, setNewProjectData] = useState({
    code: '', name: '', projectName: '', client: '', clientInformation: '', clientEmail: '', clientPhone: '',
    location: '', address: '', category: '', priority: 'Medium', status: 'Planning',
    startDate: '', estCompletion: '', estimatedCompletion: '', budget: '', manager: ''
  });

  const handleOpenCreateProjectForClient = (clientObj) => {
    setCreateProjClientTarget(clientObj);
    const clientName = clientObj.name || '';
    const codeGen = `PRJ-${clientName.substring(0, 3).toUpperCase() || 'CLI'}-${Math.floor(100 + Math.random() * 900)}`;
    const addressVal = (Array.isArray(clientObj.siteAddresses) && clientObj.siteAddresses[0]) || clientObj.billingAddress || '';
    const emailVal = clientObj.email || clientObj.primaryContact?.email || '';
    const phoneVal = clientObj.phone || clientObj.primaryContact?.phone || '';

    setNewProjectData({
      code: codeGen,
      name: '',
      projectName: '',
      client: clientName,
      clientInformation: clientName,
      clientEmail: emailVal,
      clientPhone: phoneVal,
      location: addressVal,
      address: addressVal,
      category: 'Commercial',
      priority: 'Medium',
      status: 'Planning',
      startDate: new Date().toISOString().split('T')[0],
      estCompletion: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      estimatedCompletion: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      budget: '1500000',
      manager: ''
    });
    setShowCreateProjModal(true);
  };

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const projPayload = {
        code: newProjectData.code,
        projectName: newProjectData.name || newProjectData.projectName || "Client Project",
        name: newProjectData.name || newProjectData.projectName || "Client Project",
        clientInformation: newProjectData.client || newProjectData.clientInformation || "",
        clientEmail: newProjectData.clientEmail,
        clientPhone: newProjectData.clientPhone,
        clientId: createProjClientTarget ? (createProjClientTarget._id || createProjClientTarget.id) : null,
        address: newProjectData.location || newProjectData.address || "",
        budget: parseFloat(newProjectData.budget) || 0,
        priority: newProjectData.priority || "Medium",
        projectCategoryId: newProjectData.projectCategoryId || null,
        startDate: newProjectData.startDate || new Date().toISOString().split('T')[0],
        estimatedCompletion: newProjectData.estCompletion || newProjectData.estimatedCompletion || new Date().toISOString().split('T')[0],
        manager: newProjectData.manager || ""
      };

      const res = await createProject(projPayload);
      if (res?.success) {
        const createdProjId = res.project?._id || res.project?.id || res.project;
        if (createProjClientTarget && createdProjId) {
          await createClientProjectLink({
            clientId: createProjClientTarget._id || createProjClientTarget.id,
            projectId: createdProjId,
            projectName: projPayload.projectName,
            visibleToClient: true
          }).catch(() => null);
        }

        alert(`Project '${projPayload.projectName}' created & linked to client '${createProjClientTarget?.name}' successfully!`);
        setShowCreateProjModal(false);
        if (onRefreshClients) onRefreshClients();
      } else {
        alert(res?.message || "Failed to create project");
      }
    } catch (err) {
      alert("Error creating project: " + (err.response?.data?.message || err.message));
    }
  };

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
      <PageHeader
        title="Client Directory"
        subtitle="Manage Client Accounts, Multi-User Contacts, Linked Projects & Portal Authentication"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Format Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewFormat('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewFormat === 'table' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Striped Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewFormat('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewFormat === 'cards' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>

            <button
              onClick={() => { setModalError(''); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-dark" />
              Create New Client Account
            </button>
          </div>
        }
      />

      {/* 2. Search & Filters Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by client name, company, phone, email..."
        filterOptions={[
          { label: 'All Client Accounts', value: 'All' },
          { label: 'Active Accounts', value: 'Active' },
          { label: 'Deactivated Accounts', value: 'Inactive' }
        ]}
        selectedFilter={filterStatus}
        onFilterChange={setFilterStatus}
        onRefresh={onRefreshClients}
        loading={loading}
      />

      {/* 3. Client Directory Content (TABLE STRIPE OR CARDS FORMAT) */}
      {viewFormat === 'table' ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-black uppercase text-[10px] tracking-wider whitespace-nowrap">
                  <th className="px-5 py-4 min-w-[200px]">Client & Company</th>
                  <th className="px-5 py-4 min-w-[170px]">Account Contact</th>
                  <th className="px-5 py-4 min-w-[170px]">Primary OWNER Contact</th>
                  <th className="px-5 py-4 text-center min-w-[180px]">Active Projects</th>
                  <th className="px-5 py-4 min-w-[130px]">Account Status</th>
                  <th className="px-5 py-4 text-right min-w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center">
                      <BrandLoader size="sm" text="Loading Client Directory..." />
                    </td>
                  </tr>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((c, idx) => {
                    const isSelected = inspectingClient && (inspectingClient._id || inspectingClient.id) === (c._id || c.id);
                    const isAct = c.isActive !== false;
                    const primary = c.primaryContact;
                    const projCount = c.activeProjectCount !== undefined ? c.activeProjectCount : (c.projects?.length || 0);

                    return (
                      <tr 
                        key={c._id || c.id} 
                        onClick={(e) => handleViewDetails(e, c)}
                        className={`hover:bg-brand-light cursor-pointer transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                        } ${isSelected ? 'bg-brand-soft' : ''}`}
                      >
                        {/* Client & Company */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary text-slate-900 font-black text-sm flex items-center justify-center flex-shrink-0 border border-brand-secondary/50 shadow-2xs">
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
                              <span>{c.phone || 'No phone'}</span>
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
                                <User className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
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

                        {/* Active Projects Count & List */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-black border border-slate-200 shadow-3xs">
                              {projCount} Projects
                            </span>
                             {c.projects && c.projects.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 justify-center max-w-[220px] mt-1">
                                {c.projects.map((p, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/admin/projects?select=${p.id}&searchName=${encodeURIComponent(p.name)}`);
                                    }}
                                    className="group inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-light hover:bg-brand-primary text-slate-800 hover:text-slate-900 border border-brand-secondary/40 rounded-md text-[10px] font-black cursor-pointer transition-all duration-200 shadow-3xs hover:shadow-xs hover:-translate-y-0.5"
                                    title="Click to view Project Details"
                                  >
                                    <Building className="w-2.5 h-2.5 text-slate-500 group-hover:text-slate-800 transition-colors flex-shrink-0" />
                                    <span>{p.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreateProjectForClient(c);
                              }}
                              className="p-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-xl transition-all border border-brand-secondary/40 shadow-3xs cursor-pointer"
                              title="Create New Project for Client"
                            >
                              <FolderPlus className="w-4 h-4 text-brand-dark" />
                            </button>
                            <button
                              onClick={(e) => handleViewDetails(e, c)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all border border-slate-200 cursor-pointer"
                              title="View Full Client Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAct && (
                              <button
                                onClick={(e) => handleDeactivateClient(e, c._id || c.id, c.name)}
                                className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-200 cursor-pointer"
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
      ) : (
        /* CARDS GRID FORMAT VIEW */
        <div className="w-full">
          {loading ? (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center">
              <BrandLoader size="sm" text="Loading Client Cards..." />
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClients.map(c => {
                const isAct = c.isActive !== false;
                const primary = c.primaryContact;
                const projCount = c.activeProjectCount !== undefined ? c.activeProjectCount : (c.projects?.length || 0);

                return (
                  <div
                    key={c._id || c.id}
                    onClick={(e) => handleViewDetails(e, c)}
                    className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all space-y-4 font-sans relative cursor-pointer group"
                  >
                    {/* Card Top: Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-brand-primary text-brand-dark font-black text-base flex items-center justify-center flex-shrink-0 border border-brand-secondary/50 shadow-2xs group-hover:bg-brand-secondary transition-colors">
                          {(c.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-slate-900 font-extrabold text-sm truncate group-hover:text-slate-700 transition-colors leading-tight">
                            {c.name}
                          </h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate mt-0.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            {c.companyName || c.company || 'Private Client'}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border shrink-0 ${
                        isAct ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isAct ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Contact Details Box */}
                    <div className="p-3.5 bg-slate-50/90 border border-slate-150 rounded-2xl space-y-2 font-mono text-xs text-slate-700">
                      <div className="flex items-center gap-2 truncate">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.phone || 'No phone'}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 truncate text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                      {primary && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between font-sans">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Owner:</span>
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-600" /> {primary.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Active Projects Pills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Linked Projects</span>
                        <span className="px-2.5 py-0.5 bg-brand-soft text-slate-800 rounded-lg text-[10px] font-black border border-brand-secondary/30">
                          {projCount} Projects
                        </span>
                      </div>

                      {c.projects && c.projects.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-[65px] overflow-y-auto">
                          {c.projects.map((p, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/projects?select=${p.id}&searchName=${encodeURIComponent(p.name)}`);
                              }}
                              className="group/pill inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light hover:bg-brand-primary text-slate-800 hover:text-brand-dark border border-brand-secondary/40 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all shadow-3xs"
                              title="Click to view Project Details"
                            >
                              <Building className="w-3 h-3 text-slate-500 group-hover/pill:text-slate-800 transition-colors" />
                              <span>{p.name}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic block">No active linked projects</span>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateProjectForClient(c);
                        }}
                        className="px-3.5 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-brand-secondary/40 shadow-2xs cursor-pointer"
                      >
                        <FolderPlus className="w-4 h-4 text-brand-dark" />
                        <span>Create Project</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleViewDetails(e, c)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all border border-slate-200 cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAct && (
                          <button
                            onClick={(e) => handleDeactivateClient(e, c._id || c.id, c.name)}
                            className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-200 cursor-pointer"
                            title="Deactivate Account"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No client accounts match your search filters.
            </div>
          )}
        </div>
      )}

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

      {/* 7. MODAL: CREATE PROJECT FOR CLIENT */}
      <CreateProjectModal
        isOpen={showCreateProjModal}
        onClose={() => setShowCreateProjModal(false)}
        onSubmit={handleCreateProjectSubmit}
        newProject={newProjectData}
        setNewProject={setNewProjectData}
      />

    </div>
  );
}
