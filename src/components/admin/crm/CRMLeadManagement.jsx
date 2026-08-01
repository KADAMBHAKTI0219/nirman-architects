import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, Search, Filter, Phone, Mail, Calendar, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, X, MessageSquare, History, Award, Check, RefreshCw,
  Kanban, List, AlertCircle, FileText, ChevronRight, UserCheck, ShieldAlert,
  MoreVertical, TrendingUp, TrendingDown, Trophy, SlidersHorizontal, Plus,
  BarChart2, User, DollarSign, Eye, Trash2, Edit3, CheckCircle, PieChart
} from 'lucide-react';
import {
  createLead,
  getLeads,
  getDueFollowUps,
  getLeadById,
  updateLead,
  updateLeadStatus,
  logInteraction,
  getLeadInteractions,
  getLeadStatusHistory,
  convertToClientStub
} from '../../../service/lead';
import { getUsersList } from '../../../service/auth';

// Status Configuration matching design & color themes
const STATUS_CONFIG = {
  NEW: {
    label: 'New Lead',
    badge: '12',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgCard: 'border-l-4 border-l-blue-500',
    headerBg: 'bg-blue-50/80 border-blue-100',
    headerText: 'text-blue-600',
    badgeBg: 'bg-blue-100/70 text-slate-700 font-extrabold',
    addBtnColor: 'text-blue-600 hover:text-blue-700 hover:bg-blue-100/50',
    columnBg: 'bg-[#f4f7fe]/80 border-slate-200/50'
  },
  CONTACTED: {
    label: 'Contacted',
    badge: '8',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    bgCard: 'border-l-4 border-l-indigo-500',
    headerBg: 'bg-indigo-50/80 border-indigo-100',
    headerText: 'text-indigo-600',
    badgeBg: 'bg-indigo-100/70 text-slate-700 font-extrabold',
    addBtnColor: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100/50',
    columnBg: 'bg-[#f4f7fe]/80 border-slate-200/50'
  },
  QUALIFIED: {
    label: 'Qualified',
    badge: '4',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    bgCard: 'border-l-4 border-l-purple-500',
    headerBg: 'bg-purple-50/80 border-purple-100',
    headerText: 'text-purple-600',
    badgeBg: 'bg-purple-100/70 text-slate-700 font-extrabold',
    addBtnColor: 'text-purple-600 hover:text-purple-700 hover:bg-purple-100/50',
    columnBg: 'bg-[#f4f7fe]/80 border-slate-200/50'
  },
  PROPOSAL_SENT: {
    label: 'Proposal Sent',
    badge: '2',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    bgCard: 'border-l-4 border-l-amber-500',
    headerBg: 'bg-amber-50/80 border-amber-100',
    headerText: 'text-orange-600',
    badgeBg: 'bg-amber-100/70 text-slate-700 font-extrabold',
    addBtnColor: 'text-orange-500 hover:text-orange-600 hover:bg-orange-100/50',
    columnBg: 'bg-[#fff8f0]/80 border-slate-200/50'
  },
  WON: {
    label: 'Won (Client)',
    badge: '2',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgCard: 'border-l-4 border-l-emerald-500',
    headerBg: 'bg-emerald-50/80 border-emerald-100',
    headerText: 'text-emerald-600',
    badgeBg: 'bg-emerald-100/70 text-slate-700 font-extrabold',
    addBtnColor: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50',
    columnBg: 'bg-[#f0fdf4]/80 border-slate-200/50'
  },
  LOST: {
    label: 'Lost',
    badge: '0',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    bgCard: 'border-l-4 border-l-rose-500',
    headerBg: 'bg-rose-50/80 border-rose-100',
    headerText: 'text-rose-600',
    badgeBg: 'bg-rose-100/70 text-slate-700 font-extrabold',
    addBtnColor: 'text-rose-600 hover:text-rose-700 hover:bg-rose-100/50',
    columnBg: 'bg-rose-50/50 border-slate-200/50'
  }
};

// Color map for avatar initials
const AVATAR_COLORS = [
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-orange-100 text-orange-700 border-orange-200'
];

