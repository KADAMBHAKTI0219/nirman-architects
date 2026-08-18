import React, { useState, useEffect } from 'react';
import { 
  X, User, Clock, FileText, CheckCircle2, ChevronRight, Send, 
  Paperclip, Activity, FileCheck, Layers, ClipboardList, Plus, Lock, AlertTriangle, AlertCircle, RefreshCw, UserCheck, Trash2
} from 'lucide-react';
import { 
  acceptTask, rejectTask, startTask, submitTaskForReview, approveTask, completeTask, reassignTask,
  getTaskStatusHistory, getTaskTimeAnalysis, getTaskScheduleComparison, getTaskComments, addTaskComment,
  addChecklistItem, toggleChecklistItem, deleteChecklistItem
} from '../../../service/task';
import { getUsersList } from '../../../service/auth';
import { isTaskManagementRole, getUserFromStorage } from '../../../utils/rbac';
import { useToast } from '../../../context/ToastContext';

const STEPS = ['Pending', 'Accepted', 'In Progress', 'Review', 'Approved', 'Completed'];

export default function TaskDetails({
  task,
  onBack,
  onClose,
  onUpdateStatus,
  onUpdateProgress,
  onAddComment,
  onToggleChecklist,
  onUpdateTask,
  onDeleteTask
}) {
  const { showToast } = useToast();
  const handleCloseModal = onClose || onBack || (() => {});

  const currentUser = getUserFromStorage();
  const canManageTasks = isTaskManagementRole(currentUser);

  const currentUserId = currentUser?._id || currentUser?.id;
  const currentUserName = currentUser?.name || currentUser?.fullName || currentUser?.email || '';

  const isAssignedEmployee = Boolean(
    currentUserId && (
      (task?.assignedEmployee && typeof task.assignedEmployee === 'object' && String(task.assignedEmployee._id || task.assignedEmployee.id) === String(currentUserId)) ||
      (task?.assignedEmployee && typeof task.assignedEmployee === 'string' && String(task.assignedEmployee) === String(currentUserId)) ||
      (task?.assignee && (String(task.assignee) === String(currentUserId) || String(task.assignee).toLowerCase() === String(currentUserName).toLowerCase()))
    )
  );

  // Active Tab: 'overview' | 'checklist' | 'comments' | 'analysis' | 'history'
  const [activeTab, setActiveTab] = useState('overview');

  const [commentInput, setCommentInput] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [usersList, setUsersList] = useState([]);

  // Async Loaded Data
  const [statusHistory, setStatusHistory] = useState([]);
  const [timeAnalysis, setTimeAnalysis] = useState(null);
  const [scheduleComp, setScheduleComp] = useState(null);
  const [commentsList, setCommentsList] = useState(task?.comments || []);
  const [checklistData, setChecklistData] = useState(task?.checklist || []);

  const taskId = task?._id || task?.id;

  useEffect(() => {
    if (taskId) {
      loadTaskDetailsData();
    }
  }, [taskId]);

  const loadTaskDetailsData = async () => {
    try {
      const [histRes, timeRes, schedRes, commRes, userRes] = await Promise.allSettled([
        getTaskStatusHistory(taskId),
        getTaskTimeAnalysis(taskId),
        getTaskScheduleComparison(taskId),
        getTaskComments(taskId),
        getUsersList()
      ]);

      if (histRes.status === 'fulfilled' && histRes.value?.history) {
        setStatusHistory(histRes.value.history);
      }
      if (timeRes.status === 'fulfilled' && (timeRes.value?.success || timeRes.value?.data)) {
        setTimeAnalysis(timeRes.value.data || timeRes.value);
      }
      if (schedRes.status === 'fulfilled' && (schedRes.value?.success || schedRes.value?.data)) {
        setScheduleComp(schedRes.value.data || schedRes.value);
      }
      if (commRes.status === 'fulfilled' && Array.isArray(commRes.value?.comments)) {
        setCommentsList(commRes.value.comments);
      }
      if (userRes.status === 'fulfilled' && Array.isArray(userRes.value?.users)) {
        setUsersList(userRes.value.users);
      }
    } catch (e) {}
  };

  // Workflow Handlers
  const handleAccept = async () => {
    setActionError('');
    setActionLoading(true);
    try {
      const res = await acceptTask(taskId);
      if (res?.success !== false) {
        if (onUpdateStatus) onUpdateStatus('Accepted');
        loadTaskDetailsData();
      } else {
        setActionError(res.message || 'Failed to accept task.');
      }
    } catch (e) {
      setActionError(e.response?.data?.message || 'Error accepting task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setActionError('');
    setActionLoading(true);
    try {
      const res = await rejectTask(taskId, rejectionReason.trim());
      if (res?.success !== false) {
        setIsRejectModalOpen(false);
        if (onUpdateStatus) onUpdateStatus('Rejected');
        loadTaskDetailsData();
      } else {
        setActionError(res.message || 'Failed to reject task.');
      }
    } catch (e) {
      setActionError(e.response?.data?.message || 'Error rejecting task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionError('');
    setActionLoading(true);
    try {
      const res = await startTask(taskId);
      if (res?.success !== false) {
        if (onUpdateStatus) onUpdateStatus('In Progress');
        loadTaskDetailsData();
      } else {
        if (res?.message?.toLowerCase().includes('depend') || res?.message?.toLowerCase().includes('block')) {
          setActionError('Task cannot be started because one or more dependent tasks are still incomplete.');
        } else {
          setActionError(res.message || 'Task cannot be started at this time.');
        }
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || '';
      if (errMsg.toLowerCase().includes('depend') || errMsg.toLowerCase().includes('block')) {
        setActionError('Task cannot be started because one or more dependent tasks are still incomplete.');
      } else {
        setActionError(errMsg || 'Error starting task.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    setActionError('');
    setActionLoading(true);
    try {
      const res = await submitTaskForReview(taskId);
      if (res?.success !== false) {
        if (onUpdateStatus) onUpdateStatus('Review');
        loadTaskDetailsData();
      } else {
        setActionError(res.message || 'Failed to submit task for review.');
      }
    } catch (e) {
      setActionError(e.response?.data?.message || 'Error submitting task for review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionError('');
    setActionLoading(true);
    try {
      const res = await approveTask(taskId);
      if (res?.success !== false) {
        if (onUpdateStatus) onUpdateStatus('Approved');
        loadTaskDetailsData();
      } else {
        setActionError(res.message || 'Failed to approve task.');
      }
    } catch (e) {
      setActionError(e.response?.data?.message || 'Error approving task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionError('');
    setActionLoading(true);
    try {
      const res = await completeTask(taskId);
      if (res?.success !== false) {
        if (onUpdateStatus) onUpdateStatus('Completed');
        loadTaskDetailsData();
      } else {
        setActionError(res.message || 'Failed to complete task.');
      }
    } catch (e) {
      setActionError(e.response?.data?.message || 'Error completing task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!newAssigneeId) return;
    setActionError('');
    setActionLoading(true);
    try {
      const res = await reassignTask(taskId, {
        newAssignedEmployee: newAssigneeId,
        reason: reassignReason
      });
      if (res?.success !== false) {
        setIsReassignModalOpen(false);
        if (onUpdateStatus) onUpdateStatus('Pending');
        loadTaskDetailsData();
        showToast('Task reassigned to new team member successfully!', 'success', 'Task Reassigned', false);
      } else {
        setActionError(res.message || 'Failed to reassign task.');
        showToast(res.message || 'Failed to reassign task.', 'error');
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Error reassigning task.';
      setActionError(msg);
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle checklist checkbox
  const handleToggleCheck = async (itemId) => {
    if (!isAssignedEmployee && !canManageTasks) {
      setActionError("Checklist completion is restricted to the assigned employee or manager.");
      return;
    }
    try {
      await toggleChecklistItem(taskId, itemId);
    } catch (e) {}
    setChecklistData(prev => prev.map(item => (item._id === itemId || item.id === itemId) ? { ...item, checked: !item.checked, isCompleted: !item.isCompleted } : item));
    if (onToggleChecklist) onToggleChecklist(itemId);
  };

  // Add checklist item
  const handleAddCheckItem = async (e) => {
    e.preventDefault();
    if (!isAssignedEmployee && !canManageTasks) {
      setActionError("Adding checklist items is restricted to the assigned employee or manager.");
      return;
    }
    if (!newCheckItem.trim()) return;
    try {
      const res = await addChecklistItem(taskId, newCheckItem.trim());
      if (res?.success && res.checklistItem) {
        setChecklistData(prev => [...prev, res.checklistItem]);
      } else {
        setChecklistData(prev => [...prev, { id: Date.now(), text: newCheckItem.trim(), isCompleted: false, checked: false }]);
      }
    } catch (e) {
      setChecklistData(prev => [...prev, { id: Date.now(), text: newCheckItem.trim(), isCompleted: false, checked: false }]);
    }
    setNewCheckItem('');
  };

  // Add comment
  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const text = commentInput.trim();
    try {
      const res = await addTaskComment(taskId, text);
      if (res?.success && res.comment) {
        setCommentsList(prev => [...prev, res.comment]);
      } else {
        setCommentsList(prev => [...prev, { author: currentUser?.name || 'Staff User', message: text, date: 'Just now' }]);
      }
    } catch (e) {
      setCommentsList(prev => [...prev, { author: currentUser?.name || 'Staff User', message: text, date: 'Just now' }]);
    }
    setCommentInput('');
  };

  const statusStr = task.status || 'Pending';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[99999] p-4 sm:p-6 font-sans">
      <div className="bg-slate-50/90 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{task.id || task._id || 'TSK-001'}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  task.priority === 'Critical' || task.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>{task.priority || 'Medium'} Priority</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">{task.title || task.taskName || 'Untitled Task'}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canManageTasks && (
              <button
                onClick={() => {
                  if (onDeleteTask) onDeleteTask(task._id || task.id);
                }}
                className="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-xl transition-all cursor-pointer border border-rose-200"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={handleCloseModal}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-white border-b border-slate-200 flex items-center gap-4 text-xs font-bold text-slate-500 shrink-0">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent hover:text-slate-900'}`}
          >
            Overview & Workflow
          </button>
          <button 
            onClick={() => setActiveTab('checklist')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === 'checklist' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent hover:text-slate-900'}`}
          >
            Checklist ({checklistData.filter(c => c.isCompleted || c.checked).length}/{checklistData.length})
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === 'comments' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent hover:text-slate-900'}`}
          >
            Comments ({commentsList.length})
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent hover:text-slate-900'}`}
          >
            Time & Schedule Analysis
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent hover:text-slate-900'}`}
          >
            Status History Audit
          </button>
        </div>

        {/* Error Alert Bar */}
        {actionError && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: OVERVIEW & CONTEXTUAL WORKFLOW ACTIONS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Contextual Action Bar based on Role & Status */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workflow Action:</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-black text-xs border border-slate-200">
                    Status: {statusStr}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!canManageTasks && statusStr === 'Pending' && (
                    <>
                      <button 
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept Task
                      </button>
                      <button 
                        onClick={() => setIsRejectModalOpen(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                      >
                        Reject Task
                      </button>
                    </>
                  )}

                  {!canManageTasks && statusStr === 'Accepted' && (
                    <button 
                      onClick={handleStart}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" /> Start Task
                    </button>
                  )}

                  {!canManageTasks && statusStr === 'In Progress' && (
                    <button 
                      onClick={handleSubmitReview}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit for Review
                    </button>
                  )}

                  {statusStr === 'Review' && canManageTasks && (
                    <button 
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Approve Task
                    </button>
                  )}

                  {statusStr === 'Approved' && canManageTasks && (
                    <button 
                      onClick={handleComplete}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete Task
                    </button>
                  )}

                  {canManageTasks && statusStr !== 'Completed' && (
                    <button 
                      onClick={() => setIsReassignModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Reassign
                    </button>
                  )}
                </div>
              </div>

              {/* Rejection Details Banner if Rejected */}
              {statusStr === 'Rejected' && task.rejectionReason && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
                  <span className="font-black uppercase tracking-wider block text-[10px]">Rejection Reason</span>
                  <p className="font-semibold">{task.rejectionReason}</p>
                </div>
              )}

              {/* TOP 3 CARDS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Project & Department</span>
                  <div>
                    <strong className="text-sm font-extrabold text-slate-900 block">{task.project || task.projectName}</strong>
                    <span className="text-xs text-slate-500 font-semibold">{task.dept || task.departmentName}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Employee</span>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-xs border border-indigo-100 shrink-0">
                      {(task.assignee || task.assignedEmployeeName || 'LS').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <strong className="text-xs font-extrabold text-slate-900 block">{task.assignee || task.assignedEmployeeName}</strong>
                      <span className="text-[10px] text-slate-400 font-semibold block">{task.dept || 'Design Team'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Deadline & Schedule</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <strong className="text-slate-800">{task.deadline || 'No Due Date'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated:</span>
                      <strong className="text-slate-800">{task.estTime || task.estimatedTime || 12} hrs</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Task Description */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Task Description</span>
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed shadow-2xs">
                  {task.description || "No specific detailed description logged for this task."}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Quality Checklist</h4>
                <span className="text-xs font-bold text-indigo-600">{checklistData.filter(c => c.isCompleted || c.checked).length} of {checklistData.length} completed</span>
              </div>

              {!isAssignedEmployee && !canManageTasks && (
                <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Checklist completion is restricted to assigned employee (Assignee: <strong>{task.assignee || task.assignedEmployee?.name || 'Staff'}</strong>)</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-amber-100 rounded-md text-amber-900 shrink-0">View Only</span>
                </div>
              )}

              {checklistData.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs italic font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No quality checklist items registered yet for this task.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {checklistData.map((item, idx) => (
                    <label key={item._id || item.id || idx} className={`flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-700 font-semibold transition-all ${
                      (isAssignedEmployee || canManageTasks) ? 'cursor-pointer hover:bg-slate-100/60' : 'cursor-not-allowed opacity-80'
                    }`}>
                      <input 
                        type="checkbox"
                        disabled={!isAssignedEmployee && !canManageTasks}
                        checked={item.checked || item.isCompleted || false}
                        onChange={() => handleToggleCheck(item._id || item.id || idx)}
                        className={`w-4 h-4 text-emerald-600 rounded border-slate-300 ${(isAssignedEmployee || canManageTasks) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      />
                      <span className={(item.checked || item.isCompleted) ? 'line-through text-slate-400' : 'text-slate-800'}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {(isAssignedEmployee || canManageTasks) && (
                <form onSubmit={handleAddCheckItem} className="flex gap-2 pt-2 border-t border-slate-100">
                  <input 
                    type="text" 
                    placeholder="Add new checklist item..."
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-xs font-semibold bg-white text-slate-900"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#BDE0FE] to-[#8FC9FF] text-slate-900 border border-[#8FC9FF]/70 rounded-xl text-xs font-black shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" /> Add Item
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Comments & Team Discussion</h4>
              
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {commentsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No comments posted yet. Start the conversation below.
                  </div>
                ) : (
                  commentsList.map((c, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>{typeof c.author === 'object' ? (c.author.name || c.author.email) : (c.author || 'Team Member')}</span>
                        <span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : (c.date || 'Recently')}</span>
                      </div>
                      <p className="font-semibold text-slate-800">{c.commentText || c.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddCommentSubmit} className="flex gap-2 pt-3 border-t border-slate-100">
                <input 
                  type="text" 
                  placeholder="Post a comment on this task..." 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-semibold bg-white text-slate-900"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-all"
                >
                  Post Comment
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: TIME & SCHEDULE ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Time</span>
                  <strong className="text-lg font-black text-slate-800 mt-1 block">
                    {timeAnalysis?.estimatedTime 
                      ? `${timeAnalysis.estimatedTime} hrs` 
                      : (task.estTime ? `${task.estTime} hrs` : (task.estimatedTime ? `${Math.round(task.estimatedTime / 60)} hrs` : '8 hrs'))}
                  </strong>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Total Working Time</span>
                  <strong className="text-lg font-black text-indigo-700 mt-1 block">
                    {timeAnalysis?.totalWorkingTimeMinutes !== undefined && timeAnalysis?.totalWorkingTimeMinutes !== null
                      ? (timeAnalysis.totalWorkingTimeMinutes >= 60 ? `${Math.round(timeAnalysis.totalWorkingTimeMinutes / 60)} hrs` : `${timeAnalysis.totalWorkingTimeMinutes} mins`)
                      : (task.totalWorkingTimeMinutes ? (task.totalWorkingTimeMinutes >= 60 ? `${Math.round(task.totalWorkingTimeMinutes / 60)} hrs` : `${task.totalWorkingTimeMinutes} mins`) : (task.status === 'Completed' ? `${task.estTime || 8} hrs` : '0 mins'))}
                  </strong>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Idle Time</span>
                  <strong className="text-lg font-black text-amber-700 mt-1 block">
                    {timeAnalysis?.idleTimeMinutes !== undefined && timeAnalysis?.idleTimeMinutes !== null
                      ? `${timeAnalysis.idleTimeMinutes} mins`
                      : (task.idleTimeMinutes ? `${task.idleTimeMinutes} mins` : '0 mins')}
                  </strong>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Productivity Score</span>
                  <strong className="text-lg font-black text-emerald-700 mt-1 block">
                    {timeAnalysis?.productivityScore !== undefined && timeAnalysis?.productivityScore !== null
                      ? `${timeAnalysis.productivityScore}%`
                      : (task.productivityScore !== undefined && task.productivityScore !== null ? `${task.productivityScore}%` : (task.status === 'Completed' ? '100%' : 'N/A'))}
                  </strong>
                </div>
              </div>

              {/* Schedule Comparison */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Schedule Comparison (Planned vs Actual)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planned Timeline</span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Planned Start:</span>
                      <span className="text-slate-800">
                        {task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : (task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : 'Today')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Planned Deadline:</span>
                      <span className="text-slate-800">
                        {task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : (task.estimatedCompletion ? new Date(task.estimatedCompletion).toISOString().split('T')[0] : 'Flexible')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Actual Execution</span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Actual Start:</span>
                      <span className="text-indigo-800">
                        {task.actualStartTime ? new Date(task.actualStartTime).toLocaleString() : (['In Progress', 'Review', 'Approved', 'Completed'].includes(task.status) ? 'In Progress' : 'Not started yet')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Actual Completion:</span>
                      <span className="text-indigo-800">
                        {task.completionTime ? new Date(task.completionTime).toLocaleString() : (task.status === 'Completed' ? 'Completed' : 'Not completed yet')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STATUS HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Vertical Status History Timeline</h4>

              <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-5 pt-1">
                {statusHistory.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">No formal status change logs found yet.</div>
                ) : (
                  statusHistory.map((h, idx) => (
                    <div key={idx} className="relative text-xs space-y-0.5">
                      <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white" />
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-extrabold">{h.status || h.newStatus}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{h.changedAt ? new Date(h.changedAt).toLocaleString() : (h.timestamp || '')}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        Changed by: <span className="text-slate-700">{typeof h.changedBy === 'object' ? (h.changedBy.name || h.changedBy.email) : (h.changedBy || 'User')}</span>
                      </p>
                      {h.note && <p className="text-[11px] text-slate-600 italic mt-1">"{h.note}"</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* REJECT MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100000] p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-black text-rose-700 uppercase tracking-wider">Reject Task Assignment</h3>
            <p className="text-xs text-slate-500 font-semibold">Please state the specific reason for rejecting this task:</p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Schedule conflict with ongoing site supervision..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REASSIGN MODAL */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100000] p-4">
          <form onSubmit={handleReassignSubmit} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Reassign Task</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select New Assignee</label>
              <select
                required
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              >
                <option value="">Select Employee...</option>
                {usersList.map(u => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.name || u.fullName || u.email} ({u.role || u.roleCode || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Reassignment Reason / Note</label>
              <input
                type="text"
                placeholder="Reason for reassignment..."
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setIsReassignModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase"
              >
                Confirm Reassignment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
