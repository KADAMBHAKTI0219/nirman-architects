import api, { isMockSession } from './auth';
import * as mockApi from './mockApi';

/**
 * ERP Module 2 - Task Management System API Services
 * Direct backend endpoints matching client controllers & models (24.1 to 24.15):
 * With automatic mock fallback when offline or in mock session mode.
 */

export const createTask = async (taskData) => {
  if (isMockSession()) return await mockApi.createTask(taskData);

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

  try {
    const response = await api.post('/tasks/create', payload);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.createTask(taskData);
  }
  return await mockApi.createTask(taskData);
};

export const getTasks = async (params = {}) => {
  if (isMockSession()) return await mockApi.getTasks(params);

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
  } catch (err) {
    return await mockApi.getTasks(params);
  }
  return await mockApi.getTasks(params);
};

export const getTaskById = async (id) => {
  if (isMockSession()) return await mockApi.getTaskById(id);

  try {
    const response = await api.get(`/tasks/${id}`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.getTaskById(id);
  }
  return await mockApi.getTaskById(id);
};

export const updateTask = async (id, taskData) => {
  if (isMockSession()) return await mockApi.updateTask(id, taskData);

  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.updateTask(id, taskData);
  }
  return await mockApi.updateTask(id, taskData);
};

export const acceptTask = async (id) => {
  if (isMockSession()) return await mockApi.acceptTask(id);

  try {
    const response = await api.put(`/tasks/${id}/accept`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.acceptTask(id);
  }
  return await mockApi.acceptTask(id);
};

export const rejectTask = async (id, reason = '') => {
  if (isMockSession()) return await mockApi.rejectTask(id, reason);

  try {
    const response = await api.put(`/tasks/${id}/reject`, { reason });
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.rejectTask(id, reason);
  }
  return await mockApi.rejectTask(id, reason);
};

export const startTask = async (id) => {
  if (isMockSession()) return await mockApi.startTask(id);

  try {
    const response = await api.put(`/tasks/${id}/start`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.startTask(id);
  }
  return await mockApi.startTask(id);
};

export const pauseTask = async (id, minutes = 0) => {
  if (isMockSession()) return { success: true, message: 'Task paused' };

  try {
    const response = await api.put(`/tasks/${id}/pause`, { minutes });
    if (response.data) return response.data;
  } catch (err) {
    return { success: true, message: 'Task paused' };
  }
  return { success: true, message: 'Task paused' };
};

export const stopTask = async (id, payload = {}) => {
  if (isMockSession()) return { success: true, message: 'Task stopped and time logged' };

  try {
    const response = await api.put(`/tasks/${id}/stop`, payload);
    if (response.data) return response.data;
  } catch (err) {
    return { success: true, message: 'Task stopped and time logged' };
  }
  return { success: true, message: 'Task stopped and time logged' };
};

export const logTaskTime = async (id, payload = {}) => {
  if (isMockSession()) return { success: true, message: 'Time logged successfully' };

  try {
    const response = await api.post(`/tasks/${id}/log-time`, payload);
    if (response.data) return response.data;
  } catch (err) {
    return { success: true, message: 'Time logged successfully' };
  }
  return { success: true, message: 'Time logged successfully' };
};


export const submitTaskForReview = async (id) => {
  if (isMockSession()) return await mockApi.submitTaskForReview(id);

  try {
    const response = await api.put(`/tasks/${id}/submit-for-review`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.submitTaskForReview(id);
  }
  return await mockApi.submitTaskForReview(id);
};

export const approveTask = async (id) => {
  if (isMockSession()) return await mockApi.approveTask(id);

  try {
    const response = await api.put(`/tasks/${id}/approve`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.approveTask(id);
  }
  return await mockApi.approveTask(id);
};

export const completeTask = async (id) => {
  if (isMockSession()) return await mockApi.completeTask(id);

  try {
    const response = await api.put(`/tasks/${id}/complete`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.completeTask(id);
  }
  return await mockApi.completeTask(id);
};

export const getTaskStatusHistory = async (id) => {
  if (isMockSession()) return await mockApi.getTaskStatusHistory(id);

  try {
    const response = await api.get(`/tasks/${id}/status-history`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.getTaskStatusHistory(id);
  }
  return await mockApi.getTaskStatusHistory(id);
};

export const reassignTask = async (id, reassignData) => {
  if (isMockSession()) return await mockApi.reassignTask(id, reassignData);

  try {
    const response = await api.put(`/tasks/${id}/reassign`, reassignData);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.reassignTask(id, reassignData);
  }
  return await mockApi.reassignTask(id, reassignData);
};

export const addChecklistItem = async (id, text) => {
  if (isMockSession()) return await mockApi.addChecklistItem(id, text);

  try {
    const response = await api.post(`/tasks/${id}/checklist/add`, { text });
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.addChecklistItem(id, text);
  }
  return await mockApi.addChecklistItem(id, text);
};

export const toggleChecklistItem = async (id, itemId) => {
  if (isMockSession()) return await mockApi.toggleChecklistItem(id, itemId);

  try {
    const response = await api.put(`/tasks/${id}/checklist/${itemId}/toggle`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.toggleChecklistItem(id, itemId);
  }
  return await mockApi.toggleChecklistItem(id, itemId);
};

export const deleteChecklistItem = async (id, itemId) => {
  if (isMockSession()) return await mockApi.deleteChecklistItem(id, itemId);

  try {
    const response = await api.delete(`/tasks/${id}/checklist/${itemId}`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.deleteChecklistItem(id, itemId);
  }
  return await mockApi.deleteChecklistItem(id, itemId);
};

export const addTaskComment = async (id, commentText) => {
  if (isMockSession()) return await mockApi.addTaskComment(id, commentText);

  try {
    const response = await api.post(`/tasks/${id}/comments/add`, { commentText });
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.addTaskComment(id, commentText);
  }
  return await mockApi.addTaskComment(id, commentText);
};

export const getTaskComments = async (id) => {
  if (isMockSession()) return await mockApi.getTaskComments(id);

  try {
    const response = await api.get(`/tasks/${id}/comments`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.getTaskComments(id);
  }
  return await mockApi.getTaskComments(id);
};

export const getTaskTimeAnalysis = async (id) => {
  if (isMockSession()) return await mockApi.getTaskTimeAnalysis(id);

  try {
    const response = await api.get(`/tasks/${id}/time-analysis`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.getTaskTimeAnalysis(id);
  }
  return await mockApi.getTaskTimeAnalysis(id);
};

export const getOverdueTasks = async () => {
  if (isMockSession()) return await mockApi.getOverdueTasks();

  try {
    const response = await api.get('/tasks/overdue');
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.getOverdueTasks();
  }
  return await mockApi.getOverdueTasks();
};

export const getPendingReviewTooLongTasks = async () => {
  if (isMockSession()) return await mockApi.getPendingReviewTooLongTasks();

  try {
    const response = await api.get('/tasks/pending-review-too-long');
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.getPendingReviewTooLongTasks();
  }
  return await mockApi.getPendingReviewTooLongTasks();
};

export const getProjectTasksBreakdown = async (projectId) => {
  if (isMockSession()) return await mockApi.getProjectTasksBreakdown(projectId);

  try {
    const response = await api.get(`/projects/${projectId}/tasks/breakdown`);
    if (response.data) return response.data;
  } catch (err) {
    return await mockApi.getProjectTasksBreakdown(projectId);
  }
  return await mockApi.getProjectTasksBreakdown(projectId);
};

