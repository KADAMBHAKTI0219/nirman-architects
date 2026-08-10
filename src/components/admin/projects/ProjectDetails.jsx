import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Calendar, MapPin, Users, ShieldAlert, FileText, CheckCircle2,
  Clock, Send, HelpCircle, Building, Eye, EyeOff, Plus, Trash2, Link as LinkIcon, RefreshCw, UserCheck, Check, X
} from 'lucide-react';
import Card from '../../common/Card';
import ClientCommunication from '../../project-manager/client-communication/index';
import { getCompanyLeaves } from '../../../service/hrm/leave';
import { getUsersList } from '../../../service/auth';
import {
  getLinksByProject,
  createClientProjectLink,
  toggleProjectLinkVisibility,
  unlinkProject,
  getClients
} from '../../../service/crm/client';
import {
  updateProjectStatus,
  getProjectStatusHistory,
  addMilestone,
  completeMilestone,
  updateMilestone,
  deleteMilestone,
  updateProjectProgress,
  assignTeamMember,
  removeTeamMember,
  addResponsibilityMatrix,
  getResponsibilityMatrix,
  getProgressBreakdown
} from '../../../service/project';
import { getProjectDrawings, createDrawing, uploadDrawingVersion } from '../../../service/drawing';
import { getProjectFolders, getProjectDocuments, uploadDocument, updateDocumentVisibility } from '../../../service/document';
import { getTasks, createTask } from '../../../service/task';
import DrawingCreateModal from '../drawings/DrawingCreateModal';
import DocumentUploadModal from '../documents/DocumentUploadModal';
import DocumentAccessLogModal from '../documents/DocumentAccessLogModal';
import TaskCreateModal from '../tasks/TaskCreateModal';

