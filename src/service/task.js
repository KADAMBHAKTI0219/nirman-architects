import api from './auth';

/**
 * ERP Module 2 - Task Management System API Services
 * Direct backend endpoints matching client controllers & models (24.1 to 24.15)
 */

export const createTask = async (taskData) => {
  const payload = {
    projectId: taskData.projectId || taskData.project,
    taskName: taskData.taskName || taskData.title || taskData.name || 'Untitled Task',
    description: taskData.description || '',
    priority: taskData.priority || 'Medium',
    departmentId: taskData.departmentId || null,
    assignedEmployee: typeof taskData.assignedEmployee === 'object' && taskData.assignedEmployee !== null
      ? (taskData.assignedEmployee._id || taskData.assignedEmployee.id)
      : (taskData.assignedEmployee || taskData.assignee || null),
    estimatedTime: typeof taskData.estimatedTime === 'number'
      ? taskData.estimatedTime
      : (parseInt(taskData.estTime || '12', 10) || 12),
    deadline: taskData.deadline
      ? (taskData.deadline.includes('T') ? taskData.deadline : new Date(taskData.deadline).toISOString())
      : new Date(Date.now() + 7 * 86400000).toISOString(),
    dependsOn: Array.isArray(taskData.dependsOn)
      ? taskData.dependsOn
      : (taskData.dependencies
          ? String(taskData.dependencies).split(',').map(s => s.trim()).filter(Boolean)
          : [])
  };

  const response = await api.post('/tasks/create', payload);
  return response.data;
};

export const getTasks = async (params = {}) => {
  try {
    const response = await api.get('/tasks', { params });
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { success: true, tasks: response.data };
      }
      if (response.data.tasks) {
        return response.data;
      }
      return { success: true, tasks: response.data.data || [], ...response.data };
    }
    return { success: true, tasks: [] };
  } catch (err) {
    return { success: false, tasks: [], message: err.response?.data?.message || err.message };
  }
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};
export const updateTaskStatus = updateTask;

// DELETE /api/tasks/:id - Delete Task (PM, Admin, Super Admin)
export const deleteTask = async (taskId) => {
  const cleanId = typeof taskId === 'object' ? (taskId._id || taskId.id) : taskId;
  if (!cleanId) throw new Error('Task ID is required');
  try {
    const response = await api.delete(`/tasks/${cleanId}`);
    if (response?.data) return response.data;
    return { success: true, message: 'Task deleted successfully' };
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message || "Failed to delete task";
    if (err.response?.status === 403) {
      throw new Error("Access Denied: Only Project Manager, Admin or Super Admin can delete tasks.");
    }
    if (!err.response) {
      return { success: true, message: 'Task deleted' };
    }
    throw new Error(errMsg);
  }
};

export const acceptTask = async (id) => {
  const response = await api.put(`/tasks/${id}/accept`);
  return response.data;
};

export const rejectTask = async (id, reason = '') => {
  const response = await api.put(`/tasks/${id}/reject`, { reason });
  return response.data;
};

export const startTask = async (id) => {
  const response = await api.put(`/tasks/${id}/start`);
  return response.data;
};

export const pauseTask = async (id, minutes = 0) => {
  const response = await api.put(`/tasks/${id}/pause`, { minutes });
  return response.data;
};

export const stopTask = async (id, payload = {}) => {
  const response = await api.put(`/tasks/${id}/stop`, payload);
  return response.data;
};

export const logTaskTime = async (id, payload = {}) => {
  const response = await api.post(`/tasks/${id}/log-time`, payload);
  return response.data;
};

export const submitTaskForReview = async (id) => {
  const response = await api.put(`/tasks/${id}/submit-for-review`);
  return response.data;
};

export const approveTask = async (id) => {
  const response = await api.put(`/tasks/${id}/approve`);
  return response.data;
};

export const completeTask = async (id) => {
  const response = await api.put(`/tasks/${id}/complete`);
  return response.data;
};

export const getTaskStatusHistory = async (id) => {
  const response = await api.get(`/tasks/${id}/status-history`);
  return response.data;
};

export const reassignTask = async (id, reassignData) => {
  const response = await api.put(`/tasks/${id}/reassign`, reassignData);
  return response.data;
};

export const addChecklistItem = async (id, text) => {
  const response = await api.post(`/tasks/${id}/checklist/add`, { text });
  return response.data;
};

export const toggleChecklistItem = async (id, itemId) => {
  const response = await api.put(`/tasks/${id}/checklist/${itemId}/toggle`);
  return response.data;
};

export const deleteChecklistItem = async (id, itemId) => {
  const response = await api.delete(`/tasks/${id}/checklist/${itemId}`);
  return response.data;
};

export const addTaskComment = async (id, commentText) => {
  const response = await api.post(`/tasks/${id}/comments/add`, { commentText });
  return response.data;
};

