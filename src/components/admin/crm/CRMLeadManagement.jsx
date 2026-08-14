import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, Search, Filter, Phone, Mail, Calendar, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, X, MessageSquare, History, Award, Check, RefreshCw,
  Kanban, List, AlertCircle, FileText, ChevronRight, UserCheck, ShieldAlert,
  MoreVertical, TrendingUp, TrendingDown, Trophy, SlidersHorizontal, Plus,
  BarChart2, User, IndianRupee, Eye, EyeOff, Trash2, Edit3, CheckCircle, PieChart,
  GripVertical, Building, Building2
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
import { createClient } from '../../../service/crm/client';
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

export default function CRMLeadManagement({ userRole = 'Admin', onClientCreated }) {
  // Navigation & View state
  const [viewMode, setViewMode] = useState('pipeline'); // pipeline | list | due
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [pipelineData, setPipelineData] = useState({});
  const [dueLeads, setDueLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Converted/Won Client Modal States
  const [showClientCreateModal, setShowClientCreateModal] = useState(false);
  const [clientFormLead, setClientFormLead] = useState(null);
  const [clientFormData, setClientFormData] = useState({
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
  const [clientFormSubmitting, setClientFormSubmitting] = useState(false);
  const [clientFormError, setClientFormError] = useState('');
  const [tempPasswordResult, setTempPasswordResult] = useState(null);

  const triggerClientConversion = (lead) => {
    setClientFormLead(lead);
    setClientFormData({
      name: lead.companyName || lead.company || lead.name || '',
      companyName: lead.companyName || lead.company || lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      primaryContactName: lead.name || '',
      primaryContactEmail: lead.email || '',
      primaryContactPhone: lead.phone || '',
      billingAddress: lead.address || lead.location || '',
      siteAddress: lead.address || lead.location || ''
    });
    setClientFormError('');
    setTempPasswordResult(null);
    setShowClientCreateModal(true);
  };

  const handleClientFormSubmit = async (e) => {
    e.preventDefault();
    if (!clientFormData.name.trim() || !clientFormData.primaryContactName.trim() || !clientFormData.primaryContactEmail.trim() || !clientFormData.phone.trim()) {
      setClientFormError("Please fill out all required fields marked with an asterisk (*).");
      return;
    }
    setClientFormSubmitting(true);
    setClientFormError('');
    try {
      const res = await createClient({
        name: clientFormData.name.trim(),
        companyName: clientFormData.companyName.trim() || clientFormData.name.trim(),
        phone: clientFormData.phone.trim(),
        email: clientFormData.email.trim() || clientFormData.primaryContactEmail.trim(),
        billingAddress: clientFormData.billingAddress.trim(),
        siteAddress: clientFormData.siteAddress.trim(),
        primaryContactName: clientFormData.primaryContactName.trim(),
        primaryContactEmail: clientFormData.primaryContactEmail.trim(),
        primaryContactPhone: clientFormData.primaryContactPhone.trim() || clientFormData.phone.trim()
      });

      if (res?.success) {
        const leadId = clientFormLead._id || clientFormLead.id;
        await updateLeadStatus(leadId, { newStatus: 'WON' });
        
        setTempPasswordResult({
          clientName: res.client?.name || clientFormData.name,
          primaryContactEmail: res.primaryContact?.email || clientFormData.primaryContactEmail,
          tempPassword: res.primaryContact?.temporaryPassword || 'N/A',
          clientObj: res.client
        });

        fetchData();
        setSelectedLead(null);
      } else {
        setClientFormError(res?.message || 'Failed to register client account.');
      }
    } catch (err) {
      setClientFormError(err.message || 'Error converting lead to client.');
    } finally {
      setClientFormSubmitting(false);
    }
  };

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

  // Edit Lead States
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    source: 'Website',
    requirementNotes: '',
    assignedTo: '',
    nextFollowUpDate: '',
    projectType: 'Residential Project',
    amount: '1800000',
    priorityTag: 'Hot Lead'
  });
  const [editLoading, setEditLoading] = useState(false);

  // Interaction log form
  const [interactionForm, setInteractionForm] = useState({ type: 'Call', notes: '' });
  const [interactionSubmitting, setInteractionSubmitting] = useState(false);

  // Status Change modal
  const [statusChangeModal, setStatusChangeModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [lostReasonText, setLostReasonText] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Due Follow-Ups Right Slide-Over Drawer
  const [showDueDrawer, setShowDueDrawer] = useState(false);

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

  const normalizeStatusKey = (status = 'NEW') => {
    const raw = String(status).toUpperCase();
    if (raw.includes('WON')) return 'WON';
    if (raw.includes('LOST')) return 'LOST';
    if (raw.includes('NEW')) return 'NEW';
    if (raw.includes('CONTACT')) return 'CONTACTED';
    if (raw.includes('QUALIF')) return 'QUALIFIED';
    if (raw.includes('PROPOS')) return 'PROPOSAL_SENT';
    if (raw.includes('NEGOTI')) return 'NEGOTIATION';
    return 'NEW';
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
          const grouped = {};
          ALL_STATUSES.forEach(st => { grouped[st] = []; });
          
          if (res.pipeline && typeof res.pipeline === 'object' && Object.keys(res.pipeline).length > 0) {
            Object.keys(res.pipeline).forEach(rawKey => {
              const normalized = normalizeStatusKey(rawKey);
              if (Array.isArray(res.pipeline[rawKey])) {
                grouped[normalized] = [...(grouped[normalized] || []), ...res.pipeline[rawKey]];
              }
            });
          } else if (Array.isArray(res.leads)) {
            res.leads.forEach(l => {
              const normalized = normalizeStatusKey(l.status);
              if (grouped[normalized]) {
                grouped[normalized].push(l);
              }
            });
          }
          setPipelineData(grouped);
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

    if (targetStatus === 'WON') {
      triggerClientConversion(draggedLead);
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

  // Compute all leads with nextFollowUpDate
  const dueFollowUpLeads = useMemo(() => {
    let list = [];
    if (pipelineData) {
      Object.keys(pipelineData).forEach(k => {
        if (Array.isArray(pipelineData[k])) {
          list = list.concat(pipelineData[k]);
        }
      });
    }
    if (leads && leads.length > 0) {
      list = list.concat(leads);
    }
    const seen = new Set();
    const unique = list.filter(l => {
      const id = l._id || l.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return unique.filter(l => l.nextFollowUpDate && !['WON', 'LOST'].includes(l.status)).sort((a, b) => new Date(a.nextFollowUpDate) - new Date(b.nextFollowUpDate));
  }, [pipelineData, leads]);

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

  const handleEnterEditMode = (lead) => {
    if (!lead) return;
    const assignedId = lead.assignedTo?._id || lead.assignedTo?.id || lead.assignedTo || '';
    setEditLeadForm({
      id: lead._id || lead.id,
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      source: lead.source || 'Website',
      requirementNotes: lead.requirementNotes || '',
      assignedTo: assignedId,
      nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : '',
      projectType: lead.projectType || 'Residential Project',
      amount: lead.amount || '1800000',
      priorityTag: lead.priorityTag || 'Hot Lead'
    });
    setIsEditingLead(true);
  };

  const handleEditFromOuter = async (lead) => {
    if (!lead) return;
    await handleOpenLeadDetails(lead._id || lead.id);
    handleEnterEditMode(lead);
  };

  const handleEditSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        name: editLeadForm.name,
        phone: editLeadForm.phone,
        email: editLeadForm.email,
        source: editLeadForm.source,
        requirementNotes: editLeadForm.requirementNotes,
        assignedTo: editLeadForm.assignedTo,
        nextFollowUpDate: editLeadForm.nextFollowUpDate,
        projectType: editLeadForm.projectType,
        amount: editLeadForm.amount,
        priorityTag: editLeadForm.priorityTag
      };
      const res = await updateLead(editLeadForm.id, payload);
      if (res?.success) {
        setIsEditingLead(false);
        fetchData();
        if (selectedLead && (selectedLead._id === editLeadForm.id || selectedLead.id === editLeadForm.id)) {
          handleOpenLeadDetails(editLeadForm.id);
        }
      } else {
        alert(res?.message || 'Failed to update lead.');
      }
    } catch (err) {
      alert(err.message || 'Error updating lead.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenLeadDetails = async (leadId) => {
    setDetailsLoading(true);
    setSelectedLead(null);
    setIsEditingLead(false);
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

  const handleUpdateFollowUpDate = async (newDate) => {
    if (!selectedLead) return;
    try {
      const res = await updateLead(selectedLead._id || selectedLead.id, { nextFollowUpDate: newDate });
      if (res?.success && res.lead) {
        setSelectedLead(res.lead);
        fetchData();
        alert("Follow-up date updated successfully!");
      } else {
        setSelectedLead(prev => ({ ...prev, nextFollowUpDate: newDate }));
      }
    } catch (err) {
      setSelectedLead(prev => ({ ...prev, nextFollowUpDate: newDate }));
    }
  };

  const handleLogInteractionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setInteractionSubmitting(true);
    try {
      const res = await logInteraction(selectedLead._id || selectedLead.id, {
        type: interactionForm.type,
        notes: interactionForm.notes
      });
      if (res?.success) {
        // Also update next follow up date if user specified one
        if (interactionForm.nextFollowUpDate) {
          await handleUpdateFollowUpDate(interactionForm.nextFollowUpDate);
        }
        setInteractionForm({ type: 'Call', notes: '', nextFollowUpDate: '' });
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

    if (targetStatus === 'WON') {
      setStatusChangeModal(false);
      triggerClientConversion(selectedLead);
      return;
    }

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
    triggerClientConversion(selectedLead);
  };

  const handleQuickStatusChange = async (leadId, newStatus) => {
    setActiveCardMenuId(null);
    if (newStatus === 'WON') {
      // Find lead in pipelineData or dueLeads
      let lead = leads.find(l => (l._id || l.id) === leadId);
      if (!lead && pipelineData) {
        Object.keys(pipelineData).forEach(st => {
          const found = pipelineData[st].find(l => (l._id || l.id) === leadId);
          if (found) lead = found;
        });
      }
      if (lead) {
        triggerClientConversion(lead);
        return;
      }
    }
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
            onClick={() => setShowDueDrawer(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer border border-brand-secondary/30"
          >
            <Calendar className="w-4 h-4 text-slate-900 stroke-[2.5]" />
            <span>Due Follow-Ups ({dueFollowUpLeads.length})</span>
          </button>
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

      {/* 4. VIEW 1: KANBAN PIPELINE BOARD (HORIZONTAL SCROLLABLE - ALL COLUMNS VISIBLE) */}
      {viewMode === 'pipeline' && (
        <div className="w-full flex gap-4 items-start overflow-x-auto p-1 pb-6 min-h-[580px] font-sans scrollbar-thin">
          {ALL_STATUSES.map(statusKey => {
            const rawLeads = pipelineData[statusKey] || [];
            const filteredLeads = filterAndSortCards(rawLeads);
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.NEW;
            const isDropTarget = dragOverStatus === statusKey;

            return (
              <div
                key={statusKey}
                data-status-key={statusKey}
                onDragOver={(e) => handleDragOver(e, statusKey)}
                onDragLeave={(e) => handleDragLeave(e, statusKey)}
                onDrop={(e) => handleDrop(e, statusKey)}
                className={`w-[320px] min-w-[320px] shrink-0 ${cfg.columnBg} p-3.5 rounded-2xl border flex flex-col min-h-[580px] space-y-3 transition-all ${
                  isDropTarget ? 'ring-2 ring-indigo-500 bg-indigo-50/70 border-indigo-300 scale-[1.01]' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 py-0.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`font-black text-xs uppercase tracking-wider truncate ${cfg.headerText}`}>
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => handleOpenCreateModal(statusKey)}
                      className={`p-1 rounded-lg text-xs font-bold transition-all ${cfg.addBtnColor} cursor-pointer flex-shrink-0`}
                      title={`Add new ${cfg.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${cfg.badgeBg}`}>
                      {filteredLeads.length}
                    </span>
                  </div>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto pt-2.5 pb-2 px-1">
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
                                  <button
                                    onClick={() => {
                                      setActiveCardMenuId(null);
                                      handleEditFromOuter(lead);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-bold"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-500" /> Edit Profile
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
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-505 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[10px]">
                  <th className="py-3.5 px-5 text-left pl-8">Lead & Initials</th>
                  <th className="py-3.5 px-5 text-center">Project & Contact</th>
                  <th className="py-3.5 px-5 text-center">Est. Budget</th>
                  <th className="py-3.5 px-5 text-center">Source</th>
                  <th className="py-3.5 px-5 text-center">Assigned Owner</th>
                  <th className="py-3.5 px-5 text-center">Lifecycle Status</th>
                  <th className="py-3.5 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-705">
                {leads.length > 0 ? (
                  leads.map(lead => {
                    const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                    const avatarBg = getAvatarColor(lead.name);
                    const initials = getInitials(lead.name);

                    return (
                      <tr key={lead._id || lead.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 text-left pl-8">
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
                        <td className="py-3.5 px-5 text-center space-y-0.5">
                          <div className="font-bold text-slate-800">{lead.projectType || 'Architectural Project'}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{lead.phone}</div>
                        </td>
                        <td className="py-3.5 px-5 text-center font-extrabold text-slate-900">
                          {formatCurrency(lead.amount)}
                        </td>
                        <td className="py-3.5 px-5 text-center font-semibold text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                            {lead.source || 'Website'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center font-bold text-slate-800">
                          {lead.assignedTo?.name || 'Bhakti'}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenLeadDetails(lead._id || lead.id)}
                              className="p-1.5 bg-brand-soft hover:bg-brand-primary text-slate-900 border border-brand-secondary/40 font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-3xs inline-flex items-center justify-center"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditFromOuter(lead)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-250/50 font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-3xs inline-flex items-center justify-center"
                              title="Edit Lead Profile"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
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
                      className="w-full py-2 crm-brand-btn text-slate-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* 9. DRAWER / MODAL: LEAD DETAILS & LIFECYCLE MANAGEMENT (SLIDE IN FROM RIGHT) */}
      {selectedLead && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-200"
          onClick={() => { setSelectedLead(null); setIsEditingLead(false); }}
        >
          <div 
            className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between font-sans transform transition-all duration-300 ease-out animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center border shadow-3xs ${getAvatarColor(selectedLead.name)}`}>
                    {getInitials(selectedLead.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Lead Profile</span>
                      {isEditingLead ? (
                        <select
                          value={editLeadForm.source}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, source: e.target.value }))}
                          className="px-2 py-0.5 border border-slate-300 rounded-md bg-white text-slate-805 text-[10px] font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="Google">Google Search</option>
                          <option value="Reference">Reference</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Website">Website</option>
                          <option value="Walk-in">Walk-in</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded-md border border-slate-200">
                          Source: {selectedLead.source || 'Direct'}
                        </span>
                      )}
                    </div>
                    {isEditingLead ? (
                      <input
                        type="text"
                        required
                        value={editLeadForm.name}
                        onChange={(e) => setEditLeadForm(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3.5 py-1.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm w-full mt-1"
                      />
                    ) : (
                      <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">{selectedLead.name}</h2>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedLead(null); setIsEditingLead(false); }} 
                  className="w-9 h-9 rounded-2xl bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                  title="Close Profile"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Status & Next Follow-Up Date Ribbon */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3 shadow-3xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Lifecycle Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border inline-block mt-0.5 ${STATUS_CONFIG[selectedLead.status]?.color}`}>
                      {STATUS_CONFIG[selectedLead.status]?.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingLead ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleEditSubmit}
                          disabled={editLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {editLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setIsEditingLead(false)}
                          className="px-3.5 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-all shadow-3xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEnterEditMode(selectedLead)}
                          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs rounded-xl border border-amber-200 transition-all shadow-3xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={() => { setTargetStatus(selectedLead.status || 'QUALIFIED'); setStatusChangeModal(true); }}
                          className="px-3.5 py-2 bg-brand-soft hover:bg-brand-primary text-slate-905 border border-brand-secondary/40 font-extrabold text-xs rounded-xl transition-all shadow-3xs cursor-pointer"
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
                      </>
                    )}
                  </div>
                </div>

                {/* Follow-up Date Scheduler Ribbon */}
                <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-600" />
                      <span>Next Scheduled Follow-Up Date</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {isEditingLead ? (
                        <input
                          type="date"
                          value={editLeadForm.nextFollowUpDate}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, nextFollowUpDate: e.target.value }))}
                          className="px-3 py-1 border-2 border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-805 focus:outline-none"
                        />
                      ) : (
                        <>
                          {selectedLead.nextFollowUpDate ? (
                            <span className="text-xs font-extrabold text-slate-900">
                              {new Date(selectedLead.nextFollowUpDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 italic">No follow-up date scheduled</span>
                          )}

                          {(() => {
                            if (!selectedLead.nextFollowUpDate) return null;
                            const target = new Date(selectedLead.nextFollowUpDate);
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            target.setHours(0,0,0,0);
                            const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) {
                              return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-black rounded-md">Overdue ({Math.abs(diffDays)} days)</span>;
                            } else if (diffDays === 0) {
                              return <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black rounded-md animate-pulse">Due Today</span>;
                            } else {
                              return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black rounded-md">Due in {diffDays} days</span>;
                            }
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Details Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                {/* Card 1: Contact & Owner Info */}
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2 shadow-3xs">
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Contact & Owner Info</span>
                  {isEditingLead ? (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wider mb-0.5">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editLeadForm.phone}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border-2 border-slate-305 rounded-xl bg-white text-slate-905 font-mono font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wider mb-0.5">Email Address</label>
                        <input
                          type="email"
                          value={editLeadForm.email}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border-2 border-slate-305 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wider mb-0.5">Rep Owner</label>
                        <select
                          value={editLeadForm.assignedTo}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border-2 border-slate-305 rounded-xl bg-white text-slate-900 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="">Unassigned (General Pool)</option>
                          {users.map(u => {
                            const roleDisplay = typeof u.role === 'object' ? (u.role?.roleName || u.role?.roleCode || u.role?.name || 'Staff') : (u.roleId?.roleName || u.role || u.designation || 'Staff');
                            return (
                              <option key={u._id || u.id} value={u._id || u.id}>
                                {u.name} ({roleDisplay})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-indigo-600" />
                        <a href={`tel:${selectedLead.phone}`} className="hover:underline text-slate-900">{selectedLead.phone}</a>
                      </div>
                      <div className="text-slate-600 font-medium flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <a href={`mailto:${selectedLead.email}`} className="truncate hover:underline text-slate-700">{selectedLead.email || 'No email provided'}</a>
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-200/50 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Owner: {selectedLead.assignedTo?.name || 'Bhakti'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Card 2: Project & Estimated Value */}
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2 shadow-3xs">
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block">Project & Estimated Value</span>
                  {isEditingLead ? (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wider mb-0.5">Project Type</label>
                        <select
                          value={editLeadForm.projectType}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, projectType: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border-2 border-slate-305 rounded-xl bg-white text-slate-900 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="Residential Project">Residential Project</option>
                          <option value="Commercial Design">Commercial Design</option>
                          <option value="Interior Walkthrough">Interior Walkthrough</option>
                          <option value="Landscape Design">Landscape Design</option>
                          <option value="Urban Planning">Urban Planning</option>
                          <option value="Valuation/Liaison">Valuation / Liaison</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wider mb-0.5">Estimated Value (INR)</label>
                        <input
                          type="number"
                          value={editLeadForm.amount}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border-2 border-slate-305 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wider mb-0.5">Priority Tag</label>
                        <select
                          value={editLeadForm.priorityTag}
                          onChange={(e) => setEditLeadForm(prev => ({ ...prev, priorityTag: e.target.value }))}
                          className="w-full px-2.5 py-1.5 border-2 border-slate-305 rounded-xl bg-white text-slate-900 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="Hot Lead">🔥 Hot Lead</option>
                          <option value="High Priority">⚡ High Priority</option>
                          <option value="Warm Lead">✨ Warm Lead</option>
                          <option value="Cold Lead">❄️ Cold Lead</option>
                          <option value="Interested">👍 Interested</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{selectedLead.projectType || 'Residential Project'}</span>
                      </div>
                      <div className="text-emerald-700 font-black text-sm flex items-center justify-between">
                        <span>{formatCurrency(selectedLead.amount)}</span>
                        {selectedLead.priorityTag && (
                          <span className="px-2 py-0.5 bg-brand-soft text-[9px] text-brand-dark rounded-md border border-brand-secondary/30">
                            {selectedLead.priorityTag}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Requirement Notes Panel */}
              <div className="p-4 bg-brand-soft/70 rounded-2xl border border-brand-secondary/30 text-xs space-y-1 shadow-3xs">
                <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest block">Requirement Notes & Client Preferences</span>
                {isEditingLead ? (
                  <textarea
                    rows="3"
                    value={editLeadForm.requirementNotes}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, requirementNotes: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-slate-305 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none"
                    placeholder="Describe design preferences, styling choices, requirements..."
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed font-semibold">{selectedLead.requirementNotes || 'No specific notes recorded.'}</p>
                )}
              </div>

              {/* Log Touchpoint Interaction & Schedule Follow-Up Form */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Log Touchpoint & Schedule Next Follow-Up</span>
                </h4>
                <form onSubmit={handleLogInteractionSubmit} className="space-y-3 text-xs">
                  <div className="flex gap-2 flex-wrap items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {['Call', 'Meeting', 'Email', 'Note'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setInteractionForm({ ...interactionForm, type: t })}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                            interactionForm.type === t 
                              ? 'bg-brand-primary text-slate-900 border-brand-secondary/60 shadow-3xs font-black' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {t === 'Call' ? '📞 Call' : t === 'Meeting' ? '🤝 Meeting' : t === 'Email' ? '✉️ Email' : '📝 Note'}
                        </button>
                      ))}
                    </div>

                    {/* Next Follow Up Date input in form */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Set Follow-Up:</span>
                      <input
                        type="date"
                        value={interactionForm.nextFollowUpDate || ''}
                        onChange={(e) => setInteractionForm({ ...interactionForm, nextFollowUpDate: e.target.value })}
                        className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
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
                    className="w-full py-2.5 crm-brand-btn-accent text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    {interactionSubmitting ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                    <span>Save Touchpoint & Schedule Follow-Up</span>
                  </button>
                </form>
              </div>

              {/* Chronological Interactions Timeline */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Interactions & Touchpoints Log ({interactions.length})</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                  {interactions.length > 0 ? (
                    interactions.map(item => (
                      <div key={item._id} className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs space-y-1 shadow-3xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-lg text-[10px]">
                            {item.type === 'Call' ? '📞 Call' : item.type === 'Meeting' ? '🤝 Meeting' : item.type === 'Email' ? '✉️ Email' : '📝 Note'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.loggedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium mt-1 leading-relaxed">{item.notes}</p>
                        <div className="text-[10px] text-slate-400 font-semibold pt-0.5">Logged by: {item.loggedBy?.name || 'Staff User'}</div>
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
                  <span>Lifecycle Status Audit Trail ({statusHistory.length})</span>
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
                        {new Date(h.changedAt || Date.now()).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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
                    {users.map(u => {
                      const roleDisplay = typeof u.role === 'object' ? (u.role?.roleName || u.role?.roleCode || u.role?.name || 'Staff') : (u.roleId?.roleName || u.role || u.designation || 'Staff');
                      return (
                        <option key={u._id || u.id} value={u._id || u.id}>
                          {u.name} ({roleDisplay})
                        </option>
                      );
                    })}
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

      {/* 11. DRAWER / MODAL: DUE FOLLOW-UPS RIGHT SLIDE-OVER */}
      {showDueDrawer && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-200"
          onClick={() => setShowDueDrawer(false)}
        >
          <div 
            className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto p-6 space-y-5 flex flex-col justify-between font-sans transform transition-all duration-300 ease-out animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200/80">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Scheduled Follow-Ups</h2>
                    <p className="text-slate-500 text-xs font-semibold">Date-wise pending calls, meetings & client touchpoints ({dueFollowUpLeads.length})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDueDrawer(false)}
                  className="w-9 h-9 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* List of Due Follow-Up Leads */}
              <div className="space-y-3 pt-2">
                {dueFollowUpLeads.length > 0 ? (
                  dueFollowUpLeads.map(lead => {
                    const target = new Date(lead.nextFollowUpDate);
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    target.setHours(0,0,0,0);
                    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
                    
                    let statusBadge = { label: `Due in ${diffDays} days`, style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
                    if (diffDays < 0) {
                      statusBadge = { label: `Overdue (${Math.abs(diffDays)} days)`, style: 'bg-rose-50 text-rose-800 border-rose-200' };
                    } else if (diffDays === 0) {
                      statusBadge = { label: 'Due Today', style: 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold animate-pulse' };
                    }

                    return (
                      <div
                        key={lead._id || lead.id}
                        onClick={() => {
                          setShowDueDrawer(false);
                          handleOpenLeadDetails(lead._id || lead.id);
                        }}
                        className="p-4 bg-slate-50/90 hover:bg-brand-soft/70 border border-slate-200/90 hover:border-brand-secondary/60 rounded-2xl transition-all cursor-pointer space-y-2 shadow-3xs group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-extrabold text-sm group-hover:text-indigo-700 transition-colors">{lead.name}</strong>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${statusBadge.style}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {new Date(lead.nextFollowUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{lead.projectType || 'Residential'}</span>
                          </div>
                        </div>

                        {lead.requirementNotes && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic pt-1 border-t border-slate-200/60">
                            "{lead.requirementNotes}"
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    No follow-ups due matching current filter criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. CLIENT CONVERSION FORM MODAL (WON LEAD ACTION) */}
      {showClientCreateModal && clientFormLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto text-xs text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Create Client Account</h3>
                <p className="text-[10px] text-slate-500">
                  Pre-filled from converted lead inquiry details
                </p>
              </div>
              <button 
                onClick={() => setShowClientCreateModal(false)}
                className="text-slate-400 hover:text-slate-650 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {clientFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{clientFormError}</span>
              </div>
            )}

            <form onSubmit={handleClientFormSubmit} className="space-y-4 font-medium text-slate-700">
              
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">
                  1. Client Account Master Details
                </span>

                <div>
                  <label className="block text-slate-750 font-bold mb-1">Company / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wayne Enterprises"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-750 font-bold mb-1">Legal Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Wayne Enterprises Ltd."
                      value={clientFormData.companyName}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-750 font-bold mb-1">Company Phone * (10 Digits)</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={clientFormData.phone}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-mono font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-750 font-bold mb-1">Company Email</label>
                  <input
                    type="email"
                    placeholder="e.g. info@company.com"
                    value={clientFormData.email}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 space-y-3">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">
                  2. Primary Contact Person (Assigned OWNER Permission)
                </span>

                <div>
                  <label className="block text-slate-750 font-bold mb-1">Primary Contact Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bruce Wayne"
                    value={clientFormData.primaryContactName}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-750 font-bold mb-1">Portal Login Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="bruce@waynecorp.com"
                      value={clientFormData.primaryContactEmail}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-750 font-bold mb-1">Contact Phone (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={clientFormData.primaryContactPhone}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, primaryContactPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-750 font-bold mb-1">Billing Address</label>
                  <textarea
                    rows="2"
                    placeholder="HQ registered address"
                    value={clientFormData.billingAddress}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, billingAddress: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-750 font-bold mb-1">Site Address</label>
                  <textarea
                    rows="2"
                    placeholder="Project site location"
                    value={clientFormData.siteAddress}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClientCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clientFormSubmitting}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {clientFormSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  Register Client & Mark Won
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. CLIENT PASSWORD DISPLAY MODAL */}
      {tempPasswordResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs text-center">
            
            <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900">Lead Converted to WON!</h3>
            <p className="text-slate-500 text-xs font-semibold">
              Client profile <strong>{tempPasswordResult.clientName}</strong> registered successfully.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Login Username / Email</span>
                <span className="font-semibold text-slate-950 font-mono text-xs">{tempPasswordResult.primaryContactEmail}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Temporary Password</span>
                <span className="font-mono bg-indigo-50 border border-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-xs font-black inline-block mt-0.5 select-all">
                  {tempPasswordResult.tempPassword}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-150 flex items-center justify-end">
              <button
                onClick={() => {
                  const client = tempPasswordResult.clientObj;
                  setTempPasswordResult(null);
                  setShowClientCreateModal(false);
                  if (onClientCreated && client) {
                    onClientCreated(client);
                  }
                }}
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold rounded-xl text-xs cursor-pointer shadow-xs w-full"
              >
                Go to Client Profile Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