export default function ProjectDetails({
  project,
  onBack,
  onUpdateProject,
  onApproveDrawing,
  defaultTab = 'overview'
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().split('T')[0];
    } catch (e) {
      return dateStr;
    }
  };

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [chatInput, setChatInput] = useState('');
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loadingTeamLeaves, setLoadingTeamLeaves] = useState(false);

  // CRM Module 3: Client-Project Linkage State
  const [clientLinks, setClientLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const [showAddClientLinkModal, setShowAddClientLinkModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [linkVisibility, setLinkVisibility] = useState(true);
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  // ERP Module 1: Project Management States
  const [statusHistory, setStatusHistory] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusVal, setNewStatusVal] = useState(project.status || 'In Progress');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Milestones
  const [milestonesList, setMilestonesList] = useState(project.milestones || []);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', targetDate: '' });

  // RACI & Team
  const [raciList, setRaciList] = useState(project.responsibilityMatrix || []);
  const [showRaciModal, setShowRaciModal] = useState(false);
  const [raciForm, setRaciForm] = useState({ area: '', responsible: '', accountable: '' });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', memberName: '', projectRole: 'Architect' });
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingSystemUsers, setLoadingSystemUsers] = useState(false);

  // Overall Progress Update Modal State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressVal, setProgressVal] = useState(project.progressPercentage ?? project.progressPercent ?? project.progress ?? 0);
  const [progressOverride, setProgressOverride] = useState(project.progressIsManualOverride || false);
  const [progressSubmitting, setProgressSubmitting] = useState(false);

  // ERP Module 3: Drawing Management State
  const [projectDrawingsList, setProjectDrawingsList] = useState(project.drawings || []);
  const [loadingProjectDrawings, setLoadingProjectDrawings] = useState(false);
  const [isUploadDrawingModalOpen, setIsUploadDrawingModalOpen] = useState(false);

  // ERP Module 2: Project Tasks State
  const [projectTasksList, setProjectTasksList] = useState(project.tasks || []);
  const [loadingProjectTasks, setLoadingProjectTasks] = useState(false);
  const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setProgressVal(project.progressPercentage ?? project.progressPercent ?? project.progress ?? 0);
      setProgressOverride(project.progressIsManualOverride || false);
      if (Array.isArray(project.drawings)) setProjectDrawingsList(project.drawings);
      if (Array.isArray(project.tasks)) setProjectTasksList(project.tasks);
    }
  }, [project]);

  const projectId = project ? (project.id || project._id || project.code || 'proj-1') : null;

  const fetchProjectTasksList = async () => {
    if (!projectId) return;
    setLoadingProjectTasks(true);
    try {
      const res = await getTasks({ projectId });
      let list = [];
      if (res?.tasks && Array.isArray(res.tasks)) list = res.tasks;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res)) list = res;

      const filtered = list.filter(t => {
        const pId = typeof t.projectId === 'object' && t.projectId !== null ? (t.projectId._id || t.projectId.id) : t.projectId;
        return pId === projectId || t.project === project.name || t.projectName === project.name;
      });

      if (filtered.length > 0) {
        setProjectTasksList(filtered);
      } else if (list.length > 0) {
        setProjectTasksList(list);
      }
    } catch (err) {
      console.warn("Failed to fetch project tasks list", err);
    } finally {
      setLoadingProjectTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchProjectTasksList();
    }
  }, [activeTab, projectId]);

  const fetchProjectDrawingsList = async () => {
    if (!projectId) return;
    setLoadingProjectDrawings(true);
    try {
      const res = await getProjectDrawings(projectId);
      let list = [];
      if (res?.drawings && res.drawings.length > 0) list = res.drawings;
      else if (res?.allDrawings && res.allDrawings.length > 0) list = res.allDrawings;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res)) list = res;

      if (list.length > 0) {
        setProjectDrawingsList(list);
      } else if (Array.isArray(project.drawings) && project.drawings.length > 0) {
        setProjectDrawingsList(project.drawings);
      }
    } catch (err) {
      console.warn("Failed to fetch project drawings list", err);
    } finally {
      setLoadingProjectDrawings(false);
    }
  };

  const handleUploadProjectDrawingSubmit = async (formData) => {
    try {
      const createRes = await createDrawing({
        projectId: projectId,
        drawingName: formData.name,
        categoryId: formData.categoryId || 'cat-working',
        drawingNumber: `DWG-${String((projectDrawingsList || []).length + 1).padStart(3, '0')}`
      });

      const newDrg = createRes?.drawing || createRes?.data?.drawing;
      if (newDrg) {
        await uploadDrawingVersion(newDrg._id || newDrg.id, {
          filePath: formData.fileUrl,
          fileType: 'DWG',
          changeLog: formData.changeLog || 'Initial project blueprint upload'
        });

        alert(`Blueprint "${formData.name}" uploaded successfully for this project!`);
      }

      setIsUploadDrawingModalOpen(false);
      fetchProjectDrawingsList();
    } catch (err) {
      console.warn("Notice uploading project drawing:", err);
      setIsUploadDrawingModalOpen(false);
      fetchProjectDrawingsList();
    }
  };

  // ERP Module 6: Document Management State for Tabs
  const [tabProjectFolders, setTabProjectFolders] = useState([]);
  const [tabProjectDocs, setTabProjectDocs] = useState([]);
  const [loadingTabDocs, setLoadingTabDocs] = useState(false);
  const [selectedTabFolder, setSelectedTabFolder] = useState('All');
  const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState(false);
  const [selectedAuditDoc, setSelectedAuditDoc] = useState(null);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);

  const fetchTabProjectDocuments = async () => {
    if (!projectId) return;
    setLoadingTabDocs(true);
    try {
      const [foldersRes, docsRes] = await Promise.all([
        getProjectFolders(projectId),
        getProjectDocuments(projectId)
      ]);
      if (foldersRes && (foldersRes.folders || foldersRes.data)) {
        setTabProjectFolders(foldersRes.folders || foldersRes.data || []);
      }
      if (docsRes && (docsRes.allDocuments || docsRes.documents)) {
        setTabProjectDocs(docsRes.allDocuments || docsRes.documents || []);
      } else if (Array.isArray(project.documents) && project.documents.length > 0) {
        setTabProjectDocs(project.documents);
      }
    } catch (err) {
      console.warn("Failed to fetch project tab documents", err);
    } finally {
      setLoadingTabDocs(false);
    }
  };

  const handleUploadTabDocSubmit = async (formData) => {
    try {
      const payload = {
        projectId: projectId,
        folderId: formData.folderId || null,
        documentName: formData.name || formData.documentName || formData.fileName || 'Untitled Document.pdf',
        fileName: formData.name || formData.fileName || 'Untitled Document.pdf',
        filePath: formData.filePath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: formData.type || 'PDF',
        fileSizeKB: formData.fileSizeKB || 1800,
        category: formData.category || formData.folder || 'Other Shared Documents',
        visibleToClient: formData.visibleToClient === true ? true : false
      };
      await uploadDocument(payload);
      alert(`Document "${payload.documentName}" uploaded successfully into project!`);
      setIsDocUploadModalOpen(false);
      fetchTabProjectDocuments();
    } catch (e) {
      setIsDocUploadModalOpen(false);
      fetchTabProjectDocuments();
    }
  };

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeamLeaves();
      fetchRaciMatrix();
      fetchSystemUsers();
    } else if (activeTab === 'clients') {
      fetchProjectClientLinks();
      fetchAvailableClients();
    } else if (activeTab === 'timeline') {
      fetchStatusHistoryLogs();
    } else if (activeTab === 'drawings') {
      fetchProjectDrawingsList();
    } else if (activeTab === 'documents') {
      fetchTabProjectDocuments();
    }
  }, [activeTab, projectId]);

  const fetchSystemUsers = async () => {
    setLoadingSystemUsers(true);
    try {
      const res = await getUsersList();
      if (res && res.success && Array.isArray(res.users)) {
        setSystemUsers(res.users);
        if (res.users.length > 0) {
          const first = res.users[0];
          const firstRole = typeof first.role === 'string' ? first.role : (typeof first.roleName === 'string' ? first.roleName : (first.role && typeof first.role === 'object' ? (first.role.roleName || first.role.name || first.role.roleCode || 'Architect') : 'Architect'));
          const firstName = typeof first.name === 'string' ? first.name : (typeof first.fullName === 'string' ? first.fullName : (typeof first.email === 'string' ? first.email : 'Team Member'));
          setAssignForm({
            userId: first._id || first.id,
            memberName: firstName,
            projectRole: firstRole
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch system users for team assignment:", err);
    } finally {
      setLoadingSystemUsers(false);
    }
  };

  const fetchStatusHistoryLogs = async () => {
    if (!projectId) return;
    try {
      const res = await getProjectStatusHistory(projectId);
      if (res?.success) setStatusHistory(res.history || []);
    } catch (err) {
      console.warn("Failed to fetch status history", err);
    }
  };

  const fetchRaciMatrix = async () => {
    if (!projectId) return;
    try {
      const res = await getResponsibilityMatrix(projectId);
      if (res?.success && Array.isArray(res.matrix)) setRaciList(res.matrix);
    } catch (err) {
      console.warn("Failed to fetch RACI matrix", err);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatusVal) return;
    setStatusSubmitting(true);
    try {
      const res = await updateProjectStatus(projectId, newStatusVal, statusNotes);
      if (res?.success) {
        onUpdateProject({ ...project, status: newStatusVal });
        setShowStatusModal(false);
        setStatusNotes('');
        fetchStatusHistoryLogs();
        alert(`Project status updated to "${newStatusVal}" successfully!`);
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    const pNum = Math.min(100, Math.max(0, parseInt(progressVal) || 0));
    setProgressSubmitting(true);
    try {
      const res = await updateProjectProgress(projectId, {
        progressPercentage: pNum,
        progressIsManualOverride: progressOverride
      });
      if (res?.success) {
        onUpdateProject({
          ...project,
          progressPercentage: pNum,
          progressPercent: pNum,
          progress: pNum,
          progressIsManualOverride: progressOverride
        });
        setShowProgressModal(false);
        alert(`Overall Project Progress updated to ${pNum}% successfully!`);
      } else {
        alert(res?.message || "Failed to update project progress.");
      }
    } catch (err) {
      alert("Error updating progress: " + (err.message || "Unknown error"));
    } finally {
      setProgressSubmitting(false);
    }
  };

  const handleAddMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!milestoneForm.name || !milestoneForm.targetDate) return;
    const progressPercentage = milestoneForm.progressPercentage ? parseInt(milestoneForm.progressPercentage) : 50;
    const payload = {
      name: milestoneForm.name.trim(),
      targetDate: milestoneForm.targetDate,
      progressPercentage: progressPercentage,
      description: milestoneForm.description || ''
    };

    try {
      const res = await addMilestone(projectId, payload);
      if (res?.success && Array.isArray(res.milestones)) {
        setMilestonesList(res.milestones);
        onUpdateProject({ ...project, milestones: res.milestones, progressPercentage: res.progressPercentage || project.progressPercentage });
      } else {
        const newMs = { _id: `m-${Date.now()}`, ...payload, isCompleted: false, status: 'IN_PROGRESS' };
        const updated = [...milestonesList, newMs];
        setMilestonesList(updated);
        onUpdateProject({ ...project, milestones: updated });
      }
      setMilestoneForm({ name: '', targetDate: '', progressPercentage: 50, description: '' });
      setShowAddMilestone(false);
    } catch (err) {
      console.warn("Notice adding milestone via backend:", err);
      const newMs = { _id: `m-${Date.now()}`, ...payload, isCompleted: false, status: 'IN_PROGRESS' };
      const updated = [...milestonesList, newMs];
      setMilestonesList(updated);
      onUpdateProject({ ...project, milestones: updated });
      setMilestoneForm({ name: '', targetDate: '', progressPercentage: 50, description: '' });
      setShowAddMilestone(false);
    }
  };

  const handleToggleMilestoneStatus = async (m) => {
    const mId = m._id || m.id;
    const isCurrentlyDone = m.isCompleted || m.status === 'COMPLETED' || m.progressPercentage === 100;
    const nextCompleted = !isCurrentlyDone;

    try {
      let res;
      if (nextCompleted) {
        res = await completeMilestone(projectId, mId);
      } else {
        res = await updateMilestone(projectId, mId, { isCompleted: false, status: 'IN_PROGRESS', progressPercentage: 50 });
      }

      let updatedMs;
      if (res?.success && Array.isArray(res.milestones)) {
        updatedMs = res.milestones;
      } else {
        updatedMs = milestonesList.map(item => {
          if ((item._id && item._id === mId) || (item.id && item.id === mId) || (item.name === m.name && item.targetDate === m.targetDate)) {
            return {
              ...item,
              isCompleted: nextCompleted,
              status: nextCompleted ? 'COMPLETED' : 'IN_PROGRESS',
              progressPercentage: nextCompleted ? 100 : 50,
              completedDate: nextCompleted ? new Date().toISOString().split('T')[0] : null
            };
          }
          return item;
        });
      }

      setMilestonesList(updatedMs);
      onUpdateProject({ ...project, milestones: updatedMs });
    } catch (err) {
      console.warn("Notice toggling milestone status:", err);
      const updatedMs = milestonesList.map(item => {
        if ((item._id && item._id === mId) || (item.id && item.id === mId) || (item.name === m.name && item.targetDate === m.targetDate)) {
          return {
            ...item,
            isCompleted: nextCompleted,
            status: nextCompleted ? 'COMPLETED' : 'IN_PROGRESS',
            progressPercentage: nextCompleted ? 100 : 50,
            completedDate: nextCompleted ? new Date().toISOString().split('T')[0] : null
          };
        }
        return item;
      });
      setMilestonesList(updatedMs);
      onUpdateProject({ ...project, milestones: updatedMs });
    }
  };

  const handleDeleteMilestoneClick = async (m) => {
    const mId = m._id || m.id;
    if (!window.confirm(`Delete milestone "${m.name}"?`)) return;
    try {
      if (mId && !mId.startsWith('m-')) {
        await deleteMilestone(projectId, mId);
      }
    } catch (err) {
      console.warn("Notice deleting milestone from API:", err);
    }
    const updatedMs = milestonesList.filter(item => {
      if (mId) return item._id !== mId && item.id !== mId;
      return item.name !== m.name || item.targetDate !== m.targetDate;
    });
    setMilestonesList(updatedMs);
    onUpdateProject({ ...project, milestones: updatedMs });
  };

  const handleAssignTeamSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.projectRole) return;
    try {
      const res = await assignTeamMember(projectId, { userId: assignForm.userId, projectRole: assignForm.projectRole });
      if (res?.success) {
        onUpdateProject({ ...project, team: [...(project.team || []), { name: assignForm.memberName, role: assignForm.projectRole, dept: 'Engineering', userId: assignForm.userId }] });
        setShowAssignModal(false);
      } else {
        alert(res?.message || "Failed to assign team member");
      }
    } catch (err) {
      alert("Failed to assign team member: " + (err.message || "Error"));
    }
  };

  const handleAddRaciSubmit = async (e) => {
    e.preventDefault();
    if (!raciForm.area) return;
    try {
      const res = await addResponsibilityMatrix(projectId, raciForm);
      if (res?.success) {
        setRaciList(res.matrix || [...raciList, { _id: `raci-${Date.now()}`, ...raciForm }]);
        setShowRaciModal(false);
        setRaciForm({ area: '', responsible: '', accountable: '' });
      }
    } catch (err) {
      alert("Failed to add RACI entry");
    }
  };

  const loadTeamLeaves = async () => {
    try {
      setLoadingTeamLeaves(true);
      const res = await getCompanyLeaves({ projectId: projectId });
      if (res && Array.isArray(res)) {
        setTeamLeaves(res);
      } else if (res && res.data && Array.isArray(res.data)) {
        setTeamLeaves(res.data);
      } else {
        setTeamLeaves([]);
      }
    } catch (err) {
      console.warn("Failed to load project team leaves", err);
      setTeamLeaves([]);
    } finally {
      setLoadingTeamLeaves(false);
    }
  };

  const fetchProjectClientLinks = async () => {
    if (!projectId) return;
    setLoadingLinks(true);
    try {
      const res = await getLinksByProject(projectId);
      if (res?.success) {
        setClientLinks(res.links || []);
      }
    } catch (err) {
      console.error("Error fetching project client links:", err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleCreateTaskSubmit = async (taskPayload) => {
    try {
      const res = await createTask({
        ...taskPayload,
        projectId: projectId
      });
      if (res?.success || res?.task) {
        const newTask = res.task || res.data?.task || res.data;
        if (newTask) {
          setProjectTasksList(prev => [newTask, ...prev]);
        }
        alert("Task created successfully.");
        fetchProjectTasksList();
      } else {
        alert(res?.message || "Failed to create task.");
      }
    } catch (err) {
      alert("Error creating task: " + err.message);
    } finally {
      setIsTaskCreateModalOpen(false);
    }
  };

  const fetchAvailableClients = async () => {
    try {
      const res = await getClients({});
      if (res?.success) {
        setAllClients(res.clients || []);
        if ((res.clients || []).length > 0) {
          setSelectedClientId(res.clients[0]._id || res.clients[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching clients list:", err);
    }
  };

  const handleCreateLinkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientId) return;
    setLinkSubmitting(true);
    try {
      const selectedClientObj = allClients.find(c => (c._id === selectedClientId || c.id === selectedClientId));
      const res = await createClientProjectLink({
        clientId: selectedClientId,
        projectId: projectId,
        projectName: project.name,
        visibleToClient: linkVisibility
      });
      if (res?.success) {
        alert(res.message || "Project successfully linked to Client account.");
        setShowAddClientLinkModal(false);
        fetchProjectClientLinks();
      } else {
        alert(res?.message || "Failed to link client.");
      }
    } catch (err) {
      alert(err.message || "Error linking client.");
    } finally {
      setLinkSubmitting(false);
    }
  };

  const handleToggleLinkVisibility = async (linkId, currentVis) => {
    try {
      const res = await toggleProjectLinkVisibility(linkId, !currentVis);
      if (res?.success) {
        fetchProjectClientLinks();
      } else {
        alert(res?.message || "Failed to toggle visibility.");
      }
    } catch (err) {
      alert(err.message || "Error toggling visibility.");
    }
  };

  const handleUnlinkProject = async (linkId, clientName) => {
    const notes = await window.prompt(`Unlink Client "${clientName}" from project "${project.name}"?\nEnter audit reason/notes:`, "", "Unlink Project Audit");
    if (notes === null) return;
    try {
      const res = await unlinkProject(linkId, notes);
      if (res?.success) {
        alert(res.message || "Client unlinked successfully.");
        fetchProjectClientLinks();
      } else {
        alert(res?.message || "Failed to unlink client.");
      }
    } catch (err) {
      alert(err.message || "Error unlinking client.");
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const updatedChats = [
      ...(project.chats || []),
      { sender: "Super Admin", message: chatInput, time: "Just now" }
    ];
    onUpdateProject({ ...project, chats: updatedChats });
    setChatInput('');
  };

  const handleWorkflowApprove = (dwgCode) => {
    onApproveDrawing(dwgCode);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800">

      {/* 0. GLASSMORPHIC TOP HEADER */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-slate-100 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-all shadow-3xs cursor-pointer"
              title="Return to Projects Directory"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-brand-soft text-slate-800 border border-brand-secondary/40 rounded-md text-[10px] font-medium uppercase tracking-wider">
                  {project.code || 'PRJ'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {(project.projectCategoryId && typeof project.projectCategoryId === 'object') ? project.projectCategoryId.name : (project.category || 'General')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug mt-1">
                {project.name || 'Project Overview'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-3.5 py-1.5 rounded-full font-medium uppercase tracking-wider border flex items-center gap-1.5 shadow-3xs ${
              project.delayFlag 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${project.delayFlag ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
              {project.delayFlag ? 'At Risk / Delayed' : 'Active / On Schedule'}
            </span>
          </div>
        </div>

        {/* 1. PILL NAVIGATION TAB BAR */}
        <div className="flex border-t border-slate-100 pt-3 overflow-x-auto gap-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'timeline', label: 'Timeline & Milestones' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'drawings', label: 'Drawings & GFC' },
            { id: 'clients', label: `Linked Clients (${clientLinks.length})` },
            { id: 'team', label: 'Team Matrix' },
            { id: 'documents', label: 'Documents' },
            { id: 'chat', label: 'Client Chat' },
            { id: 'approvals', label: `Approvals (${project.pendingApprovals || 0})` },
            { id: 'reports', label: 'Visual Reports' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 px-4 rounded-xl text-xs font-medium tracking-tight transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'bg-brand-primary text-slate-900 shadow-2xs ring-1 ring-brand-secondary/50 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TAB PANELS CONTAINER */}
      <div className="space-y-6">

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Executive Summary & Project Specs Grid */}
            <div className="lg:col-span-2 space-y-6">
              
              <Card title="Executive Project Summary" subtitle="Scope description and general contractor charter">
                <div className="space-y-4 text-xs">
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {project.description || project.summary || `Project technical specifications and contractor operational charter for ${project.name || 'this project'}. Operations span structural planning, MEP engineering, CAD drawing sign-offs, and high-fidelity site execution.`}
                  </p>
                  {project.delayFlag && (
                    <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-rose-900 font-semibold text-xs block">Schedule Risk Warning</span>
                        <p className="text-rose-700 text-xs mt-0.5 leading-normal font-normal">
                          {project.delayReason || 'Milestone target dates are experiencing delay risks.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* 2-Column Specification Grid */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Project Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Project Category</span>
                    <span className="text-slate-800 block text-xs font-normal">
                      {(project.projectCategoryId && typeof project.projectCategoryId === 'object') ? project.projectCategoryId.name : (project.category || 'N/A')}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Site Location</span>
                    <span className="text-slate-800 block text-xs font-normal">{project.address || project.location || 'N/A'}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Client Organization</span>
                    <span className="text-slate-800 block text-xs font-normal">{project.clientInformation || project.client || 'N/A'}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Lead Project Manager</span>
                    <span className="text-slate-800 block text-xs font-normal">
                      {project.createdBy?.name || project.manager || 'Unassigned'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Start Date</span>
                    <span className="text-slate-800 block text-xs font-normal">{formatDate(project.startDate)}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Target Completion</span>
                    <span className="text-slate-800 block text-xs font-normal">{formatDate(project.estimatedCompletion || project.estCompletion)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 Column: Health & Progress Cards */}
            <div className="space-y-6">
              <Card title="Project Health Metrics">
                <div className="space-y-4 text-xs font-normal">
                  
                  {/* Overall Progress Gauge */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Overall Progress</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-900">{project.progressPercentage ?? project.progressPercent ?? project.progress ?? 0}%</span>
                        <button
                          onClick={() => setShowProgressModal(true)}
                          className="px-2.5 py-1 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold text-[10px] rounded-lg shadow-3xs transition-all cursor-pointer border border-brand-secondary/40"
                          title="Update Overall Progress"
                        >
                          Update Progress
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-secondary to-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${project.progressPercentage ?? project.progressPercent ?? project.progress ?? 0}%` }}></div>
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-medium uppercase block">Health Score</span>
                      <span className="text-lg font-semibold text-emerald-900">
                        {Math.min(100, Math.max(0, Math.round(((project.progressPercentage || project.progress || 0) * 0.8) + 20)))} / 100
                      </span>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>

                  {/* Manager Avatar Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">
                      {((project.createdBy?.name || project.manager || 'PM').split(' ').map(n=>n[0]).join('')).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase block">Project Manager</span>
                      <span className="text-slate-800 block text-xs font-normal">{project.createdBy?.name || project.manager || 'Unassigned'}</span>
                    </div>
                  </div>

                </div>
              </Card>
            </div>

          </div>
        )}

        {/* CRM MODULE 3: LINKED CLIENTS PANEL */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Linked Client Accounts</h3>
                <p className="text-xs text-slate-500">Manage client access, visibility controls, and multi-client project links</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchProjectClientLinks}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Refresh Client Links"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLinks ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowAddClientLinkModal(true)}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-brand-dark" /> Link Client Account
                </button>
              </div>
            </div>

            {/* Client Links Ledger Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider whitespace-nowrap">
                      <th className="px-5 py-4">Client Account Name</th>
                      <th className="px-5 py-4">Company Name</th>
                      <th className="px-5 py-4">Contact Email</th>
                      <th className="px-5 py-4">Linked Date</th>
                      <th className="px-5 py-4">Portal Visibility</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loadingLinks ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                          <span>Loading linked client accounts...</span>
                        </td>
                      </tr>
                    ) : clientLinks.length > 0 ? (
                      clientLinks.map(link => {
                        const clientObj = link.clientId || {};
                        const clientName = clientObj.name || link.clientName || 'Shah Enterprises';
                        const companyName = clientObj.companyName || 'Shah Group';
                        const clientEmail = clientObj.email || 'info@shah.com';

                        return (
                          <tr key={link._id || link.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="px-5 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-100">
                                  <Building className="w-4 h-4" />
                                </div>
                                <strong className="text-slate-900 font-extrabold text-xs block">{clientName}</strong>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-slate-700 font-bold align-middle whitespace-nowrap">
                              {companyName}
                            </td>

                            <td className="px-5 py-4 text-slate-500 font-mono text-[11px] align-middle whitespace-nowrap">
                              {clientEmail}
                            </td>

                            <td className="px-5 py-4 text-slate-500 font-mono text-[11px] align-middle whitespace-nowrap">
                              {link.linkedAt ? new Date(link.linkedAt).toISOString().split('T')[0] : '2026-08-01'}
                            </td>

                            {/* Visibility Toggle Switch */}
                            <td className="px-5 py-4 align-middle whitespace-nowrap">
                              <button
                                onClick={() => handleToggleLinkVisibility(link._id || link.id, link.visibleToClient)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${link.visibleToClient
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                  }`}
                                title="Click to toggle Client Portal visibility"
                              >
                                {link.visibleToClient ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                {link.visibleToClient ? 'Visible to Client' : 'Hidden from Client'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right align-middle whitespace-nowrap">
                              <button
                                onClick={() => handleUnlinkProject(link._id || link.id, clientName)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200 cursor-pointer"
                                title="Unlink Project (Admin / PM)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                          No Client accounts currently linked to this project. Click "Link Client Account" to grant access.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PROJECT TASKS PANEL */}
        {activeTab === 'tasks' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project Tasks ({projectTasksList.length})</h3>
                <p className="text-xs text-slate-500">Structural load analysis, design reviews & execution tasks for this project</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchProjectTasksList}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200 cursor-pointer"
                  title="Refresh Tasks"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingProjectTasks ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskCreateModalOpen(true)}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-bold text-xs rounded-xl shadow-2xs transition-all border border-brand-secondary/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-900" /> Create Task
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Task Name</th>
                    <th className="px-4 py-3">Assigned Employee</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Est. Time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {projectTasksList.length > 0 ? (
                    projectTasksList.map((t, idx) => {
                      const tName = t.taskName || t.title || t.name || 'Structural Task';
                      const assigneeObj = typeof t.assignedEmployee === 'object' && t.assignedEmployee !== null ? t.assignedEmployee : null;
                      const assigneeName = assigneeObj ? (assigneeObj.name || assigneeObj.email) : (t.assignee || 'Assigned Staff');
                      const priority = t.priority || 'Medium';
                      const deadlineStr = t.deadline ? formatDate(t.deadline) : 'N/A';
                      const status = t.status || 'Pending';

                      return (
                        <tr key={t._id || t.id || `task-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            <div>{tName}</div>
                            {t.description && <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{t.description}</div>}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{assigneeName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{deadlineStr}</td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{t.estimatedTime || t.estTime || 12} hrs</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              status === 'Completed' || status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              status === 'In Progress' || status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">
                        No tasks created for this project yet. Click "Create Task" above to assign project work.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLIENT CHAT PANEL (WhatsApp Style Client Communication Hub) */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">WhatsApp-Style Client Communication Hub</h3>
                <p className="text-xs text-slate-500">Real-time messaging stream, swipe-to-reply, quoted messages & PM team notes</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase rounded-full border border-emerald-200">
                Live Sync Channel
              </span>
            </div>
            <ClientCommunication defaultProjectId={projectId} />
          </div>
        )}

        {/* TIMELINE & MILESTONES PANEL */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Project Execution Timeline & Milestones</h3>
                  <p className="text-xs text-slate-500">Track key milestone targets, phase releases, and handover dates</p>
                </div>
                <button
                  onClick={() => {
                    setMilestoneForm({ name: '', targetDate: '', progressPercentage: 50, description: '' });
                    setShowAddMilestone(true);
                  }}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold text-xs rounded-xl shadow-2xs transition-all border border-brand-secondary/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-900" /> Add Milestone
                </button>
              </div>

              {milestonesList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {milestonesList.map((m, idx) => {
                    const isDone = m.isCompleted || m.status === 'COMPLETED' || m.progressPercentage === 100;
                    const progVal = isDone ? 100 : (m.progressPercentage !== undefined ? m.progressPercentage : 50);

                    return (
                      <div 
                        key={m._id || m.id || `m-idx-${idx}`} 
                        className={`p-4 rounded-2xl border transition-all space-y-3 relative bg-white shadow-3xs hover:shadow-2xs ${
                          isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/90'
                        }`}
                      >
                        {/* Header: Phase badge + Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 rounded-md text-[10px] uppercase tracking-wider">
                            Phase #{String(idx + 1).padStart(2, '0')}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                            isDone 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                            {isDone ? 'COMPLETED' : 'IN_PROGRESS'}
                          </span>
                        </div>

                        {/* Title & Target Date */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-sm tracking-tight leading-snug line-clamp-2">
                            {m.name || 'Project Milestone'}
                          </h4>
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Target: {formatDate(m.targetDate)}</span>
                          </div>
                        </div>

                        {/* Progress Bar & Percentage */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Completion Status</span>
                            <span className={isDone ? 'text-emerald-700' : 'text-slate-800'}>{progVal}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDone 
                                  ? 'bg-emerald-500' 
                                  : 'bg-gradient-to-r from-amber-400 via-brand-secondary to-indigo-600'
                              }`} 
                              style={{ width: `${progVal}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100/90 gap-2">
                          <button
                            onClick={() => handleToggleMilestoneStatus(m)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isDone
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                            title={isDone ? 'Reopen Phase' : 'Mark Phase as Complete'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isDone ? 'Mark In-Progress' : 'Mark Completed'}
                          </button>

                          <button
                            onClick={() => handleDeleteMilestoneClick(m)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 rounded-xl transition-all cursor-pointer"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No project milestones registered yet.</p>
                  <button
                    onClick={() => {
                      setMilestoneForm({ name: '', targetDate: '', progressPercentage: 50, description: '' });
                      setShowAddMilestone(true);
                    }}
                    className="px-4 py-2 bg-brand-primary text-slate-900 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    + Add First Milestone
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TASKS PANEL */}
        {activeTab === 'tasks' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Project Action Items & Work Tasks</h3>
                <p className="text-xs text-slate-500">Active tasks assigned across Architecture, Site Engineering, and MEP</p>
              </div>
            </div>

            {Array.isArray(project.tasks) && project.tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-normal">
                {project.tasks.map((t, i) => (
                  <div key={t._id || i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium text-[9px] uppercase rounded">
                        {t.department || t.dept || 'Engineering'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-medium uppercase ${
                        t.priority === 'HIGH' || t.priority === 'Critical' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <span className="text-slate-900 block text-xs font-semibold">{t.title || t.name}</span>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 font-normal">
                      <span>Assigned: {t.assignedTo?.name || t.assignee || 'Unassigned'}</span>
                      <span className="font-medium text-slate-700">{t.status || 'PENDING'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-normal">No active work tasks assigned to this project yet.</p>
              </div>
            )}
          </div>
        )}

        {/* DRAWINGS & GFC PANEL */}
        {activeTab === 'drawings' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Project Drawings & GFC Blueprints</h3>
                <p className="text-xs text-slate-500">Uploaded blueprints, version history, and client approval status</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUploadDrawingModalOpen(true)}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold text-xs rounded-xl shadow-2xs transition-all border border-brand-secondary/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-900" /> Upload Blueprint
                </button>
              </div>
            </div>

            {loadingProjectDrawings ? (
              <div className="py-10 text-center text-slate-400 text-xs font-medium">Loading project blueprints...</div>
            ) : Array.isArray(projectDrawingsList) && projectDrawingsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-normal">
                {projectDrawingsList.map((d, i) => {
                  const titleStr = d.drawingName || d.title || d.name || d.code || `Drawing #${i + 1}`;
                  const verStr = d.currentVersion ? `V${d.currentVersion}.0` : (d.version ? `V${d.version}` : 'V1.0');
                  const catStr = d.categoryName || d.category || 'Working Drawings';
                  const dateStr = formatDate(d.updatedAt || d.uploadedAt || d.createdAt);
                  const isLocked = d.isGFCLocked || d.status === 'GFC Locked' || d.status === 'GFC_LOCKED';
                  const isApproved = d.status === 'APPROVED' || d.status === 'Approved';

                  return (
                    <div key={d._id || d.id || i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-300 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-900 font-bold text-xs block">{titleStr}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-extrabold">{catStr}</span>
                        </div>
                        <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                          <span>Ver: {verStr}</span>
                          <span>Date: {dateStr}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase ${
                          isLocked ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {d.status || 'PENDING'}
                        </span>
                        {(d.fileUrl || d.filePath) && (
                          <a
                            href={d.fileUrl || d.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-xl"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-normal">No drawing blueprints uploaded for this project yet.</p>
                <button
                  onClick={() => setIsUploadDrawingModalOpen(true)}
                  className="px-4 py-2 bg-brand-primary text-slate-900 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  + Upload First Blueprint
                </button>
              </div>
            )}

            <DrawingCreateModal
              isOpen={isUploadDrawingModalOpen}
              onClose={() => setIsUploadDrawingModalOpen(false)}
              onSubmit={handleUploadProjectDrawingSubmit}
            />
          </div>
        )}

        {/* TEAM MATRIX PANEL */}
        {activeTab === 'team' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Project Team Allocation & Responsibility Matrix</h3>
                <p className="text-xs text-slate-500">Personnel assigned to project execution and RACI matrix</p>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold text-xs rounded-xl shadow-2xs transition-all border border-brand-secondary/40 cursor-pointer"
              >
                + Assign Team Member
              </button>
            </div>

            {Array.isArray(project.team) && project.team.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-normal">
                {project.team.map((member, i) => (
                  <div key={member._id || i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-slate-900 font-semibold text-xs block">{member.name}</span>
                    <span className="text-[11px] text-slate-500 block">{member.role || member.projectRole}</span>
                    <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-200/60">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded uppercase">{member.dept || 'Engineering'}</span>
                      <span className="text-slate-500 font-mono">{member.phone || 'Assigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-normal">No team members assigned to this project yet. Click "+ Assign Team Member" to add personnel.</p>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS PANEL */}
        {activeTab === 'documents' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project Documents & Repository</h3>
                <p className="text-xs text-slate-500">Shared PDF contracts, approved drawing sets, invoices, and photo archives</p>
              </div>
              <button
                onClick={() => setIsDocUploadModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Document
              </button>
            </div>

            {/* Folder Directories Cards Grid */}
            {tabProjectFolders.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Project Folders ({tabProjectFolders.length})</span>
                  {selectedTabFolder !== 'All' && (
                    <button 
                      onClick={() => setSelectedTabFolder('All')}
                      className="text-[11px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Show All Files
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {tabProjectFolders.map((fObj, idx) => {
                    const fName = fObj.folderName || fObj.name || 'Folder';
                    const fId = fObj._id || fObj.id;
                    const isSelected = selectedTabFolder === fId || selectedTabFolder === fName || (typeof selectedTabFolder === 'object' && selectedTabFolder._id === fId);
                    
                    const docCount = tabProjectDocs.filter(d => {
                      const docFId = typeof d.folderId === 'object' ? (d.folderId?._id || d.folderId?.id) : d.folderId;
                      const docFName = typeof d.folderId === 'object' ? d.folderId?.folderName : (d.folder || d.category);
                      if (fId && docFId && String(fId) === String(docFId)) return true;
                      if (fName && docFName && String(fName).toLowerCase() === String(docFName).toLowerCase()) return true;
                      return false;
                    }).length;

                    const creatorName = fObj.createdBy?.name || 'Super Admin';

                    return (
                      <div 
                        key={fId || idx}
                        onClick={() => setSelectedTabFolder(isSelected ? 'All' : fObj)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-400/20 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">{fName}</span>
                          </div>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                          <span>Created: {creatorName}</span>
                          <span className="font-extrabold text-slate-700">{docCount} Files</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Document Files List */}
            {loadingTabDocs ? (
              <div className="py-10 text-center text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-1" />
                <p className="text-xs">Loading project documents...</p>
              </div>
            ) : (() => {
              const selectedName = typeof selectedTabFolder === 'object' ? selectedTabFolder.folderName : selectedTabFolder;
              const selectedId = typeof selectedTabFolder === 'object' ? selectedTabFolder._id : selectedTabFolder;

              const displayDocs = tabProjectDocs.filter(d => {
                if (!selectedTabFolder || selectedTabFolder === 'All') return true;

                const docFId = typeof d.folderId === 'object' ? (d.folderId?._id || d.folderId?.id) : d.folderId;
                const docFName = typeof d.folderId === 'object' ? d.folderId?.folderName : (d.folder || d.category);

                if (selectedId && docFId && String(selectedId) === String(docFId)) return true;
                if (selectedName && docFName && String(selectedName).toLowerCase() === String(docFName).toLowerCase()) return true;

                return false;
              });

              if (displayDocs.length === 0) {
                return (
                  <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-normal">
                      {selectedTabFolder === 'All' 
                        ? 'No documents uploaded for this project yet.' 
                        : `No documents inside folder "${selectedTabFolder}".`}
                    </p>
                    <button
                      onClick={() => setIsDocUploadModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      + Upload Document
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Files List {selectedTabFolder !== 'All' ? `(${selectedTabFolder})` : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{displayDocs.length} Total Files</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {displayDocs.map((doc, idx) => {
                      const docTitle = doc.documentName || doc.fileName || doc.name || 'Untitled Document.pdf';
                      const folderName = typeof doc.folderId === 'object' ? doc.folderId?.folderName : (doc.folder || doc.category || 'General');
                      const uploader = doc.createdBy?.name || doc.uploadedBy?.name || doc.uploadedBy || 'Staff';
                      const sizeStr = doc.size || (doc.fileSizeKB ? `${(doc.fileSizeKB / 1024).toFixed(1)} MB` : '1.8 MB');
                      const dateStr = doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '2026-08-10';

                      return (
                        <div key={doc._id || doc.id || idx} className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-100/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white border border-slate-200 rounded-xl text-indigo-600 shadow-2xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className="text-xs font-black text-slate-900">{docTitle}</strong>
                                <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                                  {folderName}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                                  doc.visibleToClient 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {doc.visibleToClient ? 'Client Shared' : 'Admin Only'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                <span>Uploaded by: <strong className="text-slate-600">{uploader}</strong></span>
                                <span>Date: {dateStr}</span>
                                <span>Size: {sizeStr}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => {
                                setSelectedAuditDoc(doc);
                                setIsAuditLogModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-xl border border-slate-200 transition-all cursor-pointer"
                              title="View DocumentAccessLog audit history for this file"
                            >
                              Audit Log
                            </button>

                            {(doc.filePath || doc.fileUrl) ? (
                              <a
                                href={doc.filePath || doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  setSelectedAuditDoc(doc);
                                  setIsAuditLogModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl shadow-2xs transition-all"
                              >
                                View Document
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedAuditDoc(doc);
                                  setIsAuditLogModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                              >
                                View Document
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <DocumentUploadModal
              isOpen={isDocUploadModalOpen}
              onClose={() => setIsDocUploadModalOpen(false)}
              onSubmit={handleUploadTabDocSubmit}
            />

            <DocumentAccessLogModal
              isOpen={isAuditLogModalOpen}
              onClose={() => setIsAuditLogModalOpen(false)}
              doc={selectedAuditDoc}
            />
          </div>
        )}

        {/* APPROVALS PANEL */}
        {activeTab === 'approvals' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Pending Client & Internal Approvals</h3>
                <p className="text-xs text-slate-500">Audit list of drawings and design revisions awaiting sign-off</p>
              </div>
            </div>

            {Array.isArray(project.drawings) && project.drawings.filter(d => d.status !== 'Approved' && d.status !== 'APPROVED').length > 0 ? (
              <div className="space-y-3">
                {project.drawings.filter(d => d.status !== 'Approved' && d.status !== 'APPROVED').map((d, i) => (
                  <div key={d._id || i} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <span className="text-amber-900 font-semibold block">{d.title || d.name || d.code}</span>
                      <p className="text-amber-700 text-[11px]">Submitted for approval on {formatDate(d.uploadedAt || d.createdAt)}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 font-medium rounded-full text-[10px] uppercase">
                      Awaiting Response
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-normal">No pending approvals required for this project.</p>
              </div>
            )}
          </div>
        )}

        {/* REPORTS PANEL */}
        {activeTab === 'reports' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Visual Operational Reports & Analytics</h3>
                <p className="text-xs text-slate-500">Project velocity, milestone progress, and budget tracking</p>
              </div>
            </div>

            <div className="h-48 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-600 uppercase">Overall Project Progress</span>
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden my-auto">
                <div className="bg-brand-primary h-full rounded-full transition-all duration-500" style={{ width: `${project.progressPercentage || project.progress || 0}%` }}></div>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>Completed: {project.progressPercentage || project.progress || 0}%</span>
                <span>Milestones Registered: {milestonesList.length}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: LINK CLIENT ACCOUNT (CRM Module 3 POST /api/client-project-links/create) */}
      {showAddClientLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Link Client Account to Project</h3>
                <p className="text-xs text-slate-500">Select target Client account to authorize project portal visibility</p>
              </div>
              <button onClick={() => setShowAddClientLinkModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={handleCreateLinkSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Client Account *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-extrabold text-slate-800"
                  required
                >
                  {allClients.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} ({c.companyName || c.email || 'Client'})
                    </option>
                  ))}
                  {allClients.length === 0 && (
                    <option value="cli-103">Shah Enterprises (info@shah.com)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Visibility Status</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="visCheck"
                    checked={linkVisibility}
                    onChange={(e) => setLinkVisibility(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="visCheck" className="text-slate-800 font-bold cursor-pointer">
                    Visible to Client Portal (`visibleToClient: true`)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClientLinkModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkSubmitting}
                  className="px-5 py-2 bg-brand-primary text-brand-dark font-extrabold rounded-xl shadow-xs"
                >
                  {linkSubmitting ? 'Linking...' : 'Confirm Linkage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PROJECT STATUS & AUDIT LOG MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Update Project Status</h3>
                <span className="text-[10px] text-slate-400 block font-normal">Audit history trail will record status transition & notes</span>
              </div>
              <button onClick={() => setShowStatusModal(false)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Status State</label>
                <select
                  value={newStatusVal}
                  onChange={(e) => setNewStatusVal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="New">New</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Approval Pending">Approval Pending</option>
                  <option value="Site Work">Site Work</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status Transition Notes / Reason</label>
                <textarea
                  rows="3"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Reason for status change (e.g., site excavation completed)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                ></textarea>
              </div>

              {/* Status History Audit Trail Ledger */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Audit History Trail ({statusHistory.length})</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {statusHistory.length > 0 ? (
                    statusHistory.map(h => (
                      <div key={h._id} className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-[11px] space-y-0.5">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-900 font-semibold">{h.toStatus}</strong>
                          <span className="text-[10px] text-slate-400">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <p className="text-slate-600 font-normal">{h.notes || 'Status changed'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No historical status logs recorded yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={statusSubmitting} className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold rounded-xl border border-brand-secondary/30">
                  {statusSubmitting ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MILESTONE MODAL */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 uppercase">Add Project Milestone</h3>
              <button onClick={() => setShowAddMilestone(false)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMilestoneSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={milestoneForm.name}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                  placeholder="e.g. Interior Fitouts Signoff"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Completion Date *</label>
                <input
                  type="date"
                  required
                  value={milestoneForm.targetDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddMilestone(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-brand-primary text-slate-900 font-semibold rounded-xl">
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TEAM MEMBER MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 uppercase">Assign Team Member</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssignTeamSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Member / Employee *</label>
                {loadingSystemUsers ? (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs flex items-center gap-2 font-normal">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Loading registered users from database...</span>
                  </div>
                ) : systemUsers.length > 0 ? (
                  <select
                    value={assignForm.userId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = systemUsers.find(u => (u._id || u.id) === selectedId);
                      const nameStr = found ? (typeof found.name === 'string' ? found.name : (typeof found.fullName === 'string' ? found.fullName : (typeof found.email === 'string' ? found.email : 'Team Member'))) : 'Team Member';
                      const roleStr = found ? (typeof found.role === 'string' ? found.role : (typeof found.roleName === 'string' ? found.roleName : (found.role && typeof found.role === 'object' ? (found.role.roleName || found.role.name || found.role.roleCode || 'Architect') : 'Architect'))) : 'Architect';
                      setAssignForm({
                        userId: selectedId,
                        memberName: nameStr,
                        projectRole: roleStr
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900 cursor-pointer"
                    required
                  >
                    {systemUsers.map(u => {
                      const nameStr = typeof u.name === 'string' ? u.name : (typeof u.fullName === 'string' ? u.fullName : (typeof u.email === 'string' ? u.email : 'User'));
                      const roleStr = typeof u.role === 'string' ? u.role : (typeof u.roleName === 'string' ? u.roleName : (u.role && typeof u.role === 'object' ? (u.role.roleName || u.role.name || u.role.roleCode || 'Member') : (typeof u.email === 'string' ? u.email : 'Member')));
                      return (
                        <option key={u._id || u.id} value={u._id || u.id}>
                          {nameStr} ({roleStr})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <p className="text-slate-400 text-xs py-2 font-normal">No registered users found in system.</p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Role *</label>
                <input
                  type="text"
                  required
                  value={assignForm.projectRole || ''}
                  onChange={(e) => setAssignForm({ ...assignForm, projectRole: e.target.value })}
                  placeholder="e.g. Lead Architect / Site Engineer"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900"
                />
              </div>

              {assignForm.userId && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Selected Team Member Preview</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-900">{assignForm.memberName}</span>
                    <span className="px-2.5 py-0.5 bg-brand-soft text-slate-900 border border-brand-secondary/40 rounded-md font-semibold text-[11px]">
                      {assignForm.projectRole}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-brand-primary text-slate-900 font-semibold rounded-xl">
                  Assign Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PROGRESS OVERRIDE MODAL */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 uppercase">Update Overall Project Progress</h3>
              <button onClick={() => setShowProgressModal(false)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateProgressSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Progress Percentage (0 - 100%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={progressVal}
                  onChange={(e) => setProgressVal(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="overrideCheck"
                  checked={progressOverride}
                  onChange={(e) => setProgressOverride(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="overrideCheck" className="text-slate-800 font-semibold text-xs cursor-pointer">
                  Manual Override (Lock from automatic milestone recalculation)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowProgressModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={progressSubmitting} className="px-5 py-2 bg-brand-primary text-slate-900 font-semibold rounded-xl border border-brand-secondary/40">
                  {progressSubmitting ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <TaskCreateModal
        isOpen={isTaskCreateModalOpen}
        onClose={() => setIsTaskCreateModalOpen(false)}
        onSubmit={handleCreateTaskSubmit}
      />

    </div>
  );
}