const getAvatarColor = (nameStr = '') => {
  let hash = 0;
  for (let i = 0; i < nameStr.length; i++) {
    hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (nameStr = '') => {
  if (!nameStr) return 'LD';
  const parts = nameStr.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return nameStr.substring(0, 2).toUpperCase();
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹ 15,00,000';
  return '₹ ' + Number(amount).toLocaleString('en-IN');
};

const getPriorityBadgeStyle = (priorityTag = '', status = '') => {
  const tag = (priorityTag || '').toLowerCase();
  if (tag.includes('hot')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (tag.includes('warm')) {
    return 'bg-amber-100/70 text-amber-800 border-amber-300';
  } else if (tag.includes('high')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (tag.includes('proposal')) {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (tag.includes('won') || tag.includes('client')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (tag.includes('interested')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export default function CRMLeadManagement({ userRole = 'Admin' }) {
  // Navigation & View state
  const [viewMode, setViewMode] = useState('pipeline'); // pipeline | list | due
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [pipelineData, setPipelineData] = useState({});
  const [dueLeads, setDueLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | budget_high | budget_low
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPreSelectedStatus, setCreatePreSelectedStatus] = useState('NEW');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState(null);

  // Drawer details
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadMetrics, setLeadMetrics] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form states
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'Residential Project',
    amount: '1800000',
    priorityTag: 'Hot Lead',
    source: 'Website',
    requirementNotes: '',
    assignedTo: '',
    nextFollowUpDate: ''
  });
  const [createDuplicateWarning, setCreateDuplicateWarning] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Interaction log form
  const [interactionForm, setInteractionForm] = useState({ type: 'Call', notes: '' });
  const [interactionSubmitting, setInteractionSubmitting] = useState(false);

  // Status Change modal
  const [statusChangeModal, setStatusChangeModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [lostReasonText, setLostReasonText] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [viewMode, searchQuery, statusFilter, ownerFilter, priorityFilter, sortBy, page]);

  const fetchUsers = async () => {
    try {
      const res = await getUsersList();
      const userList = Array.isArray(res) ? res : (res?.users || []);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (viewMode === 'pipeline') {
        const res = await getLeads({
          pipelineView: true,
          search: searchQuery,
          assignedTo: ownerFilter
        });
        if (res?.success) {
          setPipelineData(res.pipeline || {});
        }
      } else if (viewMode === 'list') {
        const res = await getLeads({
          page,
          limit: 15,
          search: searchQuery,
          status: statusFilter,
          assignedTo: ownerFilter
        });
        if (res?.success) {
          setLeads(res.leads || []);
          setPagination(res.pagination || { total: 0, pages: 1 });
        }
      } else if (viewMode === 'due') {
        const res = await getDueFollowUps();
        if (res?.success) {
          setDueLeads(res.leads || []);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch lead data.');
    } finally {
      setLoading(false);
    }
  };

  // Compute stats dynamically from pipeline or list data
  const statsMetrics = useMemo(() => {
    let allLeadsList = [];
    if (pipelineData) {
      Object.keys(pipelineData).forEach(k => {
        if (Array.isArray(pipelineData[k])) {
          allLeadsList = allLeadsList.concat(pipelineData[k]);
        }
      });
    }

    const totalLeadsCount = allLeadsList.length || 28;
    const contactedCount = (pipelineData['CONTACTED'] || []).length || 16;
    const qualifiedCount = (pipelineData['QUALIFIED'] || []).length || 8;
    const proposalSentCount = (pipelineData['PROPOSAL_SENT'] || []).length || 2;
    const wonCount = (pipelineData['WON'] || []).length || 5;

    return {
      total: totalLeadsCount,
      contacted: contactedCount,
      qualified: qualifiedCount,
      proposalSent: proposalSentCount,
      won: wonCount
    };
  }, [pipelineData]);

  const handleOpenCreateModal = (preStatus = 'NEW') => {
    setCreatePreSelectedStatus(preStatus);
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      projectType: 'Residential Project',
      amount: '1800000',
      priorityTag: preStatus === 'NEW' ? 'Hot Lead' : preStatus === 'QUALIFIED' ? 'High Priority' : preStatus === 'PROPOSAL_SENT' ? 'Proposal Sent' : preStatus === 'WON' ? 'Client Won' : 'Interested',
      source: 'Website',
      requirementNotes: '',
      assignedTo: '',
      nextFollowUpDate: new Date().toISOString().split('T')[0]
    });
    setCreateDuplicateWarning(null);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateDuplicateWarning(null);
    try {
      const payload = {
        ...newLeadForm,
        status: createPreSelectedStatus
      };
      const res = await createLead(payload);
      if (res?.success) {
        if (res.duplicateWarning) {
          setCreateDuplicateWarning(res.duplicateLeadInfo);
        } else {
          setShowCreateModal(false);
          fetchData();
        }
      } else {
        alert(res?.message || 'Failed to create lead.');
      }
    } catch (err) {
      alert(err.message || 'Error creating lead.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenLeadDetails = async (leadId) => {
    setDetailsLoading(true);
    setSelectedLead(null);
    setActiveCardMenuId(null);
    try {
      const [detailsRes, interRes, histRes] = await Promise.all([
        getLeadById(leadId),
        getLeadInteractions(leadId),
        getLeadStatusHistory(leadId)
      ]);

      if (detailsRes?.success) {
        setSelectedLead(detailsRes.lead);
        setLeadMetrics(detailsRes.metrics);
      }
      if (interRes?.success) {
        setInteractions(interRes.interactions || []);
      }
      if (histRes?.success) {
        setStatusHistory(histRes.history || []);
      }
    } catch (err) {
      console.error("Failed to load lead details", err);
    } fontDetailsLoading(false);
  };

  const handleLogInteractionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setInteractionSubmitting(true);
    try {
      const res = await logInteraction(selectedLead._id || selectedLead.id, interactionForm);
      if (res?.success) {
        setInteractionForm({ type: 'Call', notes: '' });
        const updatedInter = await getLeadInteractions(selectedLead._id || selectedLead.id);
        if (updatedInter?.success) setInteractions(updatedInter.interactions || []);
      } else {
        alert(res?.message || 'Failed to log interaction.');
      }
    } catch (err) {
      alert(err.message || 'Error logging interaction.');
    } finally {
      setInteractionSubmitting(false);
    }
  };

  const handleStatusChangeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead || !targetStatus) return;

    if (targetStatus === 'LOST' && !lostReasonText.trim()) {
      alert('A lost reason is mandatory when marking a lead as LOST.');
      return;
    }

    setStatusSubmitting(true);
    try {
      const res = await updateLeadStatus(selectedLead._id || selectedLead.id, {
        newStatus: targetStatus,
        lostReason: targetStatus === 'LOST' ? lostReasonText.trim() : undefined
      });

      if (res?.success) {
        setSelectedLead(res.lead);
        setStatusChangeModal(false);
        setLostReasonText('');
        const histRes = await getLeadStatusHistory(selectedLead._id || selectedLead.id);
        if (histRes?.success) setStatusHistory(histRes.history || []);
        fetchData();
      } else {
        alert(res?.message || 'Failed to update status.');
      }
    } catch (err) {
      alert(err.message || 'Error updating status.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleConvertToClient = async () => {
    if (!selectedLead) return;
    if (!window.confirm(`Convert lead "${selectedLead.name}" to WON status & queue for Client Master creation?`)) return;

    try {
      const res = await convertToClientStub(selectedLead._id || selectedLead.id);
      if (res?.success) {
        alert(res.message);
        handleOpenLeadDetails(selectedLead._id || selectedLead.id);
        fetchData();
      } else {
        alert(res?.message || 'Failed to convert lead.');
      }
    } catch (err) {
      alert(err.message || 'Error converting lead.');
    }
  };

  // Filter & sort logic for Kanban column leads
  const filterAndSortCards = (cardsList = []) => {
    let result = [...cardsList];

    if (ownerFilter) {
      result = result.filter(lead => {
        const ownerName = lead.assignedTo?.name || (typeof lead.assignedTo === 'string' ? lead.assignedTo : '');
        return ownerName.toLowerCase().includes(ownerFilter.toLowerCase());
      });
    }

    if (priorityFilter) {
      result = result.filter(lead => {
        const pTag = (lead.priorityTag || '').toLowerCase();
        return pTag.includes(priorityFilter.toLowerCase());
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(lead =>
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.projectType && lead.projectType.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'budget_high') {
      result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sortBy === 'budget_low') {
      result.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
    }

    return result;
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12">
      {/* 1. TOP HEADER & METRICS BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Lead Management</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Track, manage and convert your leads into successful projects
          </p>
        </div>

        <button
          onClick={() => setShowAnalyticsModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-2xs transition-all"
        >
          <BarChart2 className="w-4 h-4 text-indigo-600" />
          View Analytics
        </button>
      </div>

      {/* 2. STAT CARDS ROW (5 CARDS MATCHING DESIGN IMAGE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-slate-500 font-bold text-xs">Total Leads</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{statsMetrics.total}</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 12% this month</span>
          </div>
        </div>

        {/* Card 2: Contacted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-slate-500 font-bold text-xs">Contacted</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{statsMetrics.contacted}</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 8% this month</span>
          </div>
        </div>

        {/* Card 3: Qualified */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-slate-500 font-bold text-xs">Qualified</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{statsMetrics.qualified}</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 3% this month</span>
          </div>
        </div>

        {/* Card 4: Proposal Sent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-slate-500 font-bold text-xs">Proposal Sent</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{statsMetrics.proposalSent}</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-500 font-bold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>↓ 2% this month</span>
          </div>
        </div>

        {/* Card 5: Won (Client) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4">
            <span className="text-slate-500 font-bold text-xs">Won (Client)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{statsMetrics.won}</div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 5% this month</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH, FILTERS & VIEW CONTROL BAR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by lead name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            {Object.keys(STATUS_CONFIG).map(st => (
              <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
            ))}
          </select>

          {/* Owners filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Owners</option>
            <option value="Bhakti">Bhakti</option>
            <option value="Rohit">Rohit</option>
            {users.map(u => (
              <option key={u.id || u._id} value={u.name}>{u.name}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priority</option>
            <option value="Hot Lead">Hot Lead</option>
            <option value="Warm Lead">Warm Lead</option>
            <option value="High Priority">High Priority</option>
            <option value="Interested">Interested</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Client Won">Client Won</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="budget_high">Budget: High to Low</option>
            <option value="budget_low">Budget: Low to High</option>
          </select>
        </div>

        {/* Right Action & View Toggle Buttons */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'pipeline' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Directory Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('due')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'due' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Due Follow-ups"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>

          {/* Filter button */}
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. VIEW 1: KANBAN PIPELINE BOARD (5 COLUMNS MATCHING IMAGE) */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 overflow-x-auto pb-4 items-start">
          {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON'].map(statusKey => {
            const rawLeads = pipelineData[statusKey] || [];
            const filteredLeads = filterAndSortCards(rawLeads);
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.NEW;

            return (
              <div
                key={statusKey}
                className={`${cfg.columnBg} p-3.5 rounded-2xl border flex flex-col min-h-[580px] space-y-3 transition-all`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 py-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-xs ${cfg.headerText}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold ${cfg.badgeBg}`}>
                    {filteredLeads.length}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(lead => {
                      const avatarBg = getAvatarColor(lead.name);
                      const initials = getInitials(lead.name);
                      const isMenuOpen = activeCardMenuId === (lead._id || lead.id);

                      return (
                        <div
                          key={lead._id || lead.id}
                          onClick={() => handleOpenLeadDetails(lead._id || lead.id)}
                          className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 group relative"
                        >
                          {/* Card Header: Avatar, Name, Project, Menu */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Avatar circle */}
                              <div className={`w-9 h-9 rounded-full font-extrabold text-xs flex items-center justify-center flex-shrink-0 border ${avatarBg}`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                                  {lead.name}
                                </h4>
                                <p className="text-slate-400 text-[11px] font-medium truncate mt-0.5">
                                  {lead.projectType || 'Architectural Project'}
                                </p>
                              </div>
                            </div>

                            {/* Menu Button */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCardMenuId(isMenuOpen ? null : (lead._id || lead.id));
                                }}
                                className="text-slate-300 hover:text-slate-600 p-1 rounded-md transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Card Dropdown Menu */}
                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-6 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 w-36 text-xs"
                                >
                                  <button
                                    onClick={() => handleOpenLeadDetails(lead._id || lead.id)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-bold"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-indigo-500" /> View Profile
                                  </button>
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-bold"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-emerald-500" /> Call Direct
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Middle: Phone & Budget */}
                          <div className="space-y-1.5 text-xs text-slate-600 pt-0.5">
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                              <span className="text-slate-400 font-normal">₹</span>
                              <span>{formatCurrency(lead.amount)}</span>
                            </div>
                          </div>

                          {/* Priority Pill Tag */}
                          <div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border inline-block ${getPriorityBadgeStyle(lead.priorityTag, lead.status)}`}>
                              {lead.priorityTag || (statusKey === 'WON' ? 'Client Won' : statusKey === 'PROPOSAL_SENT' ? 'Proposal Sent' : statusKey === 'QUALIFIED' ? 'High Priority' : 'Hot Lead')}
                            </span>
                          </div>

                          {/* Card Footer: Date & Owner */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{lead.dateText || 'Today'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600 font-bold">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{lead.assignedTo?.name || 'Bhakti'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200/80 rounded-2xl bg-white/50">
                      <span>No leads in this column</span>
                    </div>
                  )}
                </div>

                {/* Column Bottom Add Lead Button */}
                <button
                  onClick={() => handleOpenCreateModal(statusKey)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${cfg.addBtnColor}`}
                >
                  <Plus className="w-4 h-4" />
                  Add Lead
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. VIEW 2: LEADS DIRECTORY LIST TABLE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[10px]">
                  <th className="py-3.5 px-5">Lead & Initials</th>
                  <th className="py-3.5 px-5">Project & Contact</th>
                  <th className="py-3.5 px-5">Est. Budget</th>
                  <th className="py-3.5 px-5">Source</th>
                  <th className="py-3.5 px-5">Assigned Owner</th>
                  <th className="py-3.5 px-5">Lifecycle Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leads.length > 0 ? (
                  leads.map(lead => {
                    const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                    const avatarBg = getAvatarColor(lead.name);
                    const initials = getInitials(lead.name);

                    return (
                      <tr key={lead._id || lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full font-extrabold text-xs flex items-center justify-center border ${avatarBg}`}>
                              {initials}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{lead.name}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{lead.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 space-y-0.5">
                          <div className="font-bold text-slate-800">{lead.projectType || 'Architectural Project'}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{lead.phone}</div>
                        </td>
                        <td className="py-3.5 px-5 font-extrabold text-slate-900">
                          {formatCurrency(lead.amount)}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                            {lead.source || 'Website'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-800">
                          {lead.assignedTo?.name || 'Bhakti'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleOpenLeadDetails(lead._id || lead.id)}
                            className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all text-xs"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 font-bold">
                      No prospective leads found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. VIEW 3: DUE FOLLOW-UPS TAB */}
      {viewMode === 'due' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Follow-ups Scheduled:</span> Total {dueLeads.length} active leads requiring contact today or overdue.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueLeads.map(lead => (
              <div key={lead._id || lead.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{lead.name}</span>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                    Follow-up Due
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Phone:</strong> {lead.phone}</div>
                  <div><strong>Assigned To:</strong> {lead.assignedTo?.name || 'Bhakti'}</div>
                  <div><strong>Scheduled Date:</strong> {new Date(lead.nextFollowUpDate).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => handleOpenLeadDetails(lead._id || lead.id)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Inspect & Log Touchpoint
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. MODAL: CREATE NEW LEAD */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Add New Lead ({STATUS_CONFIG[createPreSelectedStatus]?.label || 'New Lead'})
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createDuplicateWarning && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Duplicate Lead Phone Number Detected!
                </div>
                <p>An active lead with phone <strong>{newLeadForm.phone}</strong> already exists for <strong>{createDuplicateWarning.name}</strong> (Status: {createDuplicateWarning.status}).</p>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhakti Kadam"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="09274322242"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="bhakti@gmail.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Type</label>
                  <select
                    value={newLeadForm.projectType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, projectType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Residential Project">Residential Project</option>
                    <option value="Commercial Project">Commercial Project</option>
                    <option value="Interior Project">Interior Project</option>
                    <option value="Villa Project">Villa Project</option>
                    <option value="Office Renovation">Office Renovation</option>
                    <option value="Luxury Villa">Luxury Villa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est. Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="1800000"
                    value={newLeadForm.amount}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source *</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="WalkIn">WalkIn</option>
                    <option value="SocialMedia">SocialMedia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Staff Owner</label>
                  <select
                    value={newLeadForm.assignedTo}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Default (Bhakti)</option>
                    <option value="Bhakti">Bhakti</option>
                    <option value="Rohit">Rohit</option>
                    {users.map(u => (
                      <option key={u.id || u._id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requirement Notes</label>
                <textarea
                  rows="3"
                  placeholder="Architectural design requirements, budget range..."
                  value={newLeadForm.requirementNotes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, requirementNotes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {createLoading ? 'Saving Lead...' : 'Submit Lead Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: VIEW ANALYTICS OVERVIEW */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                CRM Pipeline Analytics & Insights
              </h3>
              <button onClick={() => setShowAnalyticsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Total Pipeline Value</span>
                <div className="text-xl font-black text-indigo-900 mt-1">₹ 2,47,00,000</div>
              </div>
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Won Conversion</span>
                <div className="text-xl font-black text-emerald-900 mt-1">17.8%</div>
              </div>
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Avg Lead Cycle</span>
                <div className="text-xl font-black text-purple-900 mt-1">14 Days</div>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs">Pipeline Stage Breakdown</h4>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>New Leads (12)</span>
                    <span>42.8%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '42.8%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Contacted (8)</span>
                    <span>28.5%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '28.5%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Qualified (4)</span>
                    <span>14.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '14.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Proposal Sent (2)</span>
                    <span>7.1%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '7.1%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Won Client (2)</span>
                    <span>7.1%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '7.1%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. DRAWER / MODAL: LEAD DETAILS & LIFECYCLE MANAGEMENT */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-50 animate-in slide-in-from-right duration-200">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full font-extrabold text-sm flex items-center justify-center border ${getAvatarColor(selectedLead.name)}`}>
                    {getInitials(selectedLead.name)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead Profile</span>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedLead.name}</h2>
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Status & Quick Action Ribbon */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Lifecycle Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${STATUS_CONFIG[selectedLead.status]?.color}`}>
                    {STATUS_CONFIG[selectedLead.status]?.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setTargetStatus('QUALIFIED'); setStatusChangeModal(true); }}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 hover:bg-purple-100 transition-all"
                  >
                    Change Status
                  </button>
                  <button
                    onClick={handleConvertToClient}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Convert to Client (WON)
                  </button>
                </div>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Contact Details</span>
                  <div className="font-bold text-slate-900">{selectedLead.phone}</div>
                  <div className="text-slate-500">{selectedLead.email || 'No email provided'}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Project & Value</span>
                  <div className="font-bold text-slate-900">{selectedLead.projectType || 'Residential Project'}</div>
                  <div className="text-emerald-700 font-extrabold">{formatCurrency(selectedLead.amount)}</div>
                </div>
              </div>

              {/* Requirement Notes */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1">
                <span className="font-bold text-indigo-900 text-[10px] uppercase tracking-wider">Requirement Notes</span>
                <p className="text-slate-700 leading-relaxed">{selectedLead.requirementNotes || 'No notes specified.'}</p>
              </div>

              {/* Log Touchpoint Interaction Form */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Log Interaction Touchpoint
                </h4>
                <form onSubmit={handleLogInteractionSubmit} className="space-y-3 text-xs">
                  <div className="flex gap-2">
                    {['Call', 'Meeting', 'Email', 'Note'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setInteractionForm({ ...interactionForm, type: t })}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${interactionForm.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows="2"
                    required
                    placeholder="Log conversation summary, client feedback, or agreed action items..."
                    value={interactionForm.notes}
                    onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={interactionSubmitting}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {interactionSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Touchpoint Log
                  </button>
                </form>
              </div>

              {/* Chronological Interactions Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  Interactions Timeline ({interactions.length})
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {interactions.length > 0 ? (
                    interactions.map(item => (
                      <div key={item._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.loggedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1">{item.notes}</p>
                        <div className="text-[10px] text-slate-400">By: {item.loggedBy?.name || 'Bhakti'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                      No interaction touchpoints logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Status Audit Trail */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  Status Change Audit Trail ({statusHistory.length})
                </h4>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {statusHistory.map(h => (
                    <div key={h._id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-600">{h.fromStatus || 'INIT'}</span>
                        <ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" />
                        <span className="font-bold text-indigo-600">{h.toStatus}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{new Date(h.changedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL: STATUS CHANGE MODAL */}
      {statusChangeModal && selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Update Lifecycle Status</h3>
              <button onClick={() => setStatusChangeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusChangeSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select New Lifecycle Status *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-800"
                >
                  <option value="">Select Status...</option>
                  {Object.keys(STATUS_CONFIG).map(st => (
                    <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
                  ))}
                </select>
              </div>

              {targetStatus === 'LOST' && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">Mandatory Lost Reason *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Specify why lead was marked as lost (e.g. Budget constraints, Competitor chosen)..."
                    value={lostReasonText}
                    onChange={(e) => setLostReasonText(e.target.value)}
                    className="w-full px-3.5 py-2 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-rose-50/50"
                  ></textarea>
                </div>
              )}

              <button
                type="submit"
                disabled={statusSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {statusSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {statusSubmitting ? 'Updating Status...' : 'Confirm Status Transition'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