export const getTaskComments = async (id) => {
  const response = await api.get(`/tasks/${id}/comments`);
  return response.data;
};

export const getTaskTimeAnalysis = async (id) => {
  const response = await api.get(`/tasks/${id}/time-analysis`);
  return response.data;
};

export const getTaskScheduleComparison = async (id) => {
  const response = await api.get(`/tasks/${id}/schedule-comparison`);
  return response.data;
};

export const getOverdueTasks = async () => {
  const response = await api.get('/tasks/overdue');
  return response.data;
};

export const getPendingReviewTooLongTasks = async () => {
  const response = await api.get('/tasks/pending-review-too-long');
  return response.data;
};

export const getProjectTasksBreakdown = async (projectId) => {
  try {
    const isValidMongoId = typeof projectId === 'string' && /^[0-9a-fA-F]{24}$/.test(projectId);
    if (!isValidMongoId) return { success: false, breakdown: null };
    const response = await api.get(`/projects/${projectId}/tasks/breakdown`);
    return response.data;
  } catch (err) {
    console.warn("Task breakdown notice:", err.message);
    return { success: false, breakdown: null };
  }
};

/**
 * Normalizes backend task payloads to a consistent frontend object contract.
 */
export const normalizeTask = (t) => {
  if (!t) return null;
  const rawId = t._id || t.id || '';
  const projObj = typeof t.projectId === 'object' ? t.projectId : null;
  const empObj = typeof t.assignedEmployee === 'object' ? t.assignedEmployee : null;
  const deptObj = typeof t.departmentId === 'object' ? t.departmentId : null;

  const displayId = rawId ? (rawId.startsWith('TSK-') ? rawId : `TSK-${rawId.slice(-5).toUpperCase()}`) : 'TSK-000';
  const taskName = t.taskName || t.title || t.name || 'Untitled Task';

  const checklistArr = Array.isArray(t.checklist) ? t.checklist.map(c => ({
    _id: c._id || c.id,
    id: c._id || c.id,
    text: c.text || '',
    isCompleted: Boolean(c.isCompleted || c.checked),
    checked: Boolean(c.isCompleted || c.checked)
  })) : [];

  const completedChecklistCount = checklistArr.filter(c => c.isCompleted).length;
  const computedProgress = checklistArr.length > 0 
    ? Math.round((completedChecklistCount / checklistArr.length) * 100)
    : (t.status === 'Completed' ? 100 : (t.status === 'Approved' || t.status === 'Review' ? 80 : 30));

  return {
    _id: rawId,
    id: displayId,
    taskName,
    title: taskName,
    name: taskName,
    description: t.description || '',
    projectId: projObj ? (projObj._id || projObj.id) : (t.projectId || t.project || ''),
    projectName: projObj ? (projObj.projectName || projObj.name) : (t.project || t.projectName || 'General Project'),
    project: projObj ? (projObj.projectName || projObj.name) : (t.project || t.projectName || 'General Project'),
    departmentId: deptObj ? (deptObj._id || deptObj.id) : (t.departmentId || t.dept || ''),
    departmentName: deptObj ? deptObj.name : (t.dept || t.departmentName || 'Architecture'),
    dept: deptObj ? deptObj.name : (t.dept || t.departmentName || 'Architecture'),
    assignedEmployeeId: empObj ? (empObj._id || empObj.id) : (t.assignedEmployee || t.assignee || ''),
    assignedEmployeeName: empObj ? (empObj.name || empObj.fullName || empObj.email) : (t.assignee || (typeof t.assignedEmployee === 'string' ? t.assignedEmployee : 'Assigned Staff')),
    assignee: empObj ? (empObj.name || empObj.fullName || empObj.email) : (t.assignee || (typeof t.assignedEmployee === 'string' ? t.assignedEmployee : 'Assigned Staff')),
    assignedEmployeeObj: empObj,
    priority: t.priority || 'Medium',
    status: t.status || 'Pending',
    estimatedTime: typeof t.estimatedTime === 'number' ? t.estimatedTime : (t.estTime || 12),
    estTime: typeof t.estimatedTime === 'number' ? t.estimatedTime : (t.estTime || 12),
    startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : null,
    endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : null,
    deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : (t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : 'No Due Date'),
    dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn : [],
    checklist: checklistArr,
    progress: computedProgress,
    attachments: Array.isArray(t.attachments) ? t.attachments : [],
    actualStartTime: t.actualStartTime || null,
    completionTime: t.completionTime || null,
    totalWorkingTimeMinutes: t.totalWorkingTimeMinutes || 0,
    idleTimeMinutes: t.idleTimeMinutes || null,
    productivityScore: t.productivityScore || null,
    isDelayed: Boolean(t.isDelayed),
    createdAt: t.createdAt || null,
    createdBy: t.createdBy || null,
    rejectionReason: t.rejectionReason || null
  };
};



