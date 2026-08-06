import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, Search, Filter, Phone, Mail, Calendar, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, X, MessageSquare, History, Award, Check, RefreshCw,
  Kanban, List, AlertCircle, FileText, ChevronRight, UserCheck, ShieldAlert,
  MoreVertical, TrendingUp, TrendingDown, Trophy, SlidersHorizontal, Plus,
  BarChart2, User, DollarSign, Eye, EyeOff, Trash2, Edit3, CheckCircle, PieChart,
  GripVertical
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
} from '../../../service/crm/lead';
import { getUsersList } from '../../../service/auth';
import useSEO from '../../../hooks/useSEO';
import StatusBadge from '../../common/StatusBadge';

// Order of all lifecycle statuses matching backend schema
const ALL_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'];

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
  NEGOTIATION: {
    label: 'Negotiation',
    badge: '0',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    bgCard: 'border-l-4 border-l-cyan-500',
    headerBg: 'bg-cyan-50/80 border-cyan-100',
    headerText: 'text-cyan-600',
    badgeBg: 'bg-cyan-100/70 text-slate-700 font-extrabold',
    addBtnColor: 'text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100/50',
    columnBg: 'bg-[#f0f9ff]/80 border-slate-200/50'
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

  // Screen width responsive detection (Mobile < 768px: max 2 open, 5 closed; Desktop: max 5 open, 2 closed)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Open Status Columns state (By default 1st 2 columns open on Mobile, 5 on Desktop)
  const [openStatuses, setOpenStatuses] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
      ? ['NEW', 'CONTACTED']
      : ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION']
  );

  // Drag and Drop states
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync open columns whenever mobile breakpoint toggles (Mobile max 2 open, Desktop max 5 open)
  useEffect(() => {
    setOpenStatuses(prev => {
      const maxAllowed = isMobile ? 2 : 5;
      if (prev.length > maxAllowed) {
        return prev.slice(0, maxAllowed);
      } else if (prev.length < maxAllowed) {
        const missing = ALL_STATUSES.filter(st => !prev.includes(st));
        return [...prev, ...missing.slice(0, maxAllowed - prev.length)];
      }
      return prev;
    });
  }, [isMobile]);

  useSEO({
    title: 'CRM Lead Management & Pipeline',
    description: 'Track client inquiry leads, sales stages, site consultation follow-ups, and architectural project conversion pipeline.',
    keywords: 'CRM Lead Pipeline, Architectural Leads, Project Inquiries, Sales Pipeline, Nirman Architects'
  });

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
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
  }, [viewMode, searchQuery, statusFilter, ownerFilter, priorityFilter, dueDateFilter, sortBy, page]);

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
        const res = await getDueFollowUps({ date: dueDateFilter });
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

  // Toggle open/closed state of status columns
  // Mobile (<768px): Max 2 open columns (5 closed). Desktop: Max 5 open columns (2 closed).
  const toggleStatusColumn = (statusKey) => {
    setOpenStatuses(prev => {
      const isCurrentlyOpen = prev.includes(statusKey);
      const maxAllowed = isMobile ? 2 : 5;

      if (isCurrentlyOpen) {
        if (prev.length <= 1) return prev; // Keep at least 1 column open
        return prev.filter(st => st !== statusKey);
      } else {
        if (prev.length >= maxAllowed) {
          // Find earliest open status that is NOT 'NEW'
          const nonNewOpen = ALL_STATUSES.filter(st => st !== 'NEW' && prev.includes(st));
          const statusToClose = nonNewOpen.length > 0 ? nonNewOpen[0] : prev[0];
          return prev.filter(st => st !== statusToClose).concat(statusKey);
        } else {
          return [...prev, statusKey];
        }
      }
    });
  };

  // Desktop Drag and Drop Event Handlers
  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.setData('text/plain', lead._id || lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStatus(null);
  };

  // Mobile Touch Drag & Drop Handlers
  const handleTouchStart = (e, lead) => {
    setDraggedLead(lead);
  };

  const handleTouchMove = (e) => {
    if (!draggedLead) return;
    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const columnElem = element.closest('[data-status-key]');
    if (columnElem) {
      const statusKey = columnElem.getAttribute('data-status-key');
      if (statusKey && dragOverStatus !== statusKey) {
        setDragOverStatus(statusKey);
      }
    }
  };

  const handleTouchEnd = async (e) => {
    if (!draggedLead) return;

    const touch = e.changedTouches ? e.changedTouches[0] : null;
    let targetStatus = dragOverStatus;

    if (touch) {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const columnElem = element.closest('[data-status-key]');
        if (columnElem) {
          targetStatus = columnElem.getAttribute('data-status-key');
        }
      }
    }

    if (targetStatus && targetStatus !== draggedLead.status) {
      await handleDrop(e, targetStatus);
    } else {
      setDraggedLead(null);
      setDragOverStatus(null);
    }
  };

  const handleDragOver = (e, statusKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== statusKey) {
      setDragOverStatus(statusKey);
    }
  };

  const handleDragLeave = (e, statusKey) => {
    e.preventDefault();
    if (dragOverStatus === statusKey) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverStatus(null);

    if (!draggedLead) return;
    const leadId = draggedLead._id || draggedLead.id;
    const currentStatus = draggedLead.status;

    if (currentStatus === targetStatus) {
      setDraggedLead(null);
      return;
    }

    if (targetStatus === 'LOST') {
      setSelectedLead(draggedLead);
      setTargetStatus('LOST');
      setLostReasonText('');
      setStatusChangeModal(true);
      setDraggedLead(null);
      return;
    }

    // Optimistically update pipelineData state immediately
    setPipelineData(prev => {
      const updated = { ...prev };
      const sourceList = (updated[currentStatus] || []).filter(l => (l._id || l.id) !== leadId);
      const targetList = [...(updated[targetStatus] || []), { ...draggedLead, status: targetStatus }];
      return {
        ...updated,
        [currentStatus]: sourceList,
        [targetStatus]: targetList
      };
    });

    setDraggedLead(null);

    try {
      const res = await updateLeadStatus(leadId, { newStatus: targetStatus });
      if (!res?.success) {
        alert(res?.message || 'Failed to update status.');
        fetchData();
      } else {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating drag drop status:", err);
      fetchData();
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

    const seen = new Set();
    const uniqueLeads = allLeadsList.filter(l => {
      const id = l._id || l.id;
      const phone = l.phone ? l.phone.trim() : null;
      const key = id || phone;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      total: uniqueLeads.length,
      NEW: (pipelineData['NEW'] || []).length,
      CONTACTED: (pipelineData['CONTACTED'] || []).length,
      QUALIFIED: (pipelineData['QUALIFIED'] || []).length,
      PROPOSAL_SENT: (pipelineData['PROPOSAL_SENT'] || []).length,
      NEGOTIATION: (pipelineData['NEGOTIATION'] || []).length,
      WON: (pipelineData['WON'] || []).length,
      LOST: (pipelineData['LOST'] || []).length,
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
    } finally {
      setDetailsLoading(false);
    }
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

  const handleQuickStatusChange = async (leadId, newStatus) => {
    setActiveCardMenuId(null);
    try {
      const res = await updateLeadStatus(leadId, { newStatus });
      if (res?.success) {
        fetchData();
      } else {
        alert(res?.message || 'Failed to update status.');
      }
    } catch (err) {
      alert(err.message || 'Error updating status.');
    }
  };

  // Filter & sort logic for Kanban column leads
  const filterAndSortCards = (cardsList = []) => {
    let result = [...cardsList];

    const seenIds = new Set();
    const seenPhones = new Set();
    result = result.filter(lead => {
      const id = lead._id || lead.id;
      const phone = lead.phone ? lead.phone.trim() : null;

      if (id && seenIds.has(id)) return false;
      if (phone && seenPhones.has(phone)) return false;

      if (id) seenIds.add(id);
      if (phone) seenPhones.add(phone);
      return true;
    });

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreateModal('NEW')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-900 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-3xs transition-all cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>View Analytics</span>
          </button>
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
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'pipeline' ? 'bg-brand-accent text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-brand-accent text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Directory Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('due')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'due' ? 'bg-brand-accent text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
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

      {/* 4. VIEW 1: KANBAN PIPELINE BOARD (100% RESPONSIVE - ZERO HORIZONTAL SCROLL ON MOBILE AND DESKTOP) */}
      {viewMode === 'pipeline' && (
        <div className="w-full flex gap-1 sm:gap-3.5 items-start overflow-x-auto overflow-y-visible p-1 sm:p-2 pb-4 min-h-[550px] sm:min-h-[620px]">
          {ALL_STATUSES.map(statusKey => {
            const isOpen = openStatuses.includes(statusKey);
            const rawLeads = pipelineData[statusKey] || [];
            const filteredLeads = filterAndSortCards(rawLeads);
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.NEW;
            const isDropTarget = dragOverStatus === statusKey;

            if (!isOpen) {
              {/* Collapsed Column Ribbon */}
              return (
                <div
                  key={statusKey}
                  data-status-key={statusKey}
                  onClick={() => toggleStatusColumn(statusKey)}
                  className="bg-slate-100/90 border border-slate-200 hover:border-slate-300 p-1 sm:p-2 rounded-2xl flex flex-col items-center justify-between w-7 sm:w-11 min-h-[520px] sm:min-h-[580px] cursor-pointer transition-all hover:bg-slate-200/70 group flex-shrink-0 shadow-2xs"
                  title={`Click to open ${cfg.label} column`}
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStatusColumn(statusKey); }}
                      className="p-0.5 sm:p-1 rounded-xl bg-white shadow-2xs text-slate-600 hover:text-indigo-600"
                    >
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <span className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black ${cfg.badgeBg}`}>
                      {filteredLeads.length}
                    </span>
                  </div>

                  <div
                    style={{ writingMode: 'vertical-rl' }}
                    className="rotate-180 font-black text-[9px] sm:text-xs text-slate-600 tracking-wider uppercase my-auto py-2 sm:py-4 group-hover:text-indigo-600 transition-colors whitespace-nowrap"
                  >
                    {cfg.label}
                  </div>

                  <div className="p-0.5 sm:p-1 text-slate-400 group-hover:text-slate-700">
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              );
            }

            {/* Open Kanban Column */}
            return (
              <div
                key={statusKey}
                data-status-key={statusKey}
                onDragOver={(e) => handleDragOver(e, statusKey)}
                onDragLeave={(e) => handleDragLeave(e, statusKey)}
                onDrop={(e) => handleDrop(e, statusKey)}
                className={`flex-1 min-w-0 max-w-full sm:max-w-[340px] ${cfg.columnBg} p-2 sm:p-3.5 rounded-2xl border flex flex-col min-h-[520px] sm:min-h-[580px] space-y-2 sm:space-y-3 transition-all ${
                  isDropTarget ? 'ring-2 ring-indigo-500 bg-indigo-50/70 border-indigo-300 scale-[1.01]' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-0.5 sm:px-1 py-0.5">
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                    <span className={`font-black text-[11px] sm:text-sm truncate ${cfg.headerText}`}>
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => handleOpenCreateModal(statusKey)}
                      className={`p-0.5 sm:p-1 rounded-lg text-xs font-bold transition-all ${cfg.addBtnColor} cursor-pointer flex-shrink-0`}
                      title={`Add new ${cfg.label}`}
                    >
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold ${cfg.badgeBg}`}>
                      {filteredLeads.length}
                    </span>
                    <button
                      onClick={() => toggleStatusColumn(statusKey)}
                      className="p-0.5 sm:p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="Minimize column"
                    >
                      <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(lead => {
                      const avatarBg = getAvatarColor(lead.name);
                      const initials = getInitials(lead.name);
                      const isMenuOpen = activeCardMenuId === (lead._id || lead.id);
                      const isBeingDragged = draggedLead && (draggedLead._id || draggedLead.id) === (lead._id || lead.id);

                      return (
                        <div
                          key={lead._id || lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead)}
                          onDragEnd={handleDragEnd}
                          onTouchStart={(e) => handleTouchStart(e, lead)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onClick={() => handleOpenLeadDetails(lead._id || lead.id)}
                          className={`bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 sm:space-y-3 group relative select-none ${
                            isBeingDragged ? 'opacity-30 scale-95 border-indigo-500 border-dashed' : ''
                          }`}
                        >
                          {/* Card Header: Avatar, Name, Project, Menu & Drag Grip */}
                          <div className="flex items-start justify-between gap-1 sm:gap-2">
                            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                              <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 cursor-grab" />
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-black text-[10px] sm:text-xs flex items-center justify-center flex-shrink-0 border ${avatarBg}`}>
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-slate-900 text-[11px] sm:text-xs truncate group-hover:text-indigo-600 transition-colors leading-tight">
                                  {lead.name}
                                </h4>
                                <p className="text-slate-400 text-[9px] sm:text-[11px] font-medium truncate mt-0.5 leading-none">
                                  {lead.projectType || 'Architectural'}
                                </p>
                              </div>
                            </div>

                            {/* Menu Button */}
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCardMenuId(isMenuOpen ? null : (lead._id || lead.id));
                                }}
                                className="text-slate-300 hover:text-slate-600 p-0.5 sm:p-1 rounded-md transition-colors"
                              >
                                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>

                              {/* Card Dropdown Menu */}
                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-6 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 w-44 text-xs"
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

                                  <div className="border-t border-slate-100 my-1"></div>
                                  <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Move Status</div>
                                  {ALL_STATUSES.filter(st => st !== statusKey).map(st => (
                                    <button
                                      key={st}
                                      onClick={() => handleQuickStatusChange(lead._id || lead.id, st)}
                                      className="w-full text-left px-3 py-1 hover:bg-slate-50 text-[11px] text-slate-700 font-bold flex items-center justify-between transition-colors"
                                    >
                                      <span>Move to {STATUS_CONFIG[st]?.label}</span>
                                      <ArrowRight className="w-3 h-3 text-slate-400" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Middle: Phone & Budget */}
                          <div className="space-y-1 sm:space-y-1.5 text-xs text-slate-600 pt-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] truncate">
                              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-black text-slate-900 text-[11px] sm:text-sm truncate">
                              <span className="truncate">{formatCurrency(lead.amount)}</span>
                            </div>
                          </div>

                          {/* Priority Pill Tag */}
                          <div className="min-w-0">
                            <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border inline-block whitespace-nowrap max-w-full truncate ${getPriorityBadgeStyle(lead.priorityTag, lead.status)}`}>
                              {lead.priorityTag || (statusKey === 'WON' ? 'Client Won' : statusKey === 'PROPOSAL_SENT' ? 'Proposal Sent' : statusKey === 'QUALIFIED' ? 'High Priority' : 'Hot Lead')}
                            </span>
                          </div>

                          {/* Card Footer: Date & Owner */}
                          <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-slate-400 font-medium pt-1.5 sm:pt-2 border-t border-slate-100 min-w-0 gap-0.5">
                            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 truncate">
                              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{lead.dateText || 'Today'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600 font-bold min-w-0 truncate ml-0.5 flex-shrink-0">
                              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{lead.assignedTo?.name || 'Bhakti'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200/80 rounded-2xl bg-white/50 space-y-1">
                      <span>No leads in this column</span>
                      <span className="text-[10px] text-slate-300">Drag card here to update</span>
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
                            className="px-3.5 py-1.5 bg-brand-soft hover:bg-brand-primary text-slate-900 border border-brand-secondary/40 font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-3xs"
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
      {/* 6. VIEW 3: DUE FOLLOW-UPS DIRECTORY (GET /api/leads/followups/due?date=) */}
      {viewMode === 'due' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong className="font-extrabold text-amber-950 block">Follow-up Communication Hub</strong>
                <span className="text-amber-800 text-[11px]">Active leads requiring follow-up contact on or before target date (WON/LOST excluded).</span>
              </div>
            </div>

            {/* Target Follow-up Date Filter Input */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-slate-700 text-xs">Filter Date:</span>
              <input
                type="date"
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueLeads.length > 0 ? (
              dueLeads.map(lead => (
                <div key={lead._id || lead.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="font-black text-slate-900 text-sm">{lead.name}</strong>
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black uppercase">
                        Follow-up Due
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <strong className="text-slate-900 font-mono">{lead.phone}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned To:</span>
                        <strong className="text-slate-900">{lead.assignedTo?.name || 'Bhakti'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Scheduled Date:</span>
                        <strong className="text-amber-700 font-bold">
                          {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'Today'}
                        </strong>
                      </div>
                      {lead.requirementNotes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60 truncate">
                          "{lead.requirementNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Direct
                      </a>

                      <button
                        onClick={async () => {
                          const newD = await window.prompt("Select new follow-up date (YYYY-MM-DD):", new Date().toISOString().split('T')[0], "Schedule Follow-up Date");
                          if (!newD || !newD.trim()) return;
                          try {
                            const res = await updateLead(lead._id || lead.id, { nextFollowUpDate: newD });
                            if (res?.success) {
                              alert("Follow-up date updated!");
                              fetchData();
                            }
                          } catch (e) {
                            alert("Failed to reschedule follow-up date.");
                          }
                        }}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Reschedule
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenLeadDetails(lead._id || lead.id)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Inspect & Log Touchpoint
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-sm">No Pending Follow-ups Due</h4>
                <p className="text-xs text-slate-500">All active lead follow-ups for {dueDateFilter} are up to date!</p>
              </div>
            )}
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
              
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center border shadow-3xs ${getAvatarColor(selectedLead.name)}`}>
                    {getInitials(selectedLead.name)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Lead Profile</span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedLead.name}</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)} 
                  className="w-9 h-9 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                  title="Close Profile"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Status & Quick Action Ribbon */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shadow-3xs">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Lifecycle Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border inline-block mt-0.5 ${STATUS_CONFIG[selectedLead.status]?.color}`}>
                    {STATUS_CONFIG[selectedLead.status]?.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setTargetStatus('QUALIFIED'); setStatusChangeModal(true); }}
                    className="px-3.5 py-2 bg-brand-soft hover:bg-brand-primary text-slate-900 font-extrabold text-xs rounded-xl border border-brand-secondary/40 transition-all shadow-3xs cursor-pointer"
                  >
                    Change Status
                  </button>
                  <button
                    onClick={handleConvertToClient}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-white" />
                    <span>Convert to Client (WON)</span>
                  </button>
                </div>
              </div>

              {/* Lead Details Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-3xs">
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Contact Details</span>
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedLead.phone}</span>
                  </div>
                  <div className="text-slate-500 font-medium flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{selectedLead.email || 'No email provided'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-3xs">
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Project & Value</span>
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedLead.projectType || 'Residential Project'}</span>
                  </div>
                  <div className="text-emerald-600 font-black text-sm">
                    {formatCurrency(selectedLead.amount)}
                  </div>
                </div>
              </div>

              {/* Requirement Notes Panel */}
              <div className="p-4 bg-brand-soft/70 rounded-2xl border border-brand-secondary/30 text-xs space-y-1 shadow-3xs">
                <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest block">Requirement Notes</span>
                <p className="text-slate-700 leading-relaxed font-semibold">{selectedLead.requirementNotes || 'No specific notes recorded.'}</p>
              </div>

              {/* Log Touchpoint Interaction Form */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Log Interaction Touchpoint</span>
                </h4>
                <form onSubmit={handleLogInteractionSubmit} className="space-y-3 text-xs">
                  <div className="flex gap-2 flex-wrap">
                    {['Call', 'Meeting', 'Email', 'Note'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setInteractionForm({ ...interactionForm, type: t })}
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                          interactionForm.type === t 
                            ? 'bg-brand-primary text-slate-900 border-brand-secondary/60 shadow-3xs font-black' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows="2.5"
                    required
                    placeholder="Log conversation summary, client feedback, or agreed action items..."
                    value={interactionForm.notes}
                    onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-semibold bg-white text-slate-800"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={interactionSubmitting}
                    className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    {interactionSubmitting ? <RefreshCw className="w-4 h-4 animate-spin text-slate-900" /> : <Check className="w-4 h-4 text-slate-900 stroke-[2.5]" />}
                    <span>Save Touchpoint Log</span>
                  </button>
                </form>
              </div>

              {/* Chronological Interactions Timeline */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Interactions Timeline ({interactions.length})</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                  {interactions.length > 0 ? (
                    interactions.map(item => (
                      <div key={item._id} className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs space-y-1 shadow-3xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-lg text-[10px]">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.loggedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium mt-1">{item.notes}</p>
                        <div className="text-[10px] text-slate-400 font-semibold">Logged by: {item.loggedBy?.name || 'Bhakti'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      No interaction touchpoints logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Status Audit Trail */}
              <div className="space-y-3 pb-4">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Status Change Audit Trail ({statusHistory.length})</span>
                </h4>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-none">
                  {statusHistory.map(h => (
                    <div key={h._id} className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between shadow-3xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded text-[10px]">{h.fromStatus || 'INIT'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[10px]">{h.toStatus}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {new Date(h.changedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: CREATE / ADD NEW LEAD */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-soft text-brand-dark rounded-xl border border-brand-secondary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Add New Lead</h3>
                  <p className="text-slate-400 text-[11px] font-medium">Create a new prospect entry in the CRM pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Duplicate Warning Alert (if any) */}
            {createDuplicateWarning && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 font-extrabold text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Duplicate Lead Warning</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  An active lead matching this contact details already exists: <strong>{createDuplicateWarning.name}</strong> (Status: {createDuplicateWarning.status}).
                </p>
              </div>
            )}

            {/* Create Lead Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name / Prospect Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50"
                  />
                </div>

                {/* Lead Source */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Lead Source *</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50 cursor-pointer"
                  >
                    <option value="Website">Website Form</option>
                    <option value="Referral">Client Referral</option>
                    <option value="WalkIn">Walk-In Visit</option>
                    <option value="SocialMedia">Social Media / Campaign</option>
                    <option value="Other">Other Channel</option>
                  </select>
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Initial Pipeline Stage *</label>
                  <select
                    value={createPreSelectedStatus}
                    onChange={(e) => setCreatePreSelectedStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50 cursor-pointer"
                  >
                    {Object.keys(STATUS_CONFIG).map(st => (
                      <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned Representative */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Assigned Account Representative</label>
                  <select
                    value={typeof newLeadForm.assignedTo === 'object' ? (newLeadForm.assignedTo?._id || newLeadForm.assignedTo?.id) : newLeadForm.assignedTo}
                    onChange={(e) => {
                      const foundUser = users.find(u => (u._id || u.id) === e.target.value);
                      setNewLeadForm(prev => ({ ...prev, assignedTo: foundUser || e.target.value }));
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">Unassigned (General Pool)</option>
                    {users.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.roleId?.roleName || u.designation || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estimated Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Estimated Deal Value (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1800000"
                    value={newLeadForm.amount}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50"
                  />
                </div>

                {/* Priority Tag */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Priority Tag</label>
                  <select
                    value={newLeadForm.priorityTag}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, priorityTag: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50 cursor-pointer"
                  >
                    <option value="Hot Lead">Hot Lead</option>
                    <option value="Warm Lead">Warm Lead</option>
                    <option value="High Priority">High Priority</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Interested">Interested</option>
                  </select>
                </div>
              </div>

              {/* Next Follow-up Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Next Scheduled Follow-up Date</label>
                <input
                  type="date"
                  value={newLeadForm.nextFollowUpDate}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, nextFollowUpDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50"
                />
              </div>

              {/* Requirement Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Requirement Notes & Scope Details</label>
                <textarea
                  rows="3"
                  placeholder="Specify architectural style, site area, estimated timeline or client preferences..."
                  value={newLeadForm.requirementNotes}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, requirementNotes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50"
                ></textarea>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-brand-dark" />}
                  {createLoading ? 'Creating Lead...' : 'Save Lead Entry'}
                </button>
              </div>
            </form>
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
