import api from './auth';

/**
 * ERP Module 2 - Task Management System API Services
 * Direct backend endpoints matching client.txt controllers & models (24.1 to 24.15):
 * 1. POST /tasks/create (24.1)
 * 2. GET /tasks (24.2)
 * 3. GET /tasks/:id (24.3)
 * 4. PUT /tasks/:id (24.4)
 * 5. PUT /tasks/:id/accept (24.5)
 * 6. PUT /tasks/:id/reject (24.5)
 * 7. PUT /tasks/:id/start (24.6)
 * 8. PUT /tasks/:id/submit-for-review (24.7)
 * 9. PUT /tasks/:id/approve (24.7)
 * 10. PUT /tasks/:id/complete (24.8)
 * 11. GET /tasks/:id/status-history (24.9)
 * 12. PUT /tasks/:id/reassign (24.10)
 * 13. POST /tasks/:id/checklist/add, PUT /toggle, DELETE /:itemId (24.11)
 * 14. POST /tasks/:id/comments/add & GET /tasks/:id/comments (24.12)
 * 15. GET /tasks/:id/time-analysis (24.13)
 * 16. GET /tasks/overdue & GET /tasks/pending-review-too-long (24.14)
 * 17. GET /projects/:projectId/tasks/breakdown (24.15)
 */

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks/create', taskData);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
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
    console.error("Error fetching tasks from backend:", err);
    return { success: false, tasks: [], message: err.response?.data?.message || err.message };
  }
};

export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (err) {
    return { success: false, task: null, message: err.response?.data?.message || err.message };
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const acceptTask = async (id) => {
  try {
    const response = await api.put(`/tasks/${id}/accept`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const rejectTask = async (id, reason = '') => {
  try {
    const response = await api.put(`/tasks/${id}/reject`, { reason });
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const startTask = async (id) => {
  try {
    const response = await api.put(`/tasks/${id}/start`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const submitTaskForReview = async (id) => {
  try {
    const response = await api.put(`/tasks/${id}/submit-for-review`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const approveTask = async (id) => {
  try {
    const response = await api.put(`/tasks/${id}/approve`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const completeTask = async (id) => {
  try {
    const response = await api.put(`/tasks/${id}/complete`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const getTaskStatusHistory = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}/status-history`);
    return response.data;
  } catch (err) {
    return { success: false, history: [], message: err.response?.data?.message || err.message };
  }
};

export const reassignTask = async (id, reassignData) => {
  try {
    const response = await api.put(`/tasks/${id}/reassign`, reassignData);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const addChecklistItem = async (id, text) => {
  try {
    const response = await api.post(`/tasks/${id}/checklist/add`, { text });
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const toggleChecklistItem = async (id, itemId) => {
  try {
    const response = await api.put(`/tasks/${id}/checklist/${itemId}/toggle`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const deleteChecklistItem = async (id, itemId) => {
  try {
    const response = await api.delete(`/tasks/${id}/checklist/${itemId}`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const addTaskComment = async (id, commentText) => {
  try {
    const response = await api.post(`/tasks/${id}/comments/add`, { commentText });
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const getTaskComments = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}/comments`);
    return response.data;
  } catch (err) {
    return { success: false, comments: [], message: err.response?.data?.message || err.message };
  }
};

export const getTaskTimeAnalysis = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}/time-analysis`);
    return response.data;
  } catch (err) {
    return { success: false, timeAnalysis: null, message: err.response?.data?.message || err.message };
  }
};

export const getOverdueTasks = async () => {
  try {
    const response = await api.get('/tasks/overdue');
    return response.data;
  } catch (err) {
    return { success: false, tasks: [], message: err.response?.data?.message || err.message };
  }
};

export const getPendingReviewTooLongTasks = async () => {
  try {
    const response = await api.get('/tasks/pending-review-too-long');
    return response.data;
  } catch (err) {
    return { success: false, tasks: [], message: err.response?.data?.message || err.message };
  }
};

export const getProjectTasksBreakdown = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/tasks/breakdown`);
    return response.data;
  } catch (err) {
    return { success: false, breakdown: null, message: err.response?.data?.message || err.message };
  }
};
